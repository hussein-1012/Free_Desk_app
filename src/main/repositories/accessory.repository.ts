// مستودع الإكسسوارات
import { getPrismaClient } from '../database/prisma-client';
import { QueryParams } from '@shared/types';

export class AccessoryRepository {
  private get db() {
    return getPrismaClient();
  }

  async findMany(params: QueryParams = {}) {
    const { page = 1, pageSize = 20, search, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { barcode: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.db.accessory.findMany({ where, skip, take: pageSize, orderBy: { [sortBy]: sortOrder } }),
      this.db.accessory.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string) {
    return this.db.accessory.findUnique({ where: { id } });
  }

  async findByBarcode(barcode: string) {
    return this.db.accessory.findUnique({ where: { barcode } });
  }

  async findLowStock() {
    return this.db.accessory.findMany({
      where: {
        isActive: true,
        quantity: { lte: this.db.accessory.fields.minQuantity } as any,
      },
    });
  }

  async create(data: any) {
    return this.db.accessory.create({ data });
  }

  async update(id: string, data: any) {
    return this.db.accessory.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.db.accessory.delete({ where: { id } });
  }

  async adjustQuantity(id: string, delta: number) {
    return this.db.accessory.update({
      where: { id },
      data: { quantity: { increment: delta } },
    });
  }
}
