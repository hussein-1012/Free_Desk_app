import { PurchaseInvoiceRepository, SaleInvoiceRepository } from '../repositories/invoice.repository';
import { ApiResponse } from '@shared/types';
import { purchaseInvoiceSchema, saleInvoiceSchema } from '@shared/schemas';

export class InvoiceService {
  private purchaseRepo = new PurchaseInvoiceRepository();
  private saleRepo = new SaleInvoiceRepository();

  // Purchases
  async getPurchaseInvoices(params: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.purchaseRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب فواتير الشراء' };
    }
  }

  async getPurchaseInvoiceById(id: string): Promise<ApiResponse<any>> {
    try {
      const invoice = await this.purchaseRepo.findById(id);
      if (!invoice) return { success: false, error: 'الفاتورة غير موجودة' };
      return { success: true, data: invoice };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب تفاصيل الفاتورة' };
    }
  }

  async createPurchaseInvoice(data: any, createdById: string): Promise<ApiResponse<any>> {
    try {
      const items = data.items || [];
      const subtotal = items.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount) || 0) / 100));
      }, 0);

      const discount = Number(data.discount) || 0;
      const tax = Number(data.tax) || 0;
      const total = subtotal - discount + tax;
      
      const paid = Number(data.paid) || 0;
      let status = data.status;
      if (!status) {
        if (paid >= total) status = 'paid';
        else if (paid > 0) status = 'partial';
        else status = 'confirmed';
      }

      const invoiceNumber = data.invoiceNumber || `ش-${Math.floor(100000 + Math.random() * 900000)}`;
      const date = data.date ? new Date(data.date) : new Date();

      const invoiceData = {
        ...data,
        invoiceNumber,
        date,
        subtotal,
        total,
        discount,
        tax,
        paid,
        status,
        items,
      };

      const validated = purchaseInvoiceSchema.parse(invoiceData);
      const invoice = await this.purchaseRepo.create({
        ...validated,
        createdById,
      });
      return { success: true, data: invoice, message: 'تم إنشاء فاتورة الشراء بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في إنشاء فاتورة الشراء' };
    }
  }

  async deletePurchaseInvoice(id: string): Promise<ApiResponse<any>> {
    try {
      await this.purchaseRepo.delete(id);
      return { success: true, message: 'تم حذف فاتورة الشراء بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في حذف فاتورة الشراء' };
    }
  }

  // Sales
  async getSaleInvoices(params: any): Promise<ApiResponse<any>> {
    try {
      const result = await this.saleRepo.findMany(params);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب فواتير البيع' };
    }
  }

  async getSaleInvoiceById(id: string): Promise<ApiResponse<any>> {
    try {
      const invoice = await this.saleRepo.findById(id);
      if (!invoice) return { success: false, error: 'الفاتورة غير موجودة' };
      return { success: true, data: invoice };
    } catch (error: any) {
      return { success: false, error: error.message || 'حدث خطأ أثناء جلب تفاصيل الفاتورة' };
    }
  }

  async createSaleInvoice(data: any, createdById: string): Promise<ApiResponse<any>> {
    try {
      const items = data.items || [];
      const accessoryItems = data.accessoryItems || [];

      const subtotal = items.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount) || 0) / 100));
      }, 0) + accessoryItems.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount) || 0) / 100));
      }, 0);

      const discount = Number(data.discount) || 0;
      const tax = Number(data.tax) || 0;
      const total = subtotal - discount + tax;
      
      const paid = Number(data.paid) || 0;
      let status = data.status;
      if (!status) {
        if (paid >= total) status = 'paid';
        else if (paid > 0) status = 'partial';
        else status = 'confirmed';
      }

      const invoiceNumber = data.invoiceNumber || `س-${Math.floor(100000 + Math.random() * 900000)}`;
      const date = data.date ? new Date(data.date) : new Date();

      const invoiceData = {
        ...data,
        invoiceNumber,
        date,
        subtotal,
        total,
        discount,
        tax,
        paid,
        status,
        items,
        accessoryItems,
      };

      const validated = saleInvoiceSchema.parse(invoiceData);
      const invoice = await this.saleRepo.create({
        ...validated,
        createdById,
      });
      return { success: true, data: invoice, message: 'تم إنشاء فاتورة البيع بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في إنشاء فاتورة البيع' };
    }
  }

  async deleteSaleInvoice(id: string): Promise<ApiResponse<any>> {
    try {
      await this.saleRepo.delete(id);
      return { success: true, message: 'تم حذف فاتورة البيع بنجاح' };
    } catch (error: any) {
      return { success: false, error: error.message || 'فشل في حذف فاتورة البيع' };
    }
  }

  async createSaleReturn(originalInvoiceId: string, data: any, createdById: string): Promise<ApiResponse<any>> {
    try {
      const original = await this.saleRepo.findById(originalInvoiceId);
      if (!original) return { success: false, error: 'الفاتورة الأصلية غير موجودة' };

      const items = data.items || [];
      const accessoryItems = data.accessoryItems || [];

      const subtotal = items.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount) || 0) / 100));
      }, 0) + accessoryItems.reduce((acc: number, item: any) => {
        return acc + (Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount) || 0) / 100));
      }, 0);

      const discount = Number(data.discount) || 0;
      const tax = Number(data.tax) || 0;
      const total = subtotal - discount + tax;
      
      const paid = Number(data.paid) || 0;
      let status = data.status;
      if (!status) {
        if (paid >= total) status = 'paid';
        else if (paid > 0) status = 'partial';
        else status = 'confirmed';
      }

      const invoiceNumber = data.invoiceNumber || `م-${Math.floor(100000 + Math.random() * 900000)}`;
      const date = data.date ? new Date(data.date) : new Date();

      const invoiceData = {
        ...data,
        invoiceNumber,
        date,
        subtotal,
        total,
        discount,
        tax,
        paid,
        status,
        items,
        accessoryItems,
        isReturn: true,
        originalInvoiceId,
      };

      const validated = saleInvoiceSchema.parse(invoiceData);

      const returnInvoice = await this.saleRepo.create({
        ...validated,
        createdById,
      });

      return { success: true, data: returnInvoice, message: 'تم إنشاء فاتورة المرتجع بنجاح' };
    } catch (error: any) {
      if (error?.errors) {
        return { success: false, error: error.errors[0]?.message || 'بيانات غير صالحة' };
      }
      return { success: false, error: error.message || 'فشل في إنشاء فاتورة المرتجع' };
    }
  }
}
