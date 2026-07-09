// مستودع طلبات غسيل السيارات والدراجات
import { getPrismaClient } from '../database/prisma-client';
import { QueryParams } from '@shared/types';

export class WashRepository {
  private get db() {
    return getPrismaClient();
  }

  async findMany(params: QueryParams = {}) {
    const { page = 1, pageSize = 20, search, sortBy = 'createdAt', sortOrder = 'desc', filters = {} } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { vehiclePlate: { contains: search } },
      ];
    }

    if (filters.status) where.status = filters.status;
    if (filters.serviceType) where.serviceType = filters.serviceType;
    if (filters.vehicleType) where.vehicleType = filters.vehicleType;
    if (filters.dateFrom || filters.dateTo) {
      where.receivedDate = {};
      if (filters.dateFrom) where.receivedDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.receivedDate.lte = new Date(filters.dateTo);
    }

    const [items, total] = await Promise.all([
      this.db.washOrder.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortBy]: sortOrder },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.db.washOrder.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    return this.db.washOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        cashTransactions: true,
      },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return this.db.washOrder.findUnique({ where: { orderNumber } });
  }

  async create(data: any) {
    return this.db.washOrder.create({
      data,
      include: {
        customer: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return this.db.washOrder.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: string) {
    return this.db.washOrder.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return this.db.washOrder.delete({ where: { id } });
  }

  async countByStatus() {
    const counts = await this.db.washOrder.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return counts.reduce((acc: any, item) => {
      acc[item.status] = item._count._all;
      return acc;
    }, {});
  }

  async getTodayOrders() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.db.washOrder.findMany({
      where: {
        receivedDate: { gte: today, lt: tomorrow },
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
