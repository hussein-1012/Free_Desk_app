import { getPrismaClient } from '../database/prisma-client';
import { Partner, QueryParams } from '@shared/types';

export class PartnerRepository {
  private prisma = getPrismaClient();

  async findById(id: string): Promise<any | null> {
    return this.prisma.partner.findUnique({
      where: { id },
      include: {
        withdrawals: true,
      },
    });
  }

  async findMany(params: QueryParams = {}): Promise<{ partners: any[]; totalCapital: number; cashBalance: number }> {
    const { page = 1, pageSize = 20, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }

    const [rawPartners, totalCapitalAgg, incomeTx, expenseTx] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          withdrawals: true,
          distributionItems: true,
        },
      }),
      this.prisma.partner.aggregate({
        where,
        _sum: {
          capitalAmount: true,
        },
      }),
      this.prisma.cashTransaction.aggregate({
        where: { type: { in: ['income', 'receipt'] } },
        _sum: { amount: true },
      }),
      this.prisma.cashTransaction.aggregate({
        where: { type: { in: ['expense', 'payment'] } },
        _sum: { amount: true },
      }),
    ]);

    const partners = rawPartners.map((p) => {
      const totalWithdrawals = p.withdrawals.reduce((sum, w) => sum + w.amount, 0);
      const totalDistributed = p.distributionItems.reduce((sum, d) => sum + d.amount, 0);
      return {
        id: p.id,
        name: p.name,
        capitalShare: p.capitalAmount,
        profitSharePercentage: p.profitPercentage,
        totalWithdrawals,
        currentProfitBalance: Math.max(0, totalDistributed - totalWithdrawals),
        notes: p.notes,
        isActive: p.isActive,
      };
    });

    const totalCapital = totalCapitalAgg._sum.capitalAmount || 0;
    const cashBalance = (incomeTx._sum.amount || 0) - (expenseTx._sum.amount || 0);

    return { partners, totalCapital, cashBalance };
  }

  async create(data: any): Promise<Partner> {
    return this.prisma.partner.create({ data });
  }

  async update(id: string, data: any): Promise<Partner> {
    return this.prisma.partner.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Partner> {
    return this.prisma.partner.delete({
      where: { id },
    });
  }

  // Withdrawals
  async createWithdrawal(data: any, createdById: string = 'admin'): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const withdrawal = await tx.partnerWithdrawal.create({ data });
      
      const partner = await tx.partner.findUnique({ where: { id: withdrawal.partnerId } });
      const partnerName = partner ? partner.name : withdrawal.partnerId;

      await tx.cashTransaction.create({
        data: {
          type: 'expense',
          amount: withdrawal.amount,
          description: `مسحوبات الشريك: ${partnerName}`,
          reference: 'partner_withdrawal',
          referenceId: withdrawal.id,
          createdById: createdById,
        },
      });

      return withdrawal;
    });
  }

  async getWithdrawals(partnerId?: string): Promise<any[]> {
    return this.prisma.partnerWithdrawal.findMany({
      where: partnerId ? { partnerId } : {},
      include: { partner: true },
      orderBy: { date: 'desc' },
    });
  }

  // Expenses
  async createExpense(data: any, createdById: string = 'admin'): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const expense = await tx.businessExpense.create({ data });

      const categoryAr = expense.category === 'rent' ? 'إيجار'
        : expense.category === 'salary' ? 'رواتب'
        : expense.category === 'utilities' ? 'مرافق'
        : expense.category === 'maintenance' ? 'صيانة'
        : 'أخرى';

      await tx.cashTransaction.create({
        data: {
          type: 'expense',
          amount: expense.amount,
          description: `مصروفات: ${expense.description} (${categoryAr})`,
          reference: 'expense',
          referenceId: expense.id,
          createdById: createdById,
        },
      });

      return expense;
    });
  }

  async getExpenses(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
    const { page = 1, pageSize = 20, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.description = { contains: search };
    }

    const [items, total] = await Promise.all([
      this.prisma.businessExpense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.businessExpense.count({ where }),
    ]);

    return { items, total };
  }

  // Distributions
  async distributeProfit(data: any, createdById: string = 'admin'): Promise<any> {
    const { items, ...distributionData } = data;

    return this.prisma.$transaction(async (tx) => {
      const distribution = await tx.profitDistribution.create({
        data: distributionData,
      });

      for (const item of items) {
        await tx.profitDistributionItem.create({
          data: {
            distributionId: distribution.id,
            partnerId: item.partnerId,
            amount: item.amount,
            percentage: item.percentage,
          },
        });

        const partner = await tx.partner.findUnique({ where: { id: item.partnerId } });
        const partnerName = partner ? partner.name : item.partnerId;
        const periodAr = distribution.period === 'monthly' ? 'شهري'
          : distribution.period === 'yearly' ? 'سنوي'
          : 'مخصص';

        // Record partner receipt or increase their balance/capital if tracked
        await tx.cashTransaction.create({
          data: {
            type: 'expense',
            amount: item.amount,
            description: `توزيع أرباح: الشريك ${partnerName} لفترة ${periodAr}`,
            reference: 'partner_withdrawal',
            referenceId: distribution.id,
            createdById: createdById,
          },
        });
      }

      return distribution;
    });
  }

  async getDistributions(): Promise<any[]> {
    return this.prisma.profitDistribution.findMany({
      include: {
        items: {
          include: { partner: true },
        },
      },
      orderBy: { distributedAt: 'desc' },
    });
  }
}
