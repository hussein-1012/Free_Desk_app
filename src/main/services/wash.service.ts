// خدمة غسيل السيارات والدراجات
import { WashRepository } from '../repositories/wash.repository';
import { washOrderSchema } from '@shared/schemas';
import { ApiResponse, WashOrder } from '@shared/types';
import { getPrismaClient } from '../database/prisma-client';

export class WashService {
  private washRepo = new WashRepository();
  private get db() { return getPrismaClient(); }

  /** توليد رقم طلب تلقائي */
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const prefix = `W${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const count = await this.db.washOrder.count({
      where: { orderNumber: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  async getWashOrders(params: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.washRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب طلبات الغسيل' };
    }
  }

  async getWashOrderById(id: string): Promise<ApiResponse<WashOrder>> {
    try {
      const order = await this.washRepo.findById(id);
      if (!order) return { success: false, error: 'الطلب غير موجود' };
      return { success: true, data: order as any };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب بيانات الطلب' };
    }
  }

  async createWashOrder(data: any, userId: string): Promise<ApiResponse<WashOrder>> {
    try {
      // توليد رقم الطلب تلقائياً إذا لم يُوفَّر
      if (!data.orderNumber) {
        data.orderNumber = await this.generateOrderNumber();
      }

      const validated = washOrderSchema.parse(data);

      const order = await this.washRepo.create({
        ...validated,
        createdById: userId,
      });

      // إضافة معاملة نقدية إذا تم الدفع
      if (validated.paid > 0) {
        await this.db.cashTransaction.create({
          data: {
            type: 'income',
            amount: validated.paid,
            description: `دفعة غسيل — طلب ${order.orderNumber}`,
            washOrderId: order.id,
            createdById: userId,
          },
        });
      }

      return { success: true, data: order as any, message: 'تم إنشاء طلب الغسيل بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في إنشاء طلب الغسيل' };
    }
  }

  async updateWashOrder(id: string, data: any): Promise<ApiResponse<WashOrder>> {
    try {
      const existing = await this.washRepo.findById(id);
      if (!existing) return { success: false, error: 'الطلب غير موجود' };

      const validated = washOrderSchema.parse(data);

      const order = await this.washRepo.update(id, {
        customerId: validated.customerId,
        customerName: validated.customerName,
        customerPhone: validated.customerPhone,
        vehicleType: validated.vehicleType,
        vehiclePlate: validated.vehiclePlate,
        serviceType: validated.serviceType,
        deliveryDate: validated.deliveryDate,
        price: validated.price,
        paid: validated.paid,
        notes: validated.notes,
      });

      return { success: true, data: order as any, message: 'تم تحديث الطلب بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في تحديث الطلب' };
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<WashOrder>> {
    try {
      const validStatuses = ['received', 'washing', 'ready', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: 'حالة الطلب غير صالحة' };
      }

      const order = await this.washRepo.updateStatus(id, status);
      return { success: true, data: order as any, message: 'تم تحديث حالة الطلب' };
    } catch (error: any) {
      return { success: false, error: 'فشل في تحديث حالة الطلب' };
    }
  }

  async deleteWashOrder(id: string): Promise<ApiResponse<void>> {
    try {
      const existing = await this.washRepo.findById(id);
      if (!existing) return { success: false, error: 'الطلب غير موجود' };
      if (existing.status === 'delivered') {
        return { success: false, error: 'لا يمكن حذف طلب تم تسليمه' };
      }
      await this.washRepo.delete(id);
      return { success: true, message: 'تم حذف الطلب بنجاح' };
    } catch (error: any) {
      return { success: false, error: 'فشل في حذف الطلب' };
    }
  }

  async getWashOrdersCountByStatus(): Promise<ApiResponse<any>> {
    try {
      const counts = await this.washRepo.countByStatus();
      return { success: true, data: counts };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب إحصائيات الطلبات' };
    }
  }

  async getTodayWashOrders(): Promise<ApiResponse<WashOrder[]>> {
    try {
      const orders = await this.washRepo.getTodayOrders();
      return { success: true, data: orders as any[] };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب طلبات اليوم' };
    }
  }
}
