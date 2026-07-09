import { SupplierRepository } from '../repositories/supplier.repository';
import { ApiResponse, PaginatedResult, QueryParams, Supplier } from '@shared/types';
import { supplierSchema } from '@shared/schemas';

export class SupplierService {
  private supplierRepo = new SupplierRepository();

  async getSuppliers(params: QueryParams): Promise<ApiResponse<PaginatedResult<Supplier>>> {
    try {
      const result = await this.supplierRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب الموردين' };
    }
  }

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const supplier = await this.supplierRepo.findById(id);
      if (!supplier) return { success: false, error: 'المورد غير موجود' };
      return { success: true, data: supplier };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب بيانات المورد' };
    }
  }

  async createSupplier(data: any): Promise<ApiResponse<Supplier>> {
    try {
      const validated = supplierSchema.parse(data);
      const supplier = await this.supplierRepo.create(validated);
      return { success: true, data: supplier, message: 'تم إضافة المورد بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في إضافة المورد' };
    }
  }

  async updateSupplier(id: string, data: any): Promise<ApiResponse<Supplier>> {
    try {
      const validated = supplierSchema.partial().parse(data);
      const supplier = await this.supplierRepo.update(id, validated);
      return { success: true, data: supplier, message: 'تم تحديث بيانات المورد بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في تحديث بيانات المورد' };
    }
  }

  async deleteSupplier(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const supplier = await this.supplierRepo.delete(id);
      return { success: true, data: supplier, message: 'تم حذف المورد بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في حذف المورد' };
    }
  }

  async getSupplierStatement(id: string): Promise<ApiResponse<any[]>> {
    try {
      const statement = await this.supplierRepo.getStatement(id);
      return { success: true, data: statement };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب كشف حساب المورد' };
    }
  }
}
