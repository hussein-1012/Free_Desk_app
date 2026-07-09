import { z } from 'zod';

// ============================================================
// المصادقة
// ============================================================

export const loginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'),
});

export const userCreateSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'),
  name: z.string().min(2, 'الاسم مطلوب'),
  role: z.enum(['admin', 'manager', 'cashier']),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب').optional(),
  password: z.string().min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل').optional().or(z.literal('')),
  name: z.string().min(2, 'الاسم مطلوب').optional(),
  role: z.enum(['admin', 'manager', 'cashier']).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================
// العملاء والموردون
// ============================================================

export const customerSchema = z.object({
  name: z.string().min(2, 'اسم العميل مطلوب'),
  phone: z.string().nullable().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').nullable().optional().or(z.literal('')),
  address: z.string().nullable().optional(),
  carNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const odometerReadingSchema = z.object({
  customerId: z.string().min(1, 'العميل مطلوب'),
  reading: z.number().nonnegative('قراءة العداد يجب أن تكون موجبة'),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  invoiceId: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2, 'اسم المورد مطلوب'),
  companyName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('البريد الإلكتروني غير صالح').nullable().optional().or(z.literal('')),
  address: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// ============================================================
// الإكسسوارات
// ============================================================

export const accessorySchema = z.object({
  name: z.string().min(2, 'اسم الإكسسوار مطلوب'),
  barcode: z.string().nullable().optional(),
  price: z.number().nonnegative('السعر لا يمكن أن يكون سالباً'),
  quantity: z.number().nonnegative('الكمية لا يمكن أن تكون سالبة').default(0),
  minQuantity: z.number().nonnegative('الحد الأدنى لا يمكن أن يكون سالباً').default(5),
  imageUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// ============================================================
// المنتجات والتصنيفات
// ============================================================

export const categorySchema = z.object({
  name: z.string().min(2, 'اسم التصنيف مطلوب'),
  description: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  barcode: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  purchasePrice: z.number().nonnegative('سعر الشراء لا يمكن أن يكون سالباً'),
  sellingPrice: z.number().nonnegative('سعر البيع لا يمكن أن يكون سالباً'),
  quantity: z.number().default(0),
  minQuantity: z.number().nonnegative('الحد الأدنى لا يمكن أن يكون سالباً').default(0),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

// ============================================================
// الزيوت
// ============================================================

export const oilProductSchema = z.object({
  productName: z.string().min(1, 'اسم المنتج مطلوب'),
  categoryId: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
  sellingType: z.enum(['retail', 'wholesale', 'both']).default('retail'),
  retailPrice: z.number().nonnegative('سعر التجزئة لا يمكن أن يكون سالباً').default(0),
  wholesalePrice: z.number().nonnegative('سعر الجملة لا يمكن أن يكون سالباً').default(0),
  cartonUnitsCount: z.number().positive('عدد العلب في الكرتون يجب أن يكون موجباً').default(12),
  canCapacityLiters: z.number().positive('سعة العلبة يجب أن تكون موجبة').default(1),
  quantity: z.number().nonnegative().default(0),
  minQuantity: z.number().nonnegative().default(0),
  brand: z.string().nullable().optional(),
  oilType: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  batchNumber: z.string().nullable().optional(),
  expirationDate: z.date().nullable().optional().or(z.string().transform((val) => val ? new Date(val) : null)),
});

// ============================================================
// غسيل السيارات والدراجات
// ============================================================

export const washOrderSchema = z.object({
  orderNumber: z.string().optional(),
  customerId: z.string().nullable().optional().transform(val => val === '' ? null : val),
  customerName: z.string().min(2, 'اسم العميل مطلوب'),
  customerPhone: z.string().nullable().optional().transform(val => val === '' ? null : val),
  vehicleType: z.enum(['car', 'bike']).default('car'),
  vehiclePlate: z.string().nullable().optional().transform(val => val === '' ? null : val),
  serviceType: z.enum(['bag_polish', 'interior_exterior', 'chemical_wash', 'exterior_only', 'vip', 'bike_wash']),
  receivedDate: z.date().or(z.string().transform((val) => new Date(val))).optional().default(() => new Date()),
  deliveryDate: z.date().nullable().optional().or(z.string().transform((val) => val ? new Date(val) : null)).default(null),
  price: z.number().nonnegative('السعر لا يمكن أن يكون سالباً'),
  paid: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional().transform(val => val === '' ? null : val),
  status: z.enum(['received', 'washing', 'ready', 'delivered', 'cancelled']).default('received'),
});

// ============================================================
// الفواتير
// ============================================================

export const invoiceItemSchema = z.object({
  productId: z.string().optional().nullable().or(z.literal('')),
  productName: z.string().optional(),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().nonnegative('السعر لا يمكن أن يكون سالباً'),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number().optional(),
  unit: z.string().default('piece'),
});

export const accessoryItemSchema = z.object({
  accessoryId: z.string().min(1, 'الإكسسوار مطلوب'),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
  unitPrice: z.number().nonnegative('السعر لا يمكن أن يكون سالباً'),
  discount: z.number().nonnegative().default(0),
  total: z.number().optional(),
});

export const purchaseInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب'),
  supplierId: z.string().min(1, 'المورد مطلوب'),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  items: z.array(invoiceItemSchema).min(1, 'الفاتورة يجب أن تحتوي على منتج واحد على الأقل'),
  subtotal: z.number(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number(),
  paid: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
  status: z.enum(['draft', 'confirmed', 'paid', 'partial', 'cancelled']).default('draft'),
});

export const saleInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'رقم الفاتورة مطلوب'),
  customerId: z.string().nullable().optional(),
  newCustomerName: z.string().nullable().optional(),
  newCustomerPhone: z.string().nullable().optional(),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  items: z.array(invoiceItemSchema).default([]),
  accessoryItems: z.array(accessoryItemSchema).default([]),
  subtotal: z.number(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  total: z.number(),
  paid: z.number().nonnegative().default(0),
  notes: z.string().nullable().optional(),
  status: z.enum(['draft', 'confirmed', 'paid', 'partial', 'cancelled']).default('draft'),
  isReturn: z.boolean().default(false),
  originalInvoiceId: z.string().nullable().optional(),
});

// ============================================================
// المخزون
// ============================================================

export const inventoryCountItemSchema = z.object({
  productId: z.string().min(1, 'المنتج مطلوب'),
  systemQuantity: z.number(),
  actualQuantity: z.number().nonnegative('الكمية الفعلية لا يمكن أن تكون سالبة'),
  difference: z.number(),
  notes: z.string().nullable().optional(),
});

export const inventoryCountSchema = z.object({
  date: z.date().or(z.string().transform((val) => new Date(val))),
  notes: z.string().nullable().optional(),
  status: z.enum(['draft', 'completed', 'cancelled']).default('draft'),
  items: z.array(inventoryCountItemSchema).min(1, 'الجرد يجب أن يحتوي على منتج واحد على الأقل'),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'المنتج مطلوب'),
  type: z.enum(['add', 'remove', 'damaged', 'missing']),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
  reason: z.string().nullable().optional(),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  notes: z.string().nullable().optional(),
});

export const inventoryTransferItemSchema = z.object({
  productId: z.string().min(1, 'المنتج مطلوب'),
  quantity: z.number().positive('الكمية يجب أن تكون أكبر من صفر'),
});

export const inventoryTransferSchema = z.object({
  transferNumber: z.string().min(1, 'رقم النقل مطلوب'),
  fromLocation: z.string().min(1, 'موقع المصدر مطلوب'),
  toLocation: z.string().min(1, 'موقع الوجهة مطلوب'),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  status: z.string().default('completed'),
  notes: z.string().nullable().optional(),
  items: z.array(inventoryTransferItemSchema).min(1, 'عملية النقل يجب أن تحتوي على منتج واحد على الأقل'),
});

// ============================================================
// الشركاء
// ============================================================

export const partnerSchema = z.object({
  name: z.string().min(2, 'اسم الشريك مطلوب'),
  capitalAmount: z.number().nonnegative('رأس المال لا يمكن أن يكون سالباً'),
  profitPercentage: z.number().min(0).max(100, 'النسبة يجب أن تكون بين 0 و 100'),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const partnerWithdrawalSchema = z.object({
  partnerId: z.string().min(1, 'الشريك مطلوب'),
  amount: z.number().positive('مبلغ السحب يجب أن يكون أكبر من صفر'),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  notes: z.string().nullable().optional(),
});

export const businessExpenseSchema = z.object({
  amount: z.number().positive('مبلغ المصروف يجب أن يكون أكبر من صفر'),
  description: z.string().min(2, 'وصف المصروف مطلوب'),
  category: z.enum(['rent', 'salary', 'utilities', 'maintenance', 'other']),
  date: z.date().or(z.string().transform((val) => new Date(val))),
  notes: z.string().nullable().optional(),
});