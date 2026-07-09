import { OilProductRepository } from '../repositories/oil.repository';
import { ApiResponse, QueryParams } from '@shared/types';
import { oilProductSchema } from '@shared/schemas';

export class OilService {
  private oilRepo = new OilProductRepository();

  async getOilProducts(params: QueryParams): Promise<ApiResponse<any>> {
    try {
      const result = await this.oilRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب منتجات الزيوت' };
    }
  }

  async getOilProductById(id: string): Promise<ApiResponse<any>> {
    try {
      const item = await this.oilRepo.findById(id);
      if (!item) return { success: false, error: 'منتج الزيت غير موجود' };
      return { success: true, data: item };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب منتج الزيت' };
    }
  }

  async createOilProduct(data: any): Promise<ApiResponse<any>> {
    try {
      const validated = oilProductSchema.parse(data);
      const item = await this.oilRepo.create(validated);

      // تسجيل حركة مخزون أولية إذا كانت الكمية أكبر من صفر
      const initialQty = Number(validated.quantity) || 0;
      if (initialQty > 0) {
        await this.oilRepo.recordStockMovement({
          oilProductId: item.id,
          type: 'adjustment',
          unit: 'can',
          quantity: initialQty,
          notes: `إضافة منتج زيت جديد — الكمية: ${initialQty}`,
        });
      }
      return { success: true, data: item, message: 'تم إضافة منتج الزيت بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في إضافة منتج الزيت' };
    }
  }

  async updateOilProduct(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const validated = oilProductSchema.partial().parse(data);
      const item = await this.oilRepo.update(id, validated);
      return { success: true, data: item, message: 'تم تحديث منتج الزيت بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في تحديث منتج الزيت' };
    }
  }

  async deleteOilProduct(id: string): Promise<ApiResponse<any>> {
    try {
      await this.oilRepo.delete(id);
      return { success: true, message: 'تم حذف منتج الزيت' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في حذف منتج الزيت' };
    }
  }

  async getStockMovements(oilProductId: string): Promise<ApiResponse<any[]>> {
    try {
      const movements = await this.oilRepo.getStockMovements(oilProductId);
      return { success: true, data: movements };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب حركات المخزون' };
    }
  }

  async getNearExpiryProducts(daysAhead = 30): Promise<ApiResponse<any[]>> {
    try {
      const items = await this.oilRepo.findNearExpiry(daysAhead);
      return { success: true, data: items };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب المنتجات قاربة الانتهاء' };
    }
  }

  async getOpenContainers(oilProductId: string): Promise<ApiResponse<any[]>> {
    try {
      const containers = await this.oilRepo.getOpenContainers(oilProductId);
      return { success: true, data: containers };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب العلب المفتوحة' };
    }
  }
}