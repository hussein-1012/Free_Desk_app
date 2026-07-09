// ============================================================
// الأنواع المشتركة — نظام إدارة المحل
// ============================================================

export type UserRole = 'admin' | 'manager' | 'cashier';

export type WashServiceType =
  | 'bag_polish'        // شنطة ومطور
  | 'interior_exterior' // داخلي وخارجي
  | 'chemical_wash'    // غسيل كيميائي
  | 'exterior_only'    // خارجي فقط
  | 'vip'              // VIP
  | 'bike_wash';       // غسيل دراجة

export type WashOrderStatus = 'received' | 'washing' | 'ready' | 'delivered' | 'cancelled';
export type WashVehicleType = 'car' | 'bike';

export type OilUnit = 'carton' | 'can' | 'liter';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  loginAttempts?: number;
  lockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  userId: string;
  screen: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: string | null;
  createdAt: Date;
  user?: User;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================
// العملاء
// ============================================================

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  carNumber?: string | null; // رقم لوحة السيارة
  notes?: string | null;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  odometerReadings?: OdometerReading[];
}

export interface OdometerReading {
  id: string;
  customerId: string;
  reading: number; // بالكيلومترات
  date: Date;
  invoiceId?: string | null;
  notes?: string | null;
  customer?: Customer;
}

// ============================================================
// الموردون
// ============================================================

export interface Supplier {
  id: string;
  name: string;
  companyName?: string | null; // اسم الشركة
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  ledgerEntries?: SupplierLedger[];
}

export interface SupplierLedger {
  id: string;
  supplierId: string;
  type: 'debit' | 'credit'; // مدين | دائن
  amount: number;
  balance: number;
  description: string;
  referenceId?: string | null;
  date: Date;
  supplier?: Supplier;
}

// ============================================================
// التصنيفات والمنتجات
// ============================================================

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category | null;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  barcode?: string | null;
  categoryId?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minQuantity: number;
  location?: string | null;
  notes?: string | null;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category | null;
  oilProduct?: OilProduct | null;
}

// ============================================================
// الإكسسوارات
// ============================================================

export interface Accessory {
  id: string;
  name: string;
  barcode?: string | null;
  price: number;
  quantity: number;
  minQuantity: number;
  imageUrl?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessorySaleItem {
  id: string;
  invoiceId: string;
  accessoryId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  accessory?: Accessory;
}

// ============================================================
// الزيوت
// ============================================================

export interface OilProduct {
  id: string;
  productId: string;
  // نوع البيع وأسعاره
  sellingType: 'retail' | 'wholesale' | 'both';
  retailPrice: number;      // سعر التجزئة للعلبة (can)
  wholesalePrice: number;   // سعر الجملة للعلبة (can)
  // معلومات الكرتونة والعلبة
  cartonUnitsCount: number; // عدد العلب في الكرتون
  canCapacityLiters: number; // سعة العلبة بالتر
  // حقول إضافية
  brand?: string | null;
  oilType?: string | null;
  size?: string | null;
  batchNumber?: string | null;
  expirationDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  openContainers?: OpenContainer[];
  stockMovements?: OilStockMovement[];
}

export interface OpenContainer {
  id: string;
  oilProductId: string;
  remainingLiters: number;
  canCapacityLiters: number;
  openedAt: Date;
  isClosed: boolean;
  oilProduct?: OilProduct;
}

export interface OilStockMovement {
  id: string;
  oilProductId: string;
  type: string; // شراء | بيع | مرتجع | تسوية
  unit: OilUnit;
  quantity: number;
  date: Date;
  reference?: string | null;
  notes?: string | null;
  createdAt: Date;
  oilProduct?: OilProduct;
}

// ============================================================
// غسيل السيارات والدراجات
// ============================================================

export interface WashOrder {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  vehicleType: WashVehicleType;
  vehiclePlate?: string | null;
  serviceType: WashServiceType;
  receivedDate: Date;
  deliveryDate?: Date | null;
  price: number;
  paid: number;
  status: WashOrderStatus;
  notes?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer | null;
  createdBy?: User;
}

// ============================================================
// فواتير الشراء
// ============================================================

export interface PurchaseItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  product?: Product;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  date: Date;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  notes?: string | null;
  status: 'draft' | 'confirmed' | 'paid' | 'partial' | 'cancelled';
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  supplier?: Supplier;
  createdBy?: User;
  items?: PurchaseItem[];
}

// ============================================================
// فواتير البيع
// ============================================================

export interface SaleItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  unit: string; // piece | carton | can | liter
  product?: Product;
}

export interface SaleInvoice {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  date: Date;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  notes?: string | null;
  status: 'draft' | 'confirmed' | 'paid' | 'partial' | 'cancelled';
  isReturn: boolean;
  originalInvoiceId?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer | null;
  createdBy?: User;
  items?: SaleItem[];
  accessoryItems?: AccessorySaleItem[];
}

// ============================================================
// المخزون
// ============================================================

export interface InventoryCountItem {
  id: string;
  countId: string;
  productId: string;
  systemQuantity: number;
  actualQuantity: number;
  difference: number;
  notes?: string | null;
  product?: Product;
}

export interface InventoryCount {
  id: string;
  date: Date;
  notes?: string | null;
  status: 'draft' | 'completed' | 'cancelled';
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
  items?: InventoryCountItem[];
}

export interface StockAdjustment {
  id: string;
  productId: string;
  type: 'add' | 'remove' | 'damaged' | 'missing';
  quantity: number;
  reason?: string | null;
  date: Date;
  notes?: string | null;
  createdById: string;
  createdAt: Date;
  product?: Product;
  createdBy?: User;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  reference?: string | null;
  referenceId?: string | null;
  date: Date;
  notes?: string | null;
  createdAt: Date;
  product?: Product;
}

// ============================================================
// المعاملات النقدية
// ============================================================

export interface CashTransaction {
  id: string;
  type: 'income' | 'expense' | 'payment' | 'receipt';
  amount: number;
  description: string;
  reference?: string | null;
  referenceId?: string | null;
  customerId?: string | null;
  supplierId?: string | null;
  purchaseInvoiceId?: string | null;
  saleInvoiceId?: string | null;
  washOrderId?: string | null;
  date: Date;
  createdById: string;
  createdAt: Date;
  createdBy?: User;
}

// ============================================================
// الشركاء
// ============================================================

export interface Partner {
  id: string;
  name: string;
  capitalAmount: number;
  profitPercentage: number;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerWithdrawal {
  id: string;
  partnerId: string;
  amount: number;
  date: Date;
  notes?: string | null;
  createdAt: Date;
  partner?: Partner;
}

export interface BusinessExpense {
  id: string;
  amount: number;
  description: string;
  category: 'rent' | 'salary' | 'utilities' | 'maintenance' | 'other';
  date: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface ProfitDistribution {
  id: string;
  period: 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  distributedAt: Date;
  notes?: string | null;
}

// ============================================================
// أنواع استجابة API / IPC
// ============================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Arabic labels map for service types (used in UI and print)
export const WASH_SERVICE_LABELS: Record<WashServiceType, string> = {
  bag_polish:        'شنطة ومطور',
  interior_exterior: 'داخلي وخارجي',
  chemical_wash:     'غسيل كيميائي',
  exterior_only:     'خارجي فقط',
  vip:               'VIP',
  bike_wash:         'غسيل دراجة',
};

export const WASH_STATUS_LABELS: Record<WashOrderStatus, string> = {
  received:  'مستلم',
  washing:   'جارٍ الغسيل',
  ready:     'جاهز للتسليم',
  delivered: 'تم التسليم',
  cancelled: 'ملغى',
};

export const OIL_UNIT_LABELS: Record<OilUnit, string> = {
  carton: 'كرتون',
  can:    'علبة',
  liter:  'تر',
};

// ============================================================
// نقل المخزون
// ============================================================

export interface InventoryTransfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  toLocation: string;
  date: Date;
  status: string;
  notes?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  items: InventoryTransferItem[];
}

export interface InventoryTransferItem {
  id: string;
  transferId: string;
  productId: string;
  quantity: number;
  product?: any;
}

