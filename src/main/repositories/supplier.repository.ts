// مستودع الموردين مع دفتر الحسابات
import { BaseRepository } from './base.repository';
import { Supplier } from '@shared/types';
import { getPrismaClient } from '../database/prisma-client';

export class SupplierRepository extends BaseRepository<Supplier> {
  private get prismaClient() {
    return getPrismaClient();
  }

  constructor() {
    super('supplier');
  }

  /** كشف حساب المورد */
  async getStatement(supplierId: string): Promise<any[]> {
    const [invoices, transactions] = await Promise.all([
      this.prismaClient.purchaseInvoice.findMany({
        where: { supplierId },
        orderBy: { date: 'asc' },
      }),
      this.prismaClient.cashTransaction.findMany({
        where: { supplierId },
        orderBy: { date: 'asc' },
      }),
    ]);

    const statement = [
      ...invoices.map((inv) => ({
        id: inv.id,
        date: inv.date,
        type: 'فاتورة شراء',
        reference: inv.invoiceNumber,
        debit: 0,
        credit: inv.total,
        balanceEffect: inv.total,
      })),
      ...transactions.map((tx) => ({
        id: tx.id,
        date: tx.date,
        type: 'دفعة نقدية',
        reference: tx.description,
        debit: tx.type === 'payment' ? tx.amount : 0,
        credit: 0,
        balanceEffect: -tx.amount,
      })),
    ];

    return statement.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async updateBalance(id: string, amount: number): Promise<Supplier> {
    return this.prismaClient.supplier.update({
      where: { id },
      data: { balance: { increment: amount } },
    }) as unknown as Supplier;
  }

  /** إضافة قيد في دفتر الحسابات */
  async addLedgerEntry(data: {
    supplierId: string;
    type: 'debit' | 'credit';
    amount: number;
    balance: number;
    description: string;
    referenceId?: string;
  }): Promise<any> {
    return this.prismaClient.supplierLedger.create({ data });
  }

  /** جلب دفتر حسابات المورد */
  async getLedger(supplierId: string): Promise<any[]> {
    return this.prismaClient.supplierLedger.findMany({
      where: { supplierId },
      orderBy: { date: 'asc' },
    });
  }

  protected getSearchFields(): string[] {
    return ['name', 'phone', 'email', 'companyName'];
  }
}
