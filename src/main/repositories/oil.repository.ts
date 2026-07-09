// مستودع منتجات الزيوت — نسخة مبسطة تتطابق مع واجهة المستخدم
import { getPrismaClient } from '../database/prisma-client';
import { QueryParams } from '@shared/types';

export class OilProductRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.oilProduct.findUnique({
      where: { id },
      include: {
        product: { include: { category: true } },
        openContainers: { where: { isClosed: false } },
        stockMovements: { orderBy: { date: 'desc' }, take: 10 },
      },
    });
  }

  async findByProductId(productId: string): Promise<any | null> {
    return this.prisma.oilProduct.findUnique({
      where: { productId },
      include: {
        product: { include: { category: true } },
        openContainers: { where: { isClosed: false } },
      },
    });
  }

  async findMany(params: QueryParams = {}): Promise<{ items: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const { page = 1, pageSize = 20, search, filters = {} } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { product: { name: { contains: search } } },
        { product: { barcode: { contains: search } } },
        { brand: { contains: search } },
      ];
    }
    // فلتر نوع البيع
    if (filters.sellingType) where.sellingType = filters.sellingType;

    const [items, total] = await Promise.all([
      this.prisma.oilProduct.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          product: { include: { category: true } },
        },
      }),
      this.prisma.oilProduct.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
  }

  async findNearExpiry(daysAhead: number = 30): Promise<any[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return this.prisma.oilProduct.findMany({
      where: {
        expirationDate: { lte: cutoff, gte: new Date() },
      },
      include: { product: true },
    });
  }

  // ============================================================
  // إنشاء منتج زيت جديد — يقبل نموذج الـ UI مباشرة
  // ============================================================
  async create(data: any): Promise<any> {
    const {
      productName,
      barcode,
      categoryId,
      quantity = 0,
      minQuantity = 0,
      cartonUnitsCount = 12,
      canCapacityLiters = 1,
      sellingType = 'retail',
      retailPrice = 0,
      wholesalePrice = 0,
      brand,
      oilType,
      size,
    } = data;

    if (!productName || productName.trim() === '') {
      throw new Error('اسم المنتج مطلوب');
    }

    return this.prisma.oilProduct.create({
      data: {
        sellingType,
        retailPrice: Number(retailPrice) || 0,
        wholesalePrice: Number(wholesalePrice) || 0,
        cartonUnitsCount: Number(cartonUnitsCount) || 12,
        canCapacityLiters: Number(canCapacityLiters) || 1,
        brand: brand || null,
        oilType: oilType || null,
        size: size || null,
        product: {
          create: {
            name: productName.trim(),
            barcode: barcode || null,
            categoryId: categoryId || null,
            purchasePrice: Number(wholesalePrice) || 0,
            sellingPrice: Number(retailPrice) || 0,
            quantity: Number(quantity) || 0,
            minQuantity: Number(minQuantity) || 0,
          },
        },
      },
      include: {
        product: { include: { category: true } },
      },
    });
  }

  // ============================================================
  // تحديث منتج زيت موجود — يقبل نموذج الـ UI مباشرة
  // ============================================================
  async update(id: string, data: any): Promise<any> {
    const {
      productName,
      barcode,
      categoryId,
      quantity,
      minQuantity,
      cartonUnitsCount,
      canCapacityLiters,
      sellingType,
      retailPrice,
      wholesalePrice,
      brand,
      oilType,
      size,
    } = data;

    const existing = await this.prisma.oilProduct.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!existing) throw new Error('منتج الزيت غير موجود');

    return this.prisma.oilProduct.update({
      where: { id },
      data: {
        sellingType: sellingType || existing.sellingType,
        retailPrice: (retailPrice !== undefined && retailPrice !== '') ? Number(retailPrice) : existing.retailPrice,
        wholesalePrice: (wholesalePrice !== undefined && wholesalePrice !== '') ? Number(wholesalePrice) : existing.wholesalePrice,
        cartonUnitsCount: (cartonUnitsCount !== undefined && cartonUnitsCount !== '') ? Number(cartonUnitsCount) : existing.cartonUnitsCount,
        canCapacityLiters: (canCapacityLiters !== undefined && canCapacityLiters !== '') ? Number(canCapacityLiters) : existing.canCapacityLiters,
        brand: brand !== undefined ? (brand || null) : existing.brand,
        oilType: oilType !== undefined ? (oilType || null) : existing.oilType,
        size: size !== undefined ? (size || null) : existing.size,
        product: {
          update: {
            name: productName ? productName.trim() : existing.product.name,
            barcode: barcode !== undefined ? (barcode || null) : existing.product.barcode,
            categoryId: categoryId !== undefined ? (categoryId || null) : existing.product.categoryId,
            purchasePrice: (wholesalePrice !== undefined && wholesalePrice !== '') ? Number(wholesalePrice) : existing.product.purchasePrice,
            sellingPrice: (retailPrice !== undefined && retailPrice !== '') ? Number(retailPrice) : existing.product.sellingPrice,
            quantity: (quantity !== undefined && quantity !== '') ? Number(quantity) : existing.product.quantity,
            minQuantity: (minQuantity !== undefined && minQuantity !== '') ? Number(minQuantity) : existing.product.minQuantity,
          },
        },
      },
      include: {
        product: { include: { category: true } },
      },
    });
  }

  async delete(id: string): Promise<any> {
    // أولاً: نجد معرف المنتج المرتبط
    const oilProduct = await this.prisma.oilProduct.findUnique({ where: { id } });
    if (!oilProduct) throw new Error('منتج الزيت غير موجود');

    // حذف داخل معاملة واحدة لضمان التكامل
    return this.prisma.$transaction(async (tx) => {
      // حذف OilProduct (يتتالى تلقائياً إلى OilStockMovements + OpenContainers)
      await tx.oilProduct.delete({ where: { id } });
      // حذف المنتج الأصلي (Product)
      await tx.product.delete({ where: { id: oilProduct.productId } });
    });
  }

  async recordStockMovement(movement: {
    oilProductId: string;
    type: string;
    unit: string;
    quantity: number;
    reference?: string;
    notes?: string;
  }): Promise<any> {
    return this.prisma.oilStockMovement.create({ data: movement });
  }

  async getStockMovements(oilProductId: string): Promise<any[]> {
    return this.prisma.oilStockMovement.findMany({
      where: { oilProductId },
      orderBy: { date: 'desc' },
    });
  }

  // ============================================================
  // إدارة العلب المفتوحة (بيع الزيت بالتر)
  // ============================================================
  async getOpenContainers(oilProductId: string): Promise<any[]> {
    return this.prisma.openContainer.findMany({
      where: { oilProductId, isClosed: false },
      orderBy: { openedAt: 'asc' },
    });
  }

  async createOpenContainer(data: {
    oilProductId: string;
    remainingLiters: number;
    canCapacityLiters: number;
  }): Promise<any> {
    return this.prisma.openContainer.create({ data });
  }

  async updateOpenContainer(id: string, remainingLiters: number): Promise<any> {
    if (remainingLiters <= 0) {
      return this.prisma.openContainer.update({
        where: { id },
        data: { remainingLiters: 0, isClosed: true },
      });
    }
    return this.prisma.openContainer.update({
      where: { id },
      data: { remainingLiters },
    });
  }
}
