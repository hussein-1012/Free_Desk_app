import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// واجهة API الآمنة المكشوفة للمُعالِج (renderer)
const api = {
  // ============================================================
  // المصادقة
  // ============================================================
  login:      (credentials: any) => ipcRenderer.invoke('auth:login', credentials),
  logout:     ()                 => ipcRenderer.invoke('auth:logout'),
  createUser: (data: any)        => ipcRenderer.invoke('auth:createUser', data),
  updateUser: (id: string, data: any) => ipcRenderer.invoke('auth:updateUser', id, data),
  deleteUser: (id: string, requestedBy?: string) => ipcRenderer.invoke('auth:deleteUser', id, requestedBy),
  getUsers:   ()                 => ipcRenderer.invoke('auth:getUsers'),
  unlockUser: (id: string)       => ipcRenderer.invoke('auth:unlockUser', id),
  verifyToken: (token: string)   => ipcRenderer.invoke('auth:verify', token),

  // ============================================================
  // العملاء
  // ============================================================
  getCustomers:          (params: any) => ipcRenderer.invoke('customer:getAll', params),
  getCustomerById:       (id: string)  => ipcRenderer.invoke('customer:getById', id),
  createCustomer:        (data: any)   => ipcRenderer.invoke('customer:create', data),
  updateCustomer:        (id: string, data: any) => ipcRenderer.invoke('customer:update', id, data),
  deleteCustomer:        (id: string)  => ipcRenderer.invoke('customer:delete', id),
  getCustomerStatement:  (id: string)  => ipcRenderer.invoke('customer:getStatement', id),
  addOdometerReading:    (data: any)   => ipcRenderer.invoke('customer:addOdometer', data),
  getOdometerHistory:    (customerId: string) => ipcRenderer.invoke('customer:getOdometerHistory', customerId),

  // ============================================================
  // الموردون
  // ============================================================
  getSuppliers:         (params: any) => ipcRenderer.invoke('supplier:getAll', params),
  getSupplierById:      (id: string)  => ipcRenderer.invoke('supplier:getById', id),
  createSupplier:       (data: any)   => ipcRenderer.invoke('supplier:create', data),
  updateSupplier:       (id: string, data: any) => ipcRenderer.invoke('supplier:update', id, data),
  deleteSupplier:       (id: string)  => ipcRenderer.invoke('supplier:delete', id),
  getSupplierStatement: (id: string)  => ipcRenderer.invoke('supplier:getStatement', id),

  // ============================================================
  // المنتجات والتصنيفات
  // ============================================================
  getProducts:      (params: any) => ipcRenderer.invoke('product:getAll', params),
  getProductById:   (id: string)  => ipcRenderer.invoke('product:getById', id),
  createProduct:    (data: any)   => ipcRenderer.invoke('product:create', data),
  updateProduct:    (id: string, data: any) => ipcRenderer.invoke('product:update', id, data),
  deleteProduct:    (id: string)  => ipcRenderer.invoke('product:delete', id),
  getLowStockProducts: (minLimit?: number) => ipcRenderer.invoke('product:getLowStock', minLimit),
  getProductByBarcode: (barcode: string)   => ipcRenderer.invoke('product:getByBarcode', barcode),

  getCategories:    ()           => ipcRenderer.invoke('category:getAll'),
  createCategory:   (data: any)  => ipcRenderer.invoke('category:create', data),
  updateCategory:   (id: string, data: any) => ipcRenderer.invoke('category:update', id, data),
  deleteCategory:   (id: string) => ipcRenderer.invoke('category:delete', id),

  // ============================================================
  // الإكسسوارات
  // ============================================================
  getAccessories:      (params: any) => ipcRenderer.invoke('accessory:getAll', params),
  getAccessoryById:    (id: string)  => ipcRenderer.invoke('accessory:getById', id),
  createAccessory:     (data: any)   => ipcRenderer.invoke('accessory:create', data),
  updateAccessory:     (id: string, data: any) => ipcRenderer.invoke('accessory:update', id, data),
  deleteAccessory:     (id: string)  => ipcRenderer.invoke('accessory:delete', id),
  getLowStockAccessories: ()         => ipcRenderer.invoke('accessory:getLowStock'),
  getAccessoryByBarcode: (barcode: string) => ipcRenderer.invoke('accessory:getByBarcode', barcode),

  // ============================================================
  // فواتير الشراء
  // ============================================================
  getPurchaseInvoices:  (params: any) => ipcRenderer.invoke('invoice:getPurchases', params),
  getPurchaseInvoiceById: (id: string) => ipcRenderer.invoke('invoice:getPurchaseById', id),
  createPurchaseInvoice: (data: any, userId: string) => ipcRenderer.invoke('invoice:createPurchase', data, userId),
  deletePurchaseInvoice: (id: string) => ipcRenderer.invoke('invoice:deletePurchase', id),

  // ============================================================
  // فواتير البيع
  // ============================================================
  getSaleInvoices:    (params: any) => ipcRenderer.invoke('invoice:getSales', params),
  getSaleInvoiceById: (id: string)  => ipcRenderer.invoke('invoice:getSaleById', id),
  createSaleInvoice:  (data: any, userId: string) => ipcRenderer.invoke('invoice:createSale', data, userId),
  deleteSaleInvoice:  (id: string)  => ipcRenderer.invoke('invoice:deleteSale', id),
  createSaleReturn:   (originalId: string, data: any, userId: string) => ipcRenderer.invoke('invoice:createReturn', originalId, data, userId),

  // ============================================================
  // الزيوت
  // ============================================================
  getOilProducts:     (params: any) => ipcRenderer.invoke('oil:getAll', params),
  getOilProductById:  (id: string)  => ipcRenderer.invoke('oil:getById', id),
  createOilProduct:   (data: any)   => ipcRenderer.invoke('oil:create', data),
  updateOilProduct:   (id: string, data: any) => ipcRenderer.invoke('oil:update', id, data),
  deleteOilProduct:   (id: string)  => ipcRenderer.invoke('oil:delete', id),
  getOilMovements:    (oilProductId: string)  => ipcRenderer.invoke('oil:getMovements', oilProductId),
  getNearExpiryOils:  (days?: number) => ipcRenderer.invoke('oil:getNearExpiry', days),
  getOpenContainers:  (oilProductId: string) => ipcRenderer.invoke('oil:getOpenContainers', oilProductId),

  // ============================================================
  // غسيل السيارات والدراجات
  // ============================================================
  getWashOrders:         (params: any)  => ipcRenderer.invoke('wash:getAll', params),
  getWashOrderById:      (id: string)   => ipcRenderer.invoke('wash:getById', id),
  createWashOrder:       (data: any, userId: string) => ipcRenderer.invoke('wash:create', data, userId),
  updateWashOrder:       (id: string, data: any) => ipcRenderer.invoke('wash:update', id, data),
  updateWashOrderStatus: (id: string, status: string) => ipcRenderer.invoke('wash:updateStatus', id, status),
  deleteWashOrder:       (id: string)   => ipcRenderer.invoke('wash:delete', id),
  getWashCountByStatus:  ()             => ipcRenderer.invoke('wash:countByStatus'),
  getTodayWashOrders:    ()             => ipcRenderer.invoke('wash:getToday'),

  // ============================================================
  // الشركاء
  // ============================================================
  getPartners:         (params: any) => ipcRenderer.invoke('partner:getAll', params),
  getPartnerById:      (id: string)  => ipcRenderer.invoke('partner:getById', id),
  createPartner:       (data: any)   => ipcRenderer.invoke('partner:create', data),
  updatePartner:       (id: string, data: any) => ipcRenderer.invoke('partner:update', id, data),
  deletePartner:       (id: string)  => ipcRenderer.invoke('partner:delete', id),
  addPartnerWithdrawal: (data: any)  => ipcRenderer.invoke('partner:addWithdrawal', data),
  getPartnerWithdrawals: (partnerId?: string) => ipcRenderer.invoke('partner:getWithdrawals', partnerId),
  addBusinessExpense:  (data: any)   => ipcRenderer.invoke('partner:addExpense', data),
  getBusinessExpenses: (params: any) => ipcRenderer.invoke('partner:getExpenses', params),
  distributeProfit:    (data: any)   => ipcRenderer.invoke('partner:distributeProfit', data),
  getProfitDistributions: ()         => ipcRenderer.invoke('partner:getDistributions'),

  // ============================================================
  // المخزون
  // ============================================================
  getInventoryCounts:   (params: any) => ipcRenderer.invoke('inventory:getCounts', params),
  getInventoryCountById: (id: string) => ipcRenderer.invoke('inventory:getCountById', id),
  createInventoryCount: (data: any, userId: string) => ipcRenderer.invoke('inventory:createCount', data, userId),
  createStockAdjustment: (data: any, userId: string) => ipcRenderer.invoke('inventory:createAdjustment', data, userId),
  getStockAdjustments:  (params: any) => ipcRenderer.invoke('inventory:getAdjustments', params),
  getInventoryMovements: (params: any) => ipcRenderer.invoke('inventory:getMovements', params),
  createInventoryTransfer: (data: any, userId: string) => ipcRenderer.invoke('inventory:createTransfer', data, userId),
  getInventoryTransfers: (params: any) => ipcRenderer.invoke('inventory:getTransfers', params),
  getInventoryTransferById: (id: string) => ipcRenderer.invoke('inventory:getTransferById', id),

  // ============================================================
  // الإعدادات
  // ============================================================
  getSettings:    () => ipcRenderer.invoke('settings:getAll'),
  updateSettings: (settings: Record<string, string>) => ipcRenderer.invoke('settings:updateAll', settings),

  // ============================================================
  // التقارير
  // ============================================================
  getDashboardReport: ()             => ipcRenderer.invoke('report:getDashboard'),
  getSalesReport:     (period: string) => ipcRenderer.invoke('report:getSales', period),
  getPurchaseReport:  (period: string) => ipcRenderer.invoke('report:getPurchases', period),
  getProfitReport:    (period: string) => ipcRenderer.invoke('report:getProfit', period),

  // ============================================================
  // سجل العمليات
  // ============================================================
  getAuditLogs: (params: any) => ipcRenderer.invoke('audit:getLogs', params),

  // ============================================================
  // النسخ الاحتياطي
  // ============================================================
  createBackup:  () => ipcRenderer.invoke('backup:create'),
  restoreBackup: () => ipcRenderer.invoke('backup:restore'),

  // ============================================================
  // الطباعة والملفات
  // ============================================================
  printWindow:   (silent?: boolean)  => ipcRenderer.invoke('print:window', silent),
  savePDFFile:   (base64: string, defaultName: string) => ipcRenderer.invoke('file:savePDF', base64, defaultName),
  saveExcelFile: (base64: string, defaultName: string) => ipcRenderer.invoke('file:saveExcel', base64, defaultName),
  readExcelFile: () => ipcRenderer.invoke('file:readExcel'),
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore
  window.electron = electronAPI;
  // @ts-ignore
  window.api = api;
}

export type ApiBridge = typeof api;
