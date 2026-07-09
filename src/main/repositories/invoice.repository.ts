import { getPrismaClient } from '../database/prisma-client';

export class PurchaseInvoiceRepository {
  private prisma = getPrismaClient();

  async findById(id: string): Promise<any | null> {
    return this.prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        createdBy: {
          select: { id: true, username: true, name: true, role: true },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findMany(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<{ items: any[]; total: number }> {
    const { page = 1, pageSize = 20, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.purchaseInvoice.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
        include: { supplier: true },
      }),
      this.prisma.purchaseInvoice.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: any): Promise<any> {
    const { items, ...invoiceData } = data;
    
    // Create inside transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const invoice = await tx.purchaseInvoice.create({
        data: invoiceData,
      });

      // 2. Create Items & Update product stock
      for (const item of items) {
        let productId = item.productId;
        if (!productId && item.productName) {
          let prod = await tx.product.findFirst({
            where: { name: item.productName },
          });
          if (!prod) {
            prod = await tx.product.create({
              data: {
                name: item.productName,
                purchasePrice: Number(item.unitPrice) || 0,
                sellingPrice: (Number(item.unitPrice) || 0) * 1.2, // Default selling price
                quantity: 0,
                isActive: true,
              },
            });
          }
          productId = prod.id;
        }

        await tx.purchaseItem.create({
          data: {
            invoiceId: invoice.id,
            productId: productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            total: item.total || (item.quantity * item.unitPrice),
          },
        });

        // Increment stock
        const product = await tx.product.findUnique({
          where: { id: productId },
        });
        const currentQty = product ? product.quantity : 0;
        await tx.product.update({
          where: { id: productId },
          data: {
            quantity: Math.max(0, currentQty + item.quantity),
            purchasePrice: item.unitPrice, // Update cost price to latest
          },
        });

        // Record stock movement
        await tx.inventoryMovement.create({
          data: {
            productId: productId,
            type: 'in',
            quantity: item.quantity,
            reference: 'purchase',
            referenceId: invoice.id,
            notes: `فاتورة شراء: ${invoice.invoiceNumber}`,
          },
        });
      }

      // 3. Update Supplier Balance (we owe the supplier if it is unpaid/partially paid)
      const unpaidAmount = invoice.total - invoice.paid;
      if (unpaidAmount > 0) {
        await tx.supplier.update({
          where: { id: invoice.supplierId },
          data: { balance: { increment: unpaidAmount } },
        });
      }

      // 4. Record Cash Transaction if paid amount > 0
      if (invoice.paid > 0) {
        await tx.cashTransaction.create({
          data: {
            type: 'payment',
            amount: invoice.paid,
            description: `دفعة لفاتورة شراء: ${invoice.invoiceNumber}`,
            reference: 'purchase_invoice',
            referenceId: invoice.id,
            supplierId: invoice.supplierId,
            purchaseInvoiceId: invoice.id,
            createdById: invoice.createdById,
          },
        });
      }

      return invoice;
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const invoice = await tx.purchaseInvoice.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!invoice) throw new Error('الفاتورة غير موجودة');

      // 1. Revert product stock
      for (const item of invoice.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const currentQty = product ? product.quantity : 0;
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: Math.max(0, currentQty - item.quantity) },
        });

        // Delete stock movements
        await tx.inventoryMovement.deleteMany({
          where: { referenceId: invoice.id, reference: 'purchase' },
        });
      }

      // 2. Revert Supplier Balance
      const unpaidAmount = invoice.total - invoice.paid;
      if (unpaidAmount > 0) {
        await tx.supplier.update({
          where: { id: invoice.supplierId },
          data: { balance: { decrement: unpaidAmount } },
        });
      }

      // 3. Delete cash transactions
      await tx.cashTransaction.deleteMany({
        where: { referenceId: invoice.id, reference: 'purchase_invoice' },
      });

      // 4. Delete Invoice
      await tx.purchaseInvoice.delete({ where: { id } });
    });
  }
}

export class SaleInvoiceRepository {
  private prisma = getPrismaClient();

  async findById(id: string): Promise<any | null> {
    return this.prisma.saleInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, username: true, name: true, role: true },
        },
        items: {
          include: {
            product: true,
          },
        },
        accessoryItems: {
          include: {
            accessory: true,
          },
        },
      },
    });
  }

  async findMany(params: { page?: number; pageSize?: number; search?: string } = {}): Promise<{ items: any[]; total: number }> {
    const { page = 1, pageSize = 20, search } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.saleInvoice.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: pageSize,
        include: { customer: true },
      }),
      this.prisma.saleInvoice.count({ where }),
    ]);

    return { items, total };
  }

  async create(data: any): Promise<any> {
    const { items, accessoryItems = [], ...invoiceData } = data;
    const { newCustomerName, newCustomerPhone, ...cleanedInvoiceData } = invoiceData;

    return this.prisma.$transaction(async (tx) => {
      // 1. Handle auto customer creation
      let customerId = cleanedInvoiceData.customerId;
      if (!customerId && newCustomerName) {
        let cust = await tx.customer.findFirst({
          where: { name: newCustomerName }
        });
        if (!cust) {
          cust = await tx.customer.create({
            data: {
              name: newCustomerName,
              phone: newCustomerPhone || null,
              balance: 0,
              isActive: true,
            }
          });
        }
        customerId = cust.id;
      }

      // 2. Create Invoice
      const invoice = await tx.saleInvoice.create({
        data: {
          ...cleanedInvoiceData,
          customerId,
        },
      });

      // 3. Create Items & Update product stock
      for (const item of items) {
        await tx.saleItem.create({
          data: {
            invoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            tax: item.tax || 0,
            total: item.total || (item.quantity * item.unitPrice * (1 - item.discount / 100)),
            unit: item.unit || 'piece',
          },
        });

        // Decrement stock (or increment if it is a return invoice)
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { oilProduct: true },
        });

        if (!product) {
          throw new Error('المنتج غير موجود');
        }

        let qtyChange = item.quantity;
        if (product && product.oilProduct) {
          const op = product.oilProduct;
          if (item.unit === 'carton') {
            qtyChange = item.quantity * op.cartonUnitsCount;
          } else if (item.unit === 'liter') {
            qtyChange = item.quantity / (op.canCapacityLiters || 1);
          }
        }

        // Validate stock logic
        if (!invoice.isReturn && product.quantity < qtyChange) {
          throw new Error(`الكمية المطلوبة من المنتج "${product.name}" غير متوفرة في المخزن (المتاح: ${product.quantity})`);
        }

        const qtyMultiplier = invoice.isReturn ? 1 : -1;
        const newQty = Math.max(0, product.quantity + (qtyChange * qtyMultiplier));

        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: newQty,
          },
        });

        // Record stock movement
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: invoice.isReturn ? 'return' : 'out',
            quantity: qtyChange,
            reference: 'sale',
            referenceId: invoice.id,
            notes: `فاتورة ${invoice.isReturn ? 'مرتجع' : 'بيع'}: ${invoice.invoiceNumber}${item.unit ? ` (${item.unit === 'piece' ? 'حبة' : item.unit === 'carton' ? 'كرتون' : item.unit === 'can' ? 'علبة' : item.unit === 'liter' ? 'لتر' : item.unit})` : ''}`,
          },
        });
      }

      // 3b. Create Accessory Items & Update accessory stock
      for (const item of accessoryItems) {
        await tx.accessorySaleItem.create({
          data: {
            invoiceId: invoice.id,
            accessoryId: item.accessoryId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            total: item.total || (item.quantity * item.unitPrice * (1 - item.discount / 100)),
          },
        });

        const accessory = await tx.accessory.findUnique({
          where: { id: item.accessoryId }
        });

        if (!accessory) {
          throw new Error('الإكسسوار غير موجود');
        }

        if (!invoice.isReturn && accessory.quantity < item.quantity) {
          throw new Error(`الكمية المطلوبة من الإكسسوار "${accessory.name}" غير متوفرة في المخزن (المتاح: ${accessory.quantity})`);
        }

        const qtyMultiplier = invoice.isReturn ? 1 : -1;
        const newQty = Math.max(0, accessory.quantity + (item.quantity * qtyMultiplier));

        await tx.accessory.update({
          where: { id: item.accessoryId },
          data: {
            quantity: newQty,
          },
        });
      }

      // 4. Update Customer Balance if client is selected
      if (invoice.customerId) {
        const unpaidAmount = invoice.total - invoice.paid;
        const balanceMultiplier = invoice.isReturn ? -1 : 1;
        
        if (unpaidAmount > 0) {
          await tx.customer.update({
            where: { id: invoice.customerId },
            data: { balance: { increment: unpaidAmount * balanceMultiplier } },
          });
        }
      }

      // 5. Record Cash Transaction if paid amount > 0
      if (invoice.paid > 0) {
        await tx.cashTransaction.create({
          data: {
            type: invoice.isReturn ? 'payment' : 'receipt',
            amount: invoice.paid,
            description: `${invoice.isReturn ? 'رد قيمة' : 'دفعة من'} فاتورة بيع: ${invoice.invoiceNumber}`,
            reference: 'sale_invoice',
            referenceId: invoice.id,
            customerId: invoice.customerId || null,
            saleInvoiceId: invoice.id,
            createdById: invoice.createdById,
          },
        });
      }

      return invoice;
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const invoice = await tx.saleInvoice.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  oilProduct: true,
                },
              },
            },
          },
          accessoryItems: {
            include: {
              accessory: true,
            },
          },
        },
      });

      if (!invoice) throw new Error('الفاتورة غير موجودة');

      // 1. Revert stock
      for (const item of invoice.items) {
        const qtyMultiplier = invoice.isReturn ? -1 : 1;
        let qtyChange = item.quantity;
        const product = item.product;
        if (product && product.oilProduct) {
          const op = product.oilProduct;
          if (item.unit === 'carton') {
            qtyChange = item.quantity * op.cartonUnitsCount;
          } else if (item.unit === 'liter') {
            qtyChange = item.quantity / (op.canCapacityLiters || 1);
          }
        }

        const newQty = Math.max(0, product.quantity + (qtyChange * qtyMultiplier));

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: newQty },
        });

        await tx.inventoryMovement.deleteMany({
          where: { referenceId: invoice.id, reference: 'sale' },
        });
      }

      // 1b. Revert accessory stock
      for (const item of invoice.accessoryItems) {
        const qtyMultiplier = invoice.isReturn ? -1 : 1;
        const accessory = item.accessory;
        const newQty = Math.max(0, accessory.quantity + (item.quantity * qtyMultiplier));
        await tx.accessory.update({
          where: { id: item.accessoryId },
          data: { quantity: newQty },
        });
      }

      // 2. Revert Customer Balance
      if (invoice.customerId) {
        const unpaidAmount = invoice.total - invoice.paid;
        const balanceMultiplier = invoice.isReturn ? -1 : 1;
        if (unpaidAmount > 0) {
          await tx.customer.update({
            where: { id: invoice.customerId },
            data: { balance: { decrement: unpaidAmount * balanceMultiplier } },
          });
        }
      }

      // 3. Delete cash transactions
      await tx.cashTransaction.deleteMany({
        where: { referenceId: invoice.id, reference: 'sale_invoice' },
      });

      // 4. Delete Invoice
      await tx.saleInvoice.delete({ where: { id } });
    });
  }
}
