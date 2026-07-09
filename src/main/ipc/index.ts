// // طبقة IPC — تسجيل جميع معالجات القنوات
// import { ipcMain, BrowserWindow } from 'electron';
// import { AuthService } from '../services/auth.service';
// import { CustomerService } from '../services/customer.service';
// import { SupplierService } from '../services/supplier.service';
// import { ProductService } from '../services/product.service';
// import { InvoiceService } from '../services/invoice.service';
// import { OilService } from '../services/oil.service';
// import { WashService } from '../services/wash.service';
// import { AccessoryService } from '../services/accessory.service';
// import { PartnerService } from '../services/partner.service';
// import { InventoryService } from '../services/inventory.service';
// import { SettingService } from '../services/setting.service';
// import { ReportService } from '../services/report.service';
// import { BackupService } from '../services/backup.service';
// import { PrintService } from '../services/print.service';
// import { AuditService } from '../services/audit.service';

// export function registerIpcHandlers(mainWindow: BrowserWindow): void {
//   // إنشاء نسخ الخدمات
//   const authService = new AuthService();
//   const customerService = new CustomerService();
//   const supplierService = new SupplierService();
//   const productService = new ProductService();
//   const invoiceService = new InvoiceService();
//   const oilService = new OilService();
//   const washService = new WashService();
//   const accessoryService = new AccessoryService();
//   const partnerService = new PartnerService();
//   const inventoryService = new InventoryService();
//   const settingService = new SettingService();
//   const reportService = new ReportService();
//   const backupService = new BackupService();
//   const printService = new PrintService();
//   const auditService = new AuditService();

//   // جلسة المستخدم الحالية في Backend لمنع التلاعب
//   let currentSessionUser: { id: string; role: string } | null = null;

//   // دالة مساعدة لتغليف استدعاءات الخدمات بأمان والتحقق من الصلاحيات (RBAC)
//   const handle = (channel: string, handler: Function, allowedRoles?: string[]) => {
//     ipcMain.handle(channel, async (_event, ...args) => {
//       try {
//         // التحقق من الصلاحيات
//         if (allowedRoles && (!currentSessionUser || !allowedRoles.includes(currentSessionUser.role))) {
//           return { success: false, error: 'غير مصرح لك بالقيام بهذا الإجراء' };
//         }
//         const argsWithUser = currentSessionUser ? [...args, currentSessionUser.id] : args;
//         const result = await handler(...argsWithUser);

//         // تحديث حالة جلسة المستخدم عند تسجيل الدخول أو التحقق من التوكن
//         if (channel === 'auth:login' && result.success && result.data?.user) {
//           currentSessionUser = { id: result.data.user.id, role: result.data.user.role };
//         } else if (channel === 'auth:verify') {
//           if (result.success && result.data) {
//             currentSessionUser = { id: result.data.id, role: result.data.role };
//           } else {
//             currentSessionUser = null;
//           }
//         }

//         return result;
//       } catch (err: any) {
//         console.error(`IPC Error [${channel}]:`, err);
//         return { success: false, error: 'حدث خطأ غير متوقع في النظام' };
//       }
//     });
//   };

//   // تسجيل قناة تسجيل خروج لتطهير الجلسة في Backend
//   ipcMain.handle('auth:logout', () => {
//     currentSessionUser = null;
//     return { success: true };
//   });

//   // ============================================================
//   // المصادقة (Auth)
//   // ============================================================
//   handle('auth:login',      authService.login.bind(authService));
//   handle('auth:verify',     authService.verifyToken.bind(authService));
  
//   handle('auth:createUser', authService.createUser.bind(authService), ['admin']);
//   handle('auth:updateUser', authService.updateUser.bind(authService), ['admin']);
//   handle('auth:deleteUser', authService.deleteUser.bind(authService), ['admin']);
//   handle('auth:getUsers',   authService.getUsers.bind(authService),   ['admin']);
//   handle('auth:unlockUser', authService.unlockUser.bind(authService), ['admin']);

//   // ============================================================
//   // العملاء (Customers)
//   // ============================================================
//   handle('customer:getAll',           customerService.getCustomers.bind(customerService),          ['admin', 'manager', 'cashier']);
//   handle('customer:getById',          customerService.getCustomerById.bind(customerService),       ['admin', 'manager', 'cashier']);
  
//   handle('customer:create',           customerService.createCustomer.bind(customerService),        ['admin', 'manager']);
//   handle('customer:update',           customerService.updateCustomer.bind(customerService),        ['admin', 'manager']);
//   handle('customer:delete',           customerService.deleteCustomer.bind(customerService),        ['admin', 'manager']);
//   handle('customer:getStatement',     customerService.getCustomerStatement.bind(customerService),    ['admin', 'manager']);
//   handle('customer:addOdometer',      customerService.addOdometerReading.bind(customerService),     ['admin', 'manager']);
//   handle('customer:getOdometerHistory', customerService.getOdometerHistory.bind(customerService),   ['admin', 'manager']);

//   // ============================================================
//   // الموردون (Suppliers)
//   // ============================================================
//   handle('supplier:getAll',       supplierService.getSuppliers.bind(supplierService),          ['admin', 'manager']);
//   handle('supplier:getById',      supplierService.getSupplierById.bind(supplierService),         ['admin', 'manager']);
//   handle('supplier:create',       supplierService.createSupplier.bind(supplierService),          ['admin', 'manager']);
//   handle('supplier:update',       supplierService.updateSupplier.bind(supplierService),          ['admin', 'manager']);
//   handle('supplier:delete',       supplierService.deleteSupplier.bind(supplierService),          ['admin', 'manager']);
//   handle('supplier:getStatement', supplierService.getSupplierStatement.bind(supplierService),    ['admin', 'manager']);

//   // ============================================================
//   // المنتجات والتصنيفات (Products)
//   // ============================================================
//   handle('product:getAll',      productService.getProducts.bind(productService),            ['admin', 'manager', 'cashier']);
//   handle('product:getById',     productService.getProductById.bind(productService),           ['admin', 'manager', 'cashier']);
//   handle('product:getLowStock', productService.getLowStockProducts.bind(productService),      ['admin', 'manager', 'cashier']);
//   handle('product:getByBarcode', productService.findProductByBarcode.bind(productService),     ['admin', 'manager', 'cashier']);
//   handle('category:getAll',     productService.getCategories.bind(productService),          ['admin', 'manager', 'cashier']);
  
//   handle('product:create',      productService.createProduct.bind(productService),          ['admin', 'manager']);
//   handle('product:update',      productService.updateProduct.bind(productService),          ['admin', 'manager']);
//   handle('product:delete',      productService.deleteProduct.bind(productService),          ['admin', 'manager']);
//   handle('category:create',     productService.createCategory.bind(productService),         ['admin', 'manager']);
//   handle('category:update',     productService.updateCategory.bind(productService),         ['admin', 'manager']);
//   handle('category:delete',     productService.deleteCategory.bind(productService),         ['admin', 'manager']);

//   // ============================================================
//   // الإكسسوارات (Accessories)
//   // ============================================================
//   handle('accessory:getAll',      accessoryService.getAccessories.bind(accessoryService),      ['admin', 'manager', 'cashier']);
//   handle('accessory:getById',     accessoryService.getAccessoryById.bind(accessoryService),     ['admin', 'manager', 'cashier']);
//   handle('accessory:getLowStock', accessoryService.getLowStockAccessories.bind(accessoryService),['admin', 'manager', 'cashier']);
//   handle('accessory:getByBarcode', accessoryService.findByBarcode.bind(accessoryService),       ['admin', 'manager', 'cashier']);
  
//   handle('accessory:create',      accessoryService.createAccessory.bind(accessoryService),      ['admin', 'manager']);
//   handle('accessory:update',      accessoryService.updateAccessory.bind(accessoryService),      ['admin', 'manager']);
//   handle('accessory:delete',      accessoryService.deleteAccessory.bind(accessoryService),      ['admin', 'manager']);

//   // ============================================================
//   // فواتير الشراء والبيع (Invoices)
//   // ============================================================
//   handle('invoice:getPurchases',     invoiceService.getPurchaseInvoices.bind(invoiceService),     ['admin', 'manager']);
//   handle('invoice:getPurchaseById',  invoiceService.getPurchaseInvoiceById.bind(invoiceService),  ['admin', 'manager']);
//   handle('invoice:createPurchase',   invoiceService.createPurchaseInvoice.bind(invoiceService),   ['admin', 'manager']);
//   handle('invoice:deletePurchase',   invoiceService.deletePurchaseInvoice.bind(invoiceService),   ['admin', 'manager']);

//   handle('invoice:getSales',       invoiceService.getSaleInvoices.bind(invoiceService),         ['admin', 'cashier']);
//   handle('invoice:getSaleById',    invoiceService.getSaleInvoiceById.bind(invoiceService),      ['admin', 'cashier']);
//   handle('invoice:createSale',     invoiceService.createSaleInvoice.bind(invoiceService),       ['admin', 'cashier']);
//   handle('invoice:deleteSale',     invoiceService.deleteSaleInvoice.bind(invoiceService),       ['admin', 'cashier']);
//   handle('invoice:createReturn',   invoiceService.createSaleReturn.bind(invoiceService),         ['admin', 'cashier']);

//   // ============================================================
//   // الزيوت (Oils)
//   // ============================================================
//   handle('oil:getAll',         oilService.getOilProducts.bind(oilService),              ['admin', 'manager', 'cashier']);
//   handle('oil:getById',        oilService.getOilProductById.bind(oilService),             ['admin', 'manager', 'cashier']);
//   handle('oil:getMovements',   oilService.getStockMovements.bind(oilService),            ['admin', 'manager', 'cashier']);
//   handle('oil:getNearExpiry',  oilService.getNearExpiryProducts.bind(oilService),         ['admin', 'manager', 'cashier']);
//   handle('oil:getOpenContainers', oilService.getOpenContainers.bind(oilService),          ['admin', 'manager', 'cashier']);
  
//   handle('oil:create',         oilService.createOilProduct.bind(oilService),              ['admin', 'manager']);
//   handle('oil:update',         oilService.updateOilProduct.bind(oilService),              ['admin', 'manager']);
//   handle('oil:delete',         oilService.deleteOilProduct.bind(oilService),              ['admin', 'manager']);

//   // ============================================================
//   // غسيل السيارات والدراجات (Wash)
//   // ============================================================
//   handle('wash:getAll',        washService.getWashOrders.bind(washService),                 ['admin', 'cashier']);
//   handle('wash:getById',       washService.getWashOrderById.bind(washService),                ['admin', 'cashier']);
//   handle('wash:create',        washService.createWashOrder.bind(washService),                 ['admin', 'cashier']);
//   handle('wash:update',        washService.updateWashOrder.bind(washService),                 ['admin', 'cashier']);
//   handle('wash:updateStatus',  washService.updateOrderStatus.bind(washService),                 ['admin', 'cashier']);
//   handle('wash:delete',        washService.deleteWashOrder.bind(washService),                 ['admin', 'cashier']);
//   handle('wash:countByStatus', washService.getWashOrdersCountByStatus.bind(washService),          ['admin', 'cashier']);
//   handle('wash:getToday',      washService.getTodayWashOrders.bind(washService),              ['admin', 'cashier']);

//   // ============================================================
//   // الشركاء (Partners)
//   // ============================================================
//   handle('partner:getAll',          partnerService.getPartners.bind(partnerService),            ['admin']);
//   handle('partner:getById',         partnerService.getPartnerById.bind(partnerService),           ['admin']);
//   handle('partner:create',          partnerService.createPartner.bind(partnerService),            ['admin']);
//   handle('partner:update',          partnerService.updatePartner.bind(partnerService),            ['admin']);
//   handle('partner:delete',          partnerService.deletePartner.bind(partnerService),            ['admin']);
//   handle('partner:addWithdrawal',   partnerService.addWithdrawal.bind(partnerService),            ['admin']);
//   handle('partner:getWithdrawals',  partnerService.getWithdrawals.bind(partnerService),           ['admin']);
//   handle('partner:addExpense',      partnerService.addExpense.bind(partnerService),            ['admin']);
//   handle('partner:getExpenses',     partnerService.getExpenses.bind(partnerService),           ['admin']);
//   handle('partner:distributeProfit', partnerService.distributeProfit.bind(partnerService),          ['admin']);
//   handle('partner:getDistributions', partnerService.getDistributions.bind(partnerService),          ['admin']);

//   // ============================================================
//   // المخزون (Inventory)
//   // ============================================================
//   handle('inventory:getCounts',       inventoryService.getInventoryCounts.bind(inventoryService),   ['admin', 'manager']);
//   handle('inventory:getCountById',    inventoryService.getInventoryCountById.bind(inventoryService),['admin', 'manager']);
//   handle('inventory:createCount',     inventoryService.createInventoryCount.bind(inventoryService),['admin', 'manager']);
//   handle('inventory:createAdjustment', inventoryService.createStockAdjustment.bind(inventoryService),['admin', 'manager']);
//   handle('inventory:getAdjustments',  inventoryService.getStockAdjustments.bind(inventoryService),  ['admin', 'manager']);
//   handle('inventory:getMovements',    inventoryService.getInventoryMovements.bind(inventoryService),['admin', 'manager']);
//   handle('inventory:createTransfer',  inventoryService.createInventoryTransfer.bind(inventoryService),['admin', 'manager']);
//   handle('inventory:getTransfers',    inventoryService.getInventoryTransfers.bind(inventoryService),['admin', 'manager']);
//   handle('inventory:getTransferById', inventoryService.getInventoryTransferById.bind(inventoryService),['admin', 'manager']);

//   // ============================================================
//   // الإعدادات (Settings)
//   // ============================================================
//   handle('settings:getAll',    settingService.getSettings.bind(settingService),             ['admin']);
//   handle('settings:updateAll', settingService.updateSettings.bind(settingService),          ['admin']);

//   // ============================================================
//   // التقارير (Reports)
//   // ============================================================
//   handle('report:getDashboard', reportService.getDashboardSummary.bind(reportService),       ['admin']);
//   handle('report:getSales',     reportService.getSalesReport.bind(reportService),           ['admin']);
//   handle('report:getPurchases', reportService.getPurchaseReport.bind(reportService),        ['admin']);
//   handle('report:getProfit',    reportService.getProfitReport.bind(reportService),           ['admin']);

//   // ============================================================
//   // النسخ الاحتياطي (Backup)
//   // ============================================================
//   handle('backup:create',  backupService.createManualBackup.bind(backupService),            ['admin']);
//   handle('backup:restore', backupService.restoreFromBackup.bind(backupService),             ['admin']);

//   // ============================================================
//   // سجل العمليات (Audit Logs)
//   // ============================================================
//   handle('audit:getLogs', auditService.getAuditLogs.bind(auditService),                     ['admin']);

//   // ============================================================
//   // الطباعة والملفات (Print and Files)
//   // ============================================================
//   ipcMain.handle('print:window', async (_event, silent) => {
//     return printService.printWindow(mainWindow, silent);
//   });
//   handle('file:savePDF',   printService.savePDFFile.bind(printService),                     ['admin', 'manager', 'cashier']);
//   handle('file:saveExcel', printService.saveExcelFile.bind(printService),                   ['admin', 'manager', 'cashier']);
//   handle('file:readExcel', printService.readExcelFile.bind(printService),                   ['admin', 'manager', 'cashier']);
// }

// طبقة IPC — تسجيل جميع معالجات القنوات
import { ipcMain, BrowserWindow } from 'electron';
import { AuthService } from '../services/auth.service';
import { CustomerService } from '../services/customer.service';
import { SupplierService } from '../services/supplier.service';
import { ProductService } from '../services/product.service';
import { InvoiceService } from '../services/invoice.service';
import { OilService } from '../services/oil.service';
import { WashService } from '../services/wash.service';
import { AccessoryService } from '../services/accessory.service';
import { PartnerService } from '../services/partner.service';
import { InventoryService } from '../services/inventory.service';
import { SettingService } from '../services/setting.service';
import { ReportService } from '../services/report.service';
import { BackupService } from '../services/backup.service';
import { PrintService } from '../services/print.service';
import { AuditService } from '../services/audit.service';

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  // إنشاء نسخ الخدمات
  const authService = new AuthService();
  const customerService = new CustomerService();
  const supplierService = new SupplierService();
  const productService = new ProductService();
  const invoiceService = new InvoiceService();
  const oilService = new OilService();
  const washService = new WashService();
  const accessoryService = new AccessoryService();
  const partnerService = new PartnerService();
  const inventoryService = new InventoryService();
  const settingService = new SettingService();
  const reportService = new ReportService();
  const backupService = new BackupService();
  const printService = new PrintService();
  const auditService = new AuditService();

  // جلسة المستخدم الحالية في Backend لمنع التلاعب
  let currentSessionUser: { id: string; role: string } | null = null;

  // دالة مساعدة لتغليف استدعاءات الخدمات بأمان والتحقق من الصلاحيات (RBAC)
  const handle = (channel: string, handler: Function, allowedRoles?: string[]) => {
    ipcMain.handle(channel, async (_event, ...args) => {
      try {
        // التحقق من الصلاحيات
        if (allowedRoles && (!currentSessionUser || !allowedRoles.includes(currentSessionUser.role))) {
          return { success: false, error: 'غير مصرح لك بالقيام بهذا الإجراء' };
        }
        const argsWithUser = currentSessionUser ? [...args, currentSessionUser.id] : args;
        const result = await handler(...argsWithUser);

        // تحديث حالة جلسة المستخدم عند تسجيل الدخول أو التحقق من التوكن
        if (channel === 'auth:login' && result.success && result.data?.user) {
          currentSessionUser = { id: result.data.user.id, role: result.data.user.role };
        } else if (channel === 'auth:verify') {
          if (result.success && result.data) {
            currentSessionUser = { id: result.data.id, role: result.data.role };
          } else {
            currentSessionUser = null;
          }
        }

        return result;
      } catch (err: any) {
        console.error(`IPC Error [${channel}]:`, err);
        return { success: false, error: 'حدث خطأ غير متوقع في النظام' };
      }
    });
  };

  // تسجيل قناة تسجيل خروج لتطهير الجلسة في Backend
  ipcMain.handle('auth:logout', () => {
    currentSessionUser = null;
    return { success: true };
  });

  // ============================================================
  // المصادقة (Auth)
  // ============================================================
  handle('auth:login',      authService.login.bind(authService));
  handle('auth:verify',     authService.verifyToken.bind(authService));
  
  handle('auth:createUser', authService.createUser.bind(authService), ['admin']);
  handle('auth:updateUser', authService.updateUser.bind(authService), ['admin']);
  handle('auth:getUsers',   authService.getUsers.bind(authService),   ['admin']);
  handle('auth:unlockUser', authService.unlockUser.bind(authService), ['admin']);
  handle('auth:deleteUser', authService.deleteUser.bind(authService), ['admin']);

  // ============================================================
  // العملاء (Customers)
  // ============================================================
  handle('customer:getAll',           customerService.getCustomers.bind(customerService),          ['admin', 'manager', 'cashier']);
  handle('customer:getById',          customerService.getCustomerById.bind(customerService),       ['admin', 'manager', 'cashier']);
  
  handle('customer:create',           customerService.createCustomer.bind(customerService),        ['admin', 'manager']);
  handle('customer:update',           customerService.updateCustomer.bind(customerService),        ['admin', 'manager']);
  handle('customer:delete',           customerService.deleteCustomer.bind(customerService),        ['admin', 'manager']);
  handle('customer:getStatement',     customerService.getCustomerStatement.bind(customerService),    ['admin', 'manager']);
  handle('customer:addOdometer',      customerService.addOdometerReading.bind(customerService),     ['admin', 'manager']);
  handle('customer:getOdometerHistory', customerService.getOdometerHistory.bind(customerService),   ['admin', 'manager']);

  // ============================================================
  // الموردون (Suppliers)
  // ============================================================
  handle('supplier:getAll',       supplierService.getSuppliers.bind(supplierService),          ['admin', 'manager']);
  handle('supplier:getById',      supplierService.getSupplierById.bind(supplierService),         ['admin', 'manager']);
  handle('supplier:create',       supplierService.createSupplier.bind(supplierService),          ['admin', 'manager']);
  handle('supplier:update',       supplierService.updateSupplier.bind(supplierService),          ['admin', 'manager']);
  handle('supplier:delete',       supplierService.deleteSupplier.bind(supplierService),          ['admin', 'manager']);
  handle('supplier:getStatement', supplierService.getSupplierStatement.bind(supplierService),    ['admin', 'manager']);

  // ============================================================
  // المنتجات والتصنيفات (Products)
  // ============================================================
  handle('product:getAll',      productService.getProducts.bind(productService),            ['admin', 'manager', 'cashier']);
  handle('product:getById',     productService.getProductById.bind(productService),           ['admin', 'manager', 'cashier']);
  handle('product:getLowStock', productService.getLowStockProducts.bind(productService),      ['admin', 'manager', 'cashier']);
  handle('product:getByBarcode', productService.findProductByBarcode.bind(productService),     ['admin', 'manager', 'cashier']);
  handle('category:getAll',     productService.getCategories.bind(productService),          ['admin', 'manager', 'cashier']);
  
  handle('product:create',      productService.createProduct.bind(productService),          ['admin', 'manager']);
  handle('product:update',      productService.updateProduct.bind(productService),          ['admin', 'manager']);
  handle('product:delete',      productService.deleteProduct.bind(productService),          ['admin', 'manager']);
  handle('category:create',     productService.createCategory.bind(productService),         ['admin', 'manager']);
  handle('category:update',     productService.updateCategory.bind(productService),         ['admin', 'manager']);
  handle('category:delete',     productService.deleteCategory.bind(productService),         ['admin', 'manager']);

  // ============================================================
  // الإكسسوارات (Accessories)
  // ============================================================
  handle('accessory:getAll',      accessoryService.getAccessories.bind(accessoryService),      ['admin', 'manager', 'cashier']);
  handle('accessory:getById',     accessoryService.getAccessoryById.bind(accessoryService),     ['admin', 'manager', 'cashier']);
  handle('accessory:getLowStock', accessoryService.getLowStockAccessories.bind(accessoryService),['admin', 'manager', 'cashier']);
  handle('accessory:getByBarcode', accessoryService.findByBarcode.bind(accessoryService),       ['admin', 'manager', 'cashier']);
  
  handle('accessory:create',      accessoryService.createAccessory.bind(accessoryService),      ['admin', 'manager']);
  handle('accessory:update',      accessoryService.updateAccessory.bind(accessoryService),      ['admin', 'manager']);
  handle('accessory:delete',      accessoryService.deleteAccessory.bind(accessoryService),      ['admin', 'manager']);

  // ============================================================
  // فواتير الشراء والبيع (Invoices)
  // ============================================================
  handle('invoice:getPurchases',     invoiceService.getPurchaseInvoices.bind(invoiceService),     ['admin', 'manager']);
  handle('invoice:getPurchaseById',  invoiceService.getPurchaseInvoiceById.bind(invoiceService),  ['admin', 'manager']);
  handle('invoice:createPurchase',   invoiceService.createPurchaseInvoice.bind(invoiceService),   ['admin', 'manager']);
  handle('invoice:deletePurchase',   invoiceService.deletePurchaseInvoice.bind(invoiceService),   ['admin', 'manager']);

  handle('invoice:getSales',       invoiceService.getSaleInvoices.bind(invoiceService),         ['admin', 'cashier']);
  handle('invoice:getSaleById',    invoiceService.getSaleInvoiceById.bind(invoiceService),      ['admin', 'cashier']);
  handle('invoice:createSale',     invoiceService.createSaleInvoice.bind(invoiceService),       ['admin', 'cashier']);
  handle('invoice:deleteSale',     invoiceService.deleteSaleInvoice.bind(invoiceService),       ['admin', 'cashier']);
  handle('invoice:createReturn',   invoiceService.createSaleReturn.bind(invoiceService),         ['admin', 'cashier']);

  // ============================================================
  // الزيوت (Oils)
  // ============================================================
  handle('oil:getAll',         oilService.getOilProducts.bind(oilService),              ['admin', 'manager', 'cashier']);
  handle('oil:getById',        oilService.getOilProductById.bind(oilService),             ['admin', 'manager', 'cashier']);
  handle('oil:getMovements',   oilService.getStockMovements.bind(oilService),            ['admin', 'manager', 'cashier']);
  handle('oil:getNearExpiry',  oilService.getNearExpiryProducts.bind(oilService),         ['admin', 'manager', 'cashier']);
  handle('oil:getOpenContainers', oilService.getOpenContainers.bind(oilService),          ['admin', 'manager', 'cashier']);
  
  handle('oil:create',         oilService.createOilProduct.bind(oilService),              ['admin', 'manager']);
  handle('oil:update',         oilService.updateOilProduct.bind(oilService),              ['admin', 'manager']);
  handle('oil:delete',         oilService.deleteOilProduct.bind(oilService),              ['admin', 'manager']);

  // ============================================================
  // غسيل السيارات والدراجات (Wash)
  // ============================================================
  handle('wash:getAll',        washService.getWashOrders.bind(washService),                 ['admin', 'cashier']);
  handle('wash:getById',       washService.getWashOrderById.bind(washService),                ['admin', 'cashier']);
  handle('wash:create',        washService.createWashOrder.bind(washService),                 ['admin', 'cashier']);
  handle('wash:update',        washService.updateWashOrder.bind(washService),                 ['admin', 'cashier']);
  handle('wash:updateStatus',  washService.updateOrderStatus.bind(washService),                 ['admin', 'cashier']);
  handle('wash:delete',        washService.deleteWashOrder.bind(washService),                 ['admin', 'cashier']);
  handle('wash:countByStatus', washService.getWashOrdersCountByStatus.bind(washService),          ['admin', 'cashier']);
  handle('wash:getToday',      washService.getTodayWashOrders.bind(washService),              ['admin', 'cashier']);

  // ============================================================
  // الشركاء (Partners)
  // ============================================================
  handle('partner:getAll',          partnerService.getPartners.bind(partnerService),            ['admin']);
  handle('partner:getById',         partnerService.getPartnerById.bind(partnerService),           ['admin']);
  handle('partner:create',          partnerService.createPartner.bind(partnerService),            ['admin']);
  handle('partner:update',          partnerService.updatePartner.bind(partnerService),            ['admin']);
  handle('partner:delete',          partnerService.deletePartner.bind(partnerService),            ['admin']);
  handle('partner:addWithdrawal',   partnerService.addWithdrawal.bind(partnerService),            ['admin']);
  handle('partner:getWithdrawals',  partnerService.getWithdrawals.bind(partnerService),           ['admin']);
  handle('partner:addExpense',      partnerService.addExpense.bind(partnerService),            ['admin']);
  handle('partner:getExpenses',     partnerService.getExpenses.bind(partnerService),           ['admin']);
  handle('partner:distributeProfit', partnerService.distributeProfit.bind(partnerService),          ['admin']);
  handle('partner:getDistributions', partnerService.getDistributions.bind(partnerService),          ['admin']);

  // ============================================================
  // المخزون (Inventory)
  // ============================================================
  handle('inventory:getCounts',       inventoryService.getInventoryCounts.bind(inventoryService),   ['admin', 'manager']);
  handle('inventory:getCountById',    inventoryService.getInventoryCountById.bind(inventoryService),['admin', 'manager']);
  handle('inventory:createCount',     inventoryService.createInventoryCount.bind(inventoryService),['admin', 'manager']);
  handle('inventory:createAdjustment', inventoryService.createStockAdjustment.bind(inventoryService),['admin', 'manager']);
  handle('inventory:getAdjustments',  inventoryService.getStockAdjustments.bind(inventoryService),  ['admin', 'manager']);
  handle('inventory:getMovements',    inventoryService.getInventoryMovements.bind(inventoryService),['admin', 'manager']);
  handle('inventory:createTransfer',  inventoryService.createInventoryTransfer.bind(inventoryService),['admin', 'manager']);
  handle('inventory:getTransfers',    inventoryService.getInventoryTransfers.bind(inventoryService),['admin', 'manager']);
  handle('inventory:getTransferById', inventoryService.getInventoryTransferById.bind(inventoryService),['admin', 'manager']);

  // ============================================================
  // الإعدادات (Settings)
  // ============================================================
  handle('settings:getAll',    settingService.getSettings.bind(settingService),             ['admin']);
  handle('settings:updateAll', settingService.updateSettings.bind(settingService),          ['admin']);

  // ============================================================
  // التقارير (Reports)
  // ============================================================
  handle('report:getDashboard', reportService.getDashboardSummary.bind(reportService),       ['admin']);
  handle('report:getSales',     reportService.getSalesReport.bind(reportService),           ['admin']);
  handle('report:getPurchases', reportService.getPurchaseReport.bind(reportService),        ['admin']);
  handle('report:getProfit',    reportService.getProfitReport.bind(reportService),           ['admin']);

  // ============================================================
  // النسخ الاحتياطي (Backup)
  // ============================================================
  handle('backup:create',  backupService.createManualBackup.bind(backupService),            ['admin']);
  handle('backup:restore', backupService.restoreFromBackup.bind(backupService),             ['admin']);

  // ============================================================
  // سجل العمليات (Audit Logs)
  // ============================================================
  handle('audit:getLogs', auditService.getAuditLogs.bind(auditService),                     ['admin']);

  // ============================================================
  // الطباعة والملفات (Print and Files)
  // ============================================================
  ipcMain.handle('print:window', async (_event, silent) => {
    return printService.printWindow(mainWindow, silent);
  });
  handle('file:savePDF',   printService.savePDFFile.bind(printService),                     ['admin', 'manager', 'cashier']);
  handle('file:saveExcel', printService.saveExcelFile.bind(printService),                   ['admin', 'manager', 'cashier']);
  handle('file:readExcel', printService.readExcelFile.bind(printService),                   ['admin', 'manager', 'cashier']);
}