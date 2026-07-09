// خدمة العملاء مع دعم رقم اللوحة وسجل العداد
import { CustomerRepository } from '../repositories/customer.repository';
import { ApiResponse, PaginatedResult, QueryParams, Customer } from '@shared/types';
import { customerSchema, odometerReadingSchema } from '@shared/schemas';

export class CustomerService {
  private customerRepo = new CustomerRepository();

  async getCustomers(params: QueryParams): Promise<ApiResponse<PaginatedResult<Customer>>> {
    try {
      const result = await this.customerRepo.findMany(params);
      return { success: true, data: result as any };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب العملاء' };
    }
  }

  async getCustomerById(id: string): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.customerRepo.findById(id);
      if (!customer) return { success: false, error: 'العميل غير موجود' };
      return { success: true, data: customer };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب بيانات العميل' };
    }
  }

  async createCustomer(data: any): Promise<ApiResponse<Customer>> {
    try {
      const validated = customerSchema.parse(data);
      const customer = await this.customerRepo.create(validated as any);
      return { success: true, data: customer, message: 'تم إضافة العميل بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في إضافة العميل' };
    }
  }

  async updateCustomer(id: string, data: any): Promise<ApiResponse<Customer>> {
    try {
      const validated = customerSchema.parse(data);
      const customer = await this.customerRepo.update(id, validated as any);
      return { success: true, data: customer, message: 'تم تحديث بيانات العميل بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في تحديث بيانات العميل' };
    }
  }

  async deleteCustomer(id: string): Promise<ApiResponse<Customer>> {
    try {
      const customer = await this.customerRepo.delete(id);
      return { success: true, data: customer, message: 'تم حذف العميل بنجاح' };
    } catch (error: any) {
      return { success: false, error: 'فشل في حذف العميل' };
    }
  }

  async getCustomerStatement(id: string): Promise<ApiResponse<any[]>> {
    try {
      const statement = await this.customerRepo.getStatement(id);
      return { success: true, data: statement };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب كشف الحساب' };
    }
  }

  async addOdometerReading(data: any): Promise<ApiResponse<any>> {
    try {
      const validated = odometerReadingSchema.parse(data);
      const reading = await this.customerRepo.addOdometerReading({
        customerId: validated.customerId,
        reading: validated.reading,
        date: validated.date,
        invoiceId: validated.invoiceId ?? undefined,
        notes: validated.notes ?? undefined,
      });
      return { success: true, data: reading, message: 'تم تسجيل قراءة العداد بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: 'فشل في تسجيل قراءة العداد' };
    }
  }

  async getOdometerHistory(customerId: string): Promise<ApiResponse<any[]>> {
    try {
      const history = await this.customerRepo.getOdometerHistory(customerId);
      return { success: true, data: history };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب سجل قراءات العداد' };
    }
  }
}
