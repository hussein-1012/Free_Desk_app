import { PartnerRepository } from '../repositories/partner.repository';
import { ApiResponse, QueryParams } from '@shared/types';
import { partnerSchema, partnerWithdrawalSchema, businessExpenseSchema } from '@shared/schemas';

export class PartnerService {
  private partnerRepo = new PartnerRepository();

  // Partners CRUD
  async getPartners(params: QueryParams): Promise<ApiResponse<any>> {
    try {
      const result = await this.partnerRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getPartnerById(id: string): Promise<ApiResponse<any>> {
    try {
      const partner = await this.partnerRepo.findById(id);
      if (!partner) return { success: false, error: 'الشريك غير موجود' };
      return { success: true, data: partner };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createPartner(data: any): Promise<ApiResponse<any>> {
    try {
      const validated = partnerSchema.parse(data);
      const partner = await this.partnerRepo.create(validated);
      return { success: true, data: partner, message: 'تم إضافة الشريك بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updatePartner(id: string, data: any): Promise<ApiResponse<any>> {
    try {
      const validated = partnerSchema.parse(data);
      const partner = await this.partnerRepo.update(id, validated);
      return { success: true, data: partner, message: 'تم تحديث بيانات الشريك بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deletePartner(id: string): Promise<ApiResponse<any>> {
    try {
      await this.partnerRepo.delete(id);
      return { success: true, message: 'تم حذف الشريك بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Withdrawals
  async addWithdrawal(data: any, createdById?: string): Promise<ApiResponse<any>> {
    try {
      const validated = partnerWithdrawalSchema.parse(data);
      const withdrawal = await this.partnerRepo.createWithdrawal(validated, createdById);
      return { success: true, data: withdrawal, message: 'تم تسجيل السحب بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في تسجيل السحب' };
    }
  }

  async getWithdrawals(partnerId?: string): Promise<ApiResponse<any[]>> {
    try {
      const withdrawals = await this.partnerRepo.getWithdrawals(partnerId);
      return { success: true, data: withdrawals };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب المسحوبات' };
    }
  }

  // Expenses
  async addExpense(data: any, createdById?: string): Promise<ApiResponse<any>> {
    try {
      const validated = businessExpenseSchema.parse(data);
      const expense = await this.partnerRepo.createExpense(validated, createdById);
      return { success: true, data: expense, message: 'تم تسجيل المصروف بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في تسجيل المصروف' };
    }
  }

  async getExpenses(params: QueryParams): Promise<ApiResponse<any>> {
    try {
      const result = await this.partnerRepo.getExpenses(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب المصروفات' };
    }
  }

  // Distributions
  async distributeProfit(data: any, createdById?: string): Promise<ApiResponse<any>> {
    try {
      const distribution = await this.partnerRepo.distributeProfit(data, createdById);
      return { success: true, data: distribution, message: 'تم توزيع الأرباح بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في توزيع الأرباح' };
    }
  }

  async getDistributions(): Promise<ApiResponse<any[]>> {
    try {
      const distributions = await this.partnerRepo.getDistributions();
      return { success: true, data: distributions };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
