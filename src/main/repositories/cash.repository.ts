import { getPrismaClient } from '../database/prisma-client';
import { QueryParams } from '@shared/types';

export class CashRepository {
  private prisma = getPrismaClient();

  async create(data: any): Promise<any> {
    return this.prisma.cashTransaction.create({
      data,
    });
  }

  async findMany(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
    const { page = 1, pageSize = 20, filters = {} } = params;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.cashTransaction.findMany({
        where: filters,
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
        include: {
          customer: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          createdBy: { select: { id: true, username: true, name: true } },
        },
      }),
      this.prisma.cashTransaction.count({ where: filters }),
    ]);

    return { items, total };
  }

  async getBalance(): Promise<number> {
    const transactions = await this.prisma.cashTransaction.findMany({
      select: { type: true, amount: true },
    });

    return transactions.reduce((balance, tx) => {
      if (tx.type === 'income' || tx.type === 'receipt') {
        return balance + tx.amount;
      } else {
        return balance - tx.amount;
      }
    }, 0);
  }
}
