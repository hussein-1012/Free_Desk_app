// import { getPrismaClient } from '../database/prisma-client';
// import { QueryParams } from '@shared/types';

// export class InventoryRepository {
//   private prisma = getPrismaClient();

//   // Counts
//   async findCountById(id: string): Promise<any | null> {
//     return this.prisma.inventoryCount.findUnique({
//       where: { id },
//       include: {
//         createdBy: { select: { id: true, username: true, name: true } },
//         items: {
//           include: { product: true },
//         },
//       },
//     });
//   }

//   async getCounts(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
//     const { page = 1, pageSize = 20 } = params;
//     const skip = (page - 1) * pageSize;

//     const [items, total] = await Promise.all([
//       this.prisma.inventoryCount.findMany({
//         orderBy: { date: 'desc' },
//         skip,
//         take: pageSize,
//       }),
//       this.prisma.inventoryCount.count(),
//     ]);

//     return { items, total };
//   }

//   async createCount(data: any): Promise<any> {
//     const { items, ...countData } = data;

//     return this.prisma.$transaction(async (tx) => {
//       const count = await tx.inventoryCount.create({
//         data: countData,
//       });

//       for (const item of items) {
//         await tx.inventoryCountItem.create({
//           data: {
//             countId: count.id,
//             productId: item.productId,
//             systemQuantity: item.systemQuantity,
//             actualQuantity: item.actualQuantity,
//             difference: item.difference,
//             notes: item.notes,
//           },
//         });

//         // If completed directly, adjust stock
//         if (count.status === 'completed') {
//           await tx.product.update({
//             where: { id: item.productId },
//             data: { quantity: Math.max(0, item.actualQuantity) },
//           });

//           await tx.inventoryMovement.create({
//             data: {
//               productId: item.productId,
//               type: 'adjustment',
//               quantity: item.difference,
//               reference: 'count',
//               referenceId: count.id,
//               notes: `جرد مخزون فعلي: ${count.notes || ''}`,
//             },
//           });
//         }
//       }

//       return count;
//     });
//   }

//   // Adjustments
//   async createAdjustment(data: any): Promise<any> {
//     return this.prisma.$transaction(async (tx) => {
//       const adjustment = await tx.stockAdjustment.create({ data });

//       // Calculate quantity effect
//       const qtyMultiplier = (adjustment.type === 'add') ? 1 : -1;
//       const quantityChange = adjustment.quantity * qtyMultiplier;

//       const product = await tx.product.findUnique({
//         where: { id: adjustment.productId }
//       });
//       if (!product) {
//         throw new Error('المنتج غير موجود');
//       }

//       const newQty = Math.max(0, product.quantity + quantityChange);
//       await tx.product.update({
//         where: { id: adjustment.productId },
//         data: {
//           quantity: newQty,
//         },
//       });

//       await tx.inventoryMovement.create({
//         data: {
//           productId: adjustment.productId,
//           type: 'adjustment',
//           quantity: quantityChange,
//           reference: 'adjustment',
//           referenceId: adjustment.id,
//           notes: `تسوية مخزون: ${adjustment.reason || ''} (${adjustment.type === 'add' ? 'إضافة' : adjustment.type === 'remove' ? 'سحب' : adjustment.type === 'damaged' ? 'تالف' : 'مفقود'})`,
//         },
//       });

//       return adjustment;
//     });
//   }

//   async getAdjustments(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
//     const { page = 1, pageSize = 20 } = params;
//     const skip = (page - 1) * pageSize;

//     const [items, total] = await Promise.all([
//       this.prisma.stockAdjustment.findMany({
//         orderBy: { date: 'desc' },
//         skip,
//         take: pageSize,
//         include: { product: true },
//       }),
//       this.prisma.stockAdjustment.count(),
//     ]);

//     return { items, total };
//   }

//   // Movement Log
//   async getMovements(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
//     const { page = 1, pageSize = 20, filters = {} } = params;
//     const skip = (page - 1) * pageSize;

//     const [items, total] = await Promise.all([
//       this.prisma.inventoryMovement.findMany({
//         where: filters,
//         orderBy: { date: 'desc' },
//         skip,
//         take: pageSize,
//         include: { product: true },
//       }),
//       this.prisma.inventoryMovement.count({ where: filters }),
//     ]);

//     return { items, total };
//   }

//   // نقل المخزون
//   async createTransfer(data: any): Promise<any> {
//     const { items, ...transferData } = data;

//     return this.prisma.$transaction(async (tx) => {
//       const transfer = await tx.inventoryTransfer.create({
//         data: transferData,
//       });

//       for (const item of items) {
//         await tx.inventoryTransferItem.create({
//           data: {
//             transferId: transfer.id,
//             productId: item.productId,
//             quantity: item.quantity,
//           },
//         });

//         // تحديث مكان المنتج إلى الموقع الجديد
//         await tx.product.update({
//           where: { id: item.productId },
//           data: { location: transfer.toLocation },
//         });

//         // تسجيل حركة المخزون (تغيير الكمية الكلية 0 لأن النقل داخلي)
//         await tx.inventoryMovement.create({
//           data: {
//             productId: item.productId,
//             type: 'adjustment',
//             quantity: 0,
//             reference: 'transfer',
//             referenceId: transfer.id,
//             notes: `نقل ${item.quantity} من ${transfer.fromLocation} إلى ${transfer.toLocation}`,
//           },
//         });
//       }

//       return transfer;
//     });
//   }

//   async getTransfers(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
//     const { page = 1, pageSize = 20, search } = params;
//     const skip = (page - 1) * pageSize;

//     const where: any = {};
//     if (search) {
//       where.OR = [
//         { transferNumber: { contains: search } },
//         { fromLocation: { contains: search } },
//         { toLocation: { contains: search } },
//       ];
//     }

//     const [items, total] = await Promise.all([
//       this.prisma.inventoryTransfer.findMany({
//         where,
//         orderBy: { date: 'desc' },
//         skip,
//         take: pageSize,
//         include: {
//           createdBy: { select: { id: true, username: true, name: true } },
//           items: {
//             include: { product: true },
//           },
//         },
//       }),
//       this.prisma.inventoryTransfer.count({ where }),
//     ]);

//     return { items, total };
//   }

//   async findTransferById(id: string): Promise<any | null> {
//     return this.prisma.inventoryTransfer.findUnique({
//       where: { id },
//       include: {
//         createdBy: { select: { id: true, username: true, name: true } },
//         items: {
//           include: { product: true },
//         },
//       },
//     });
//   }
// }

import { getPrismaClient } from '../database/prisma-client';
import { QueryParams } from '@shared/types';

export class InventoryRepository {
  private prisma = getPrismaClient();

  async findCountById(id: string): Promise<any | null> {
    return this.prisma.inventoryCount.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, username: true, name: true } },
        items: {
          include: { product: true },
        },
      },
    });
  }

  async getCounts(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
    const { page = 1, pageSize = 20 } = params;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.inventoryCount.findMany({
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.inventoryCount.count(),
    ]);

    return { items, total };
  }

  async createCount(data: any): Promise<any> {
    const { items, ...countData } = data;

    return this.prisma.$transaction(async (tx) => {
      const count = await tx.inventoryCount.create({
        data: countData,
      });

      for (const item of items) {
        let appliedDifference = item.difference;

        if (count.status === 'completed') {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new Error('أحد المنتجات في الجرد غير موجود');
          }

          const targetQty = Math.max(0, item.actualQuantity);
          appliedDifference = targetQty - product.quantity;

          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: targetQty },
          });

          await tx.inventoryMovement.create({
            data: {
              productId: item.productId,
              type: 'adjustment',
              quantity: appliedDifference,
              reference: 'count',
              referenceId: count.id,
              notes: `جرد مخزون فعلي: ${count.notes || ''}`,
            },
          });
        }

        await tx.inventoryCountItem.create({
          data: {
            countId: count.id,
            productId: item.productId,
            systemQuantity: item.systemQuantity,
            actualQuantity: item.actualQuantity,
            difference: appliedDifference,
            notes: item.notes,
          },
        });
      }

      return count;
    });
  }

  /**
   * حذف مستند جرد.
   * ملحوظة مهمة: الحذف بيشيل السجل التاريخي بس (المستند وعناصره)،
   * ومش بيرجّع كميات المنتجات لقيمتها قبل الجرد. لو عايز "تراجع" فعلي
   * للكميات بعد الحذف، ده سلوك مختلف تمامًا ومحتاج تأكيد منفصل، لأن
   * ممكن يكون حصل حركات تانية على نفس المنتج بعد الجرد.
   */
  async deleteCount(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const count = await tx.inventoryCount.findUnique({ where: { id } });
      if (!count) {
        throw new Error('مستند الجرد غير موجود');
      }
      await tx.inventoryCountItem.deleteMany({ where: { countId: id } });
      await tx.inventoryCount.delete({ where: { id } });
    });
  }

  async getMovements(params: QueryParams = {}): Promise<{ items: any[]; total: number }> {
    const { page = 1, pageSize = 20, filters = {} } = params;
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where: filters,
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
        include: { product: true },
      }),
      this.prisma.inventoryMovement.count({ where: filters }),
    ]);

    return { items, total };
  }
}