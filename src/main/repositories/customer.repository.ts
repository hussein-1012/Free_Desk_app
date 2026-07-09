// مستودع العملاء مع دعم رقم اللوحة وسجل العداد
import { BaseRepository } from './base.repository';
import { Customer } from '@shared/types';
import { getPrismaClient } from '../database/prisma-client';

export class CustomerRepository extends BaseRepository<Customer> {
  private get prismaClient() {
    return getPrismaClient();
  }

  constructor() {
    super('customer');
  }

  /** كشف حساب العميل */
  async getStatement(customerId: string): Promise<any[]> {
    const [invoices, transactions] = await Promise.all([
      this.prismaClient.saleInvoice.findMany({
        where: { customerId },
        orderBy: { date: 'asc' },
      }),
      this.prismaClient.cashTransaction.findMany({
        where: { customerId },
        orderBy: { date: 'asc' },
      }),
    ]);

    const statement = [
      ...invoices.map((inv) => ({
        id: inv.id,
        date: inv.date,
        type: inv.isReturn ? 'مرتجع' : 'فاتورة بيع',
        reference: inv.invoiceNumber,
        debit: inv.isReturn ? 0 : inv.total,
        credit: inv.isReturn ? inv.total : 0,
        balanceEffect: inv.isReturn ? -inv.total : inv.total,
      })),
      ...transactions.map((tx) => ({
        id: tx.id,
        date: tx.date,
        type: tx.type === 'receipt' ? 'تحصيل نقدي' : 'معاملة نقدية',
        reference: tx.description,
        debit: 0,
        credit: tx.type === 'receipt' || tx.type === 'income' ? tx.amount : 0,
        balanceEffect: tx.type === 'receipt' || tx.type === 'income' ? -tx.amount : tx.amount,
      })),
    ];

    return statement.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async updateBalance(id: string, amount: number): Promise<Customer> {
    return this.prismaClient.customer.update({
      where: { id },
      data: { balance: { increment: amount } },
    }) as unknown as Customer;
  }

  /** إضافة قراءة عداد */
  async addOdometerReading(data: {
    customerId: string;
    reading: number;
    date: Date;
    invoiceId?: string;
    notes?: string;
  }): Promise<any> {
    return this.prismaClient.odometerReading.create({ data });
  }

  /** جلب سجل قراءات العداد لعميل معين */
  async getOdometerHistory(customerId: string): Promise<any[]> {
    return this.prismaClient.odometerReading.findMany({
      where: { customerId },
      orderBy: { date: 'desc' },
    });
  }

  protected getSearchFields(): string[] {
    return ['name', 'phone', 'email', 'carNumber'];
  }
}
