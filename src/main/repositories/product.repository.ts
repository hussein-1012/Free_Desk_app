import { BaseRepository } from './base.repository';
import { Product } from '@shared/types';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super('product');
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, oilProduct: true },
    });
  }

  async findByBarcode(barcode: string): Promise<any | null> {
    return this.prisma.product.findUnique({
      where: { barcode },
      include: { category: true, oilProduct: true },
    });
  }

  async updateStock(id: string, quantityChange: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: {
        quantity: {
          increment: quantityChange,
        },
      },
    });
  }

  async getLowStock(minLimit?: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        quantity: {
          lte: minLimit !== undefined ? minLimit : this.prisma.product.fields.minQuantity,
        },
      },
      include: { category: true },
    });
  }

  protected getSearchFields(): string[] {
    return ['name', 'barcode', 'location'];
  }
}
