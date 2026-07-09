import { getPrismaClient } from '../database/prisma-client';
import { ApiResponse } from '@shared/types';
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear, subDays,
} from 'date-fns';

export class ReportService {
  private prisma = getPrismaClient();

  private getDateRange(period: string) {
    const now = new Date();
    switch (period) {
      case 'today':
      case 'daily':   return { start: startOfDay(now),  end: endOfDay(now) };
      case 'week':
      case 'weekly':  return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
      case 'monthly': return { start: startOfMonth(now),end: endOfMonth(now) };
      case 'year':
      case 'yearly':  return { start: startOfYear(now), end: endOfYear(now) };
      default:        return { start: subDays(now, 30), end: now };
    }
  }

  async getDashboardSummary(): Promise<ApiResponse<any>> {
    try {
      const now       = new Date();
      const todayStart = startOfDay(now);
      const todayEnd   = endOfDay(now);

      const [salesToday, purchasesToday, incomeTx, expenseTx,
             customerCount, supplierCount, activeWashOrders, recentSales] = await Promise.all([
        this.prisma.saleInvoice.aggregate({
          where: { date: { gte: todayStart, lte: todayEnd }, isReturn: false, status: { not: 'cancelled' } },
          _sum: { total: true },
        }),
        this.prisma.purchaseInvoice.aggregate({
          where: { date: { gte: todayStart, lte: todayEnd }, status: { not: 'cancelled' } },
          _sum: { total: true },
        }),
        this.prisma.cashTransaction.aggregate({
          where: { type: { in: ['income', 'receipt'] } },
          _sum: { amount: true },
        }),
        this.prisma.cashTransaction.aggregate({
          where: { type: { in: ['expense', 'payment'] } },
          _sum: { amount: true },
        }),
        this.prisma.customer.count({ where: { isActive: true } }),
        this.prisma.supplier.count({ where: { isActive: true } }),
        this.prisma.washOrder.count({ where: { status: { in: ['received', 'washing'] } } }),
        this.prisma.saleInvoice.findMany({
          orderBy: { date: 'desc' },
          take: 5,
          include: { customer: { select: { name: true } } },
        }),
      ]);

      const cashBalance = (incomeTx._sum.amount || 0) - (expenseTx._sum.amount || 0);

      // Low stock — raw count via findMany (quantity <= minQuantity)
      const allProducts = await this.prisma.product.findMany({
        where: { isActive: true },
        select: { quantity: true, minQuantity: true },
      });
      const lowStockAlerts = allProducts.filter(p => p.quantity <= p.minQuantity).length;

      // 7-day chart
      const chartData: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const d   = subDays(now, i);
        const s   = startOfDay(d);
        const e   = endOfDay(d);
        const [ds, dp] = await Promise.all([
          this.prisma.saleInvoice.aggregate({
            where: { date: { gte: s, lte: e }, isReturn: false, status: { not: 'cancelled' } },
            _sum: { total: true },
          }),
          this.prisma.purchaseInvoice.aggregate({
            where: { date: { gte: s, lte: e }, status: { not: 'cancelled' } },
            _sum: { total: true },
          }),
        ]);
        chartData.push({
          label: d.toLocaleDateString('ar-SA', { weekday: 'short' }),
          sales:     ds._sum.total || 0,
          purchases: dp._sum.total || 0,
        });
      }

      return {
        success: true,
        data: {
          todaySales:     salesToday._sum.total || 0,
          todayPurchases: purchasesToday._sum.total || 0,
          cashBalance,
          customerCount,
          supplierCount,
          activeWashOrders,
          lowStockAlerts,
          recentSales,
          chartData,
        },
      };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب ملخص لوحة التحكم' };
    }
  }

  async getSalesReport(period: string): Promise<ApiResponse<any>> {
    try {
      const { start, end } = this.getDateRange(period);
      const [invoices, summary, washSummary] = await Promise.all([
        this.prisma.saleInvoice.findMany({
          where: { date: { gte: start, lte: end }, status: { not: 'cancelled' } },
          include: { customer: true },
          orderBy: { date: 'desc' },
        }),
        this.prisma.saleInvoice.aggregate({
          where: { date: { gte: start, lte: end }, status: { not: 'cancelled' } },
          _sum: { total: true, tax: true, discount: true, paid: true },
          _count: { id: true },
        }),
        this.prisma.washOrder.aggregate({
          where: { receivedDate: { gte: start, lte: end }, status: { not: 'cancelled' } },
          _sum: { price: true },
        }),
      ]);

      // Build period chart data
      const daysInRange = Math.ceil((end.getTime() - start.getTime()) / 86400000);
      const buckets = Math.min(daysInRange, 30);
      const chartData: any[] = [];
      for (let i = 0; i < buckets; i++) {
        const d = new Date(start.getTime() + i * 86400000);
        const ds = startOfDay(d);
        const de = endOfDay(d);
        const agg = await this.prisma.saleInvoice.aggregate({
          where: { date: { gte: ds, lte: de }, isReturn: false, status: { not: 'cancelled' } },
          _sum: { total: true },
        });
        chartData.push({ label: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }), sales: agg._sum.total || 0 });
      }

      return {
        success: true,
        data: {
          invoices,
          total:        summary._sum.total    || 0,
          totalTax:     summary._sum.tax      || 0,
          totalDiscount:summary._sum.discount || 0,
          totalPaid:    summary._sum.paid     || 0,
          count:        summary._count.id     || 0,
          washRevenue:  washSummary._sum.price || 0,
          chartData,
          startDate: start,
          endDate:   end,
        },
      };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب تقرير المبيعات' };
    }
  }

  async getPurchaseReport(period: string): Promise<ApiResponse<any>> {
    try {
      const { start, end } = this.getDateRange(period);
      const [invoices, summary] = await Promise.all([
        this.prisma.purchaseInvoice.findMany({
          where: { date: { gte: start, lte: end }, status: { not: 'cancelled' } },
          include: { supplier: true },
          orderBy: { date: 'desc' },
        }),
        this.prisma.purchaseInvoice.aggregate({
          where: { date: { gte: start, lte: end }, status: { not: 'cancelled' } },
          _sum: { total: true, tax: true, discount: true, paid: true },
          _count: { id: true },
        }),
      ]);

      return {
        success: true,
        data: {
          invoices,
          total:        summary._sum.total    || 0,
          totalTax:     summary._sum.tax      || 0,
          totalDiscount:summary._sum.discount || 0,
          totalPaid:    summary._sum.paid     || 0,
          count:        summary._count.id     || 0,
          startDate: start,
          endDate:   end,
        },
      };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب تقرير المشتريات' };
    }
  }

  async getProfitReport(period: string): Promise<ApiResponse<any>> {
    try {
      const { start, end } = this.getDateRange(period);

      const [salesTotal, returnsTotal, washTotal, purchasesTotal, expensesTotal] = await Promise.all([
        this.prisma.saleInvoice.aggregate({
          where: { date: { gte: start, lte: end }, isReturn: false, status: { not: 'cancelled' } },
          _sum: { total: true },
        }),
        this.prisma.saleInvoice.aggregate({
          where: { date: { gte: start, lte: end }, isReturn: true, status: { not: 'cancelled' } },
          _sum: { total: true },
        }),
        // wash revenue — use washOrder.price
        this.prisma.washOrder.aggregate({
          where: { receivedDate: { gte: start, lte: end }, status: { not: 'cancelled' } },
          _sum: { price: true },
        }),
        this.prisma.purchaseInvoice.aggregate({
          where: { date: { gte: start, lte: end }, status: { not: 'cancelled' } },
          _sum: { total: true },
        }),
        this.prisma.businessExpense.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      const totalRevenue  = (salesTotal._sum.total || 0) - (returnsTotal._sum.total || 0) + (washTotal._sum.price || 0);
      const totalExpenses = (purchasesTotal._sum.total || 0) + (expensesTotal._sum.amount || 0);
      const netProfit     = totalRevenue - totalExpenses;

      // Build chart data (buckets per period)
      const daysInRange = Math.ceil((end.getTime() - start.getTime()) / 86400000);
      const buckets = Math.min(daysInRange, 30);
      const chartData: any[] = [];
      for (let i = 0; i < buckets; i++) {
        const d  = new Date(start.getTime() + i * 86400000);
        const ds = startOfDay(d);
        const de = endOfDay(d);
        const [sa, pu] = await Promise.all([
          this.prisma.saleInvoice.aggregate({
            where: { date: { gte: ds, lte: de }, isReturn: false, status: { not: 'cancelled' } },
            _sum: { total: true },
          }),
          this.prisma.purchaseInvoice.aggregate({
            where: { date: { gte: ds, lte: de }, status: { not: 'cancelled' } },
            _sum: { total: true },
          }),
        ]);
        const s = sa._sum.total || 0;
        const p = pu._sum.total || 0;
        chartData.push({
          label: d.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
          sales:     s,
          purchases: p,
          profit:    s - p,
        });
      }

      return {
        success: true,
        data: {
          totalRevenue,
          totalExpenses,
          netProfit,
          salesRevenue:    salesTotal._sum.total    || 0,
          returnsDeduction:returnsTotal._sum.total  || 0,
          washRevenue:     washTotal._sum.price      || 0,
          purchasesExpense:purchasesTotal._sum.total || 0,
          businessExpense: expensesTotal._sum.amount || 0,
          chartData,
          startDate: start,
          endDate:   end,
        },
      };
    } catch (error: any) {
      return { success: false, error: 'فشل في جلب تقرير الأرباح' };
    }
  }
}
