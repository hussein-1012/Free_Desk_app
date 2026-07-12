// import { InventoryRepository } from '../repositories/inventory.repository';
// import { ApiResponse, QueryParams } from '@shared/types';
// import { inventoryCountSchema, stockAdjustmentSchema } from '@shared/schemas';

// export class InventoryService {
//   private inventoryRepo = new InventoryRepository();

//   // Stock takes / physical count
//   async getInventoryCounts(params: QueryParams): Promise<ApiResponse<any>> {
//     try {
//       const result = await this.inventoryRepo.getCounts(params);
//       return { success: true, data: result };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'حدث خطأ أثناء جلب مستندات الجرد' };
//     }
//   }

//   async getInventoryCountById(id: string): Promise<ApiResponse<any>> {
//     try {
//       const count = await this.inventoryRepo.findCountById(id);
//       if (!count) return { success: false, error: 'مستند الجرد غير موجود' };
//       return { success: true, data: count };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'حدث خطأ أثناء جلب تفاصيل الجرد' };
//     }
//   }

//   async createInventoryCount(data: any, createdById: string): Promise<ApiResponse<any>> {
//     try {
//       const validated = inventoryCountSchema.parse(data);
//       const count = await this.inventoryRepo.createCount({
//         ...validated,
//         createdById,
//       });
//       return { success: true, data: count, message: 'تم تسجيل عملية جرد المخزون بنجاح' };
//     } catch (error: any) {
//       if (error?.errors) {
//         return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
//       }
//       return { success: false, error: error.message || 'فشل في تسجيل عملية الجرد' };
//     }
//   }

//   // Adjustments
//   async createStockAdjustment(data: any, createdById: string): Promise<ApiResponse<any>> {
//     try {
//       const validated = stockAdjustmentSchema.parse(data);
//       const adjustment = await this.inventoryRepo.createAdjustment({
//         ...validated,
//         createdById,
//       });
//       return { success: true, data: adjustment, message: 'تم تسوية المخزون بنجاح' };
//     } catch (error: any) {
//       if (error?.errors) {
//         return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
//       }
//       return { success: false, error: error.message || 'فشل في تسوية المخزون' };
//     }
//   }

//   async getStockAdjustments(params: QueryParams): Promise<ApiResponse<any>> {
//     try {
//       const result = await this.inventoryRepo.getAdjustments(params);
//       return { success: true, data: result };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'حدث خطأ أثناء جلب تسويات المخزون' };
//     }
//   }

//   // Movements log
//   async getInventoryMovements(params: QueryParams): Promise<ApiResponse<any>> {
//     try {
//       const result = await this.inventoryRepo.getMovements(params);
//       return { success: true, data: result };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'حدث خطأ أثناء جلب حركات المخزون' };
//     }
//   }

//   // Transfers
//   async createInventoryTransfer(data: any, createdById: string): Promise<ApiResponse<any>> {
//     try {
//       const transfer = await this.inventoryRepo.createTransfer({
//         ...data,
//         createdById,
//       });
//       return { success: true, data: transfer, message: 'تم تسجيل نقل المخزون بنجاح' };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'فشل في تسجيل نقل المخزون' };
//     }
//   }

//   async getInventoryTransfers(params: QueryParams): Promise<ApiResponse<any>> {
//     try {
//       const result = await this.inventoryRepo.getTransfers(params);
//       return { success: true, data: result };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'حدث خطأ أثناء جلب عمليات النقل' };
//     }
//   }

//   async getInventoryTransferById(id: string): Promise<ApiResponse<any>> {
//     try {
//       const transfer = await this.inventoryRepo.findTransferById(id);
//       if (!transfer) return { success: false, error: 'مستند نقل المخزون غير موجود' };
//       return { success: true, data: transfer };
//     } catch (error: any) {
//       return { success: false, error: error.message || 'حدث خطأ أثناء جلب تفاصيل عملية النقل' };
//     }
//   }
// }

import { InventoryRepository } from '../repositories/inventory.repository';
import { ApiResponse, QueryParams } from '@shared/types';
import { inventoryCountSchema } from '@shared/schemas';

export class InventoryService {
  private inventoryRepo = new InventoryRepository();

  async getInventoryCounts(params: QueryParams): Promise<ApiResponse<any>> {
    try {
      const result = await this.inventoryRepo.getCounts(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب مستندات الجرد' };
    }
  }

  async getInventoryCountById(id: string): Promise<ApiResponse<any>> {
    try {
      const count = await this.inventoryRepo.findCountById(id);
      if (!count) return { success: false, error: 'مستند الجرد غير موجود' };
      return { success: true, data: count };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب تفاصيل الجرد' };
    }
  }

  async createInventoryCount(data: any, createdById: string): Promise<ApiResponse<any>> {
    try {
      const validated = inventoryCountSchema.parse(data);
      const count = await this.inventoryRepo.createCount({
        ...validated,
        createdById,
      });
      return { success: true, data: count, message: 'تم تسجيل عملية جرد المخزون بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في تسجيل عملية الجرد' };
    }
  }

  async deleteInventoryCount(id: string): Promise<ApiResponse<any>> {
    try {
      await this.inventoryRepo.deleteCount(id);
      return { success: true, message: 'تم حذف مستند الجرد بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في حذف مستند الجرد' };
    }
  }

  async getInventoryMovements(params: QueryParams): Promise<ApiResponse<any>> {
    try {
      const result = await this.inventoryRepo.getMovements(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب حركات المخزون' };
    }
  }
}