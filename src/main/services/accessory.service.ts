// خدمة الإكسسوارات
import { AccessoryRepository } from '../repositories/accessory.repository';
import { accessorySchema } from '@shared/schemas';
import { ApiResponse, Accessory } from '@shared/types';

export class AccessoryService {
  private accessoryRepo = new AccessoryRepository();

  async getAccessories(params: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.accessoryRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب الإكسسوارات' };
    }
  }

  async getAccessoryById(id: string): Promise<ApiResponse<Accessory>> {
    try {
      const accessory = await this.accessoryRepo.findById(id);
      if (!accessory) return { success: false, error: 'الإكسسوار غير موجود' };
      return { success: true, data: accessory as any };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب بيانات الإكسسوار' };
    }
  }

  async findByBarcode(barcode: string): Promise<ApiResponse<Accessory>> {
    try {
      const accessory = await this.accessoryRepo.findByBarcode(barcode);
      if (!accessory) return { success: false, error: 'الإكسسوار غير موجود' };
      return { success: true, data: accessory as any };
    } catch (error: any) {
      return { success: false, error: 'فشل في البحث بالباركود' };
    }
  }

  async createAccessory(data: any): Promise<ApiResponse<Accessory>> {
    try {
      const validated = accessorySchema.parse(data);
      if (validated.barcode) {
        const existing = await this.accessoryRepo.findByBarcode(validated.barcode);
        if (existing) {
          return { success: false, error: 'الباركود مستخدم بالفعل مع إكسسوار آخر' };
        }
      }
      const accessory = await this.accessoryRepo.create(validated);
      return { success: true, data: accessory as any, message: 'تم إضافة الإكسسوار بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في إضافة الإكسسوار' };
    }
  }

  async updateAccessory(id: string, data: any): Promise<ApiResponse<Accessory>> {
    try {
      const validated = accessorySchema.partial().parse(data);
      if (validated.barcode) {
        const existing = await this.accessoryRepo.findByBarcode(validated.barcode);
        if (existing && existing.id !== id) {
          return { success: false, error: 'الباركود مستخدم بالفعل مع إكسسوار آخر' };
        }
      }
      const accessory = await this.accessoryRepo.update(id, validated);
      return { success: true, data: accessory as any, message: 'تم تحديث الإكسسوار بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في تحديث الإكسسوار' };
    }
  }

  async deleteAccessory(id: string): Promise<ApiResponse<void>> {
    try {
      const existing = await this.accessoryRepo.findById(id);
      if (!existing) return { success: false, error: 'الإكسسوار غير موجود' };
      await this.accessoryRepo.delete(id);
      return { success: true, message: 'تم حذف الإكسسوار بنجاح' };
    } catch (error: any) {
      return { success: false, error: 'فشل في حذف الإكسسوار' };
    }
  }

  async getLowStockAccessories(): Promise<ApiResponse<Accessory[]>> {
    try {
      // Using raw query since Prisma doesn't support field-to-field comparison
      const allAccessories = await this.accessoryRepo.findMany({ pageSize: 1000 });
      const lowStock = allAccessories.items.filter((a: any) => a.quantity <= a.minQuantity);
      return { success: true, data: lowStock as any[] };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب الإكسسوارات منخفضة المخزون' };
    }
  }
}
