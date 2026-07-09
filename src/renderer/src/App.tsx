import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { HomePage } from './pages/home/HomePage';
import './i18n';

// تحميل متأخر للصفحات لتحسين الأداء
const CustomerListPage    = lazy(() => import('./pages/customers/CustomerListPage').then(m => ({ default: m.CustomerListPage })));
const CustomerStatementPage = lazy(() => import('./pages/customers/CustomerStatementPage').then(m => ({ default: m.CustomerStatementPage })));
const SupplierListPage    = lazy(() => import('./pages/suppliers/SupplierListPage').then(m => ({ default: m.SupplierListPage })));
const SupplierStatementPage = lazy(() => import('./pages/suppliers/SupplierStatementPage').then(m => ({ default: m.SupplierStatementPage })));
const ProductListPage     = lazy(() => import('./pages/products/ProductListPage').then(m => ({ default: m.ProductListPage })));
const AccessoryListPage   = lazy(() => import('./pages/accessories/AccessoryListPage').then(m => ({ default: m.AccessoryListPage })));
const PurchaseListPage    = lazy(() => import('./pages/purchases/PurchaseListPage').then(m => ({ default: m.PurchaseListPage })));
const PurchaseFormPage    = lazy(() => import('./pages/purchases/PurchaseFormPage').then(m => ({ default: m.PurchaseFormPage })));
const PurchaseDetailsPage = lazy(() => import('./pages/purchases/PurchaseDetailsPage').then(m => ({ default: m.PurchaseDetailsPage })));
const SaleListPage        = lazy(() => import('./pages/sales/SaleListPage').then(m => ({ default: m.SaleListPage })));
const SaleFormPage        = lazy(() => import('./pages/sales/SaleFormPage').then(m => ({ default: m.SaleFormPage })));
const SaleDetailsPage     = lazy(() => import('./pages/sales/SaleDetailsPage').then(m => ({ default: m.SaleDetailsPage })));
const OilListPage         = lazy(() => import('./pages/oil/OilListPage').then(m => ({ default: m.OilListPage })));
const WashListPage        = lazy(() => import('./pages/wash/WashListPage').then(m => ({ default: m.WashListPage })));
const WashFormPage        = lazy(() => import('./pages/wash/WashFormPage').then(m => ({ default: m.WashFormPage })));
const WashDetailsPage     = lazy(() => import('./pages/wash/WashDetailsPage').then(m => ({ default: m.WashDetailsPage })));
const InventoryPage       = lazy(() => import('./pages/inventory/StockCountListPage').then(m => ({ default: m.StockCountListPage })));
const StockCountFormPage  = lazy(() => import('./pages/inventory/StockCountFormPage').then(m => ({ default: m.StockCountFormPage })));
const StockMovementListPage = lazy(() => import('./pages/inventory/StockMovementListPage').then(m => ({ default: m.StockMovementListPage })));
const TransferListPage    = lazy(() => import('./pages/inventory/TransferListPage').then(m => ({ default: m.TransferListPage })));
const TransferFormPage    = lazy(() => import('./pages/inventory/TransferFormPage').then(m => ({ default: m.TransferFormPage })));
const ReportsPage         = lazy(() => import('./pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage        = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const PartnerListPage     = lazy(() => import('./pages/partners/PartnerListPage').then(m => ({ default: m.PartnerListPage })));

// شاشة التحميل
const PageLoader = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function App(): React.JSX.Element {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* صفحة تسجيل الدخول */}
            <Route
              path="/login"
              element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
            />

            {/* المسارات المحمية */}
            <Route
              path="/"
              element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />}
            >
              {/* الشاشة الرئيسية */}
              <Route index element={<HomePage />} />

              {/* العملاء */}
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/:id/statement" element={<CustomerStatementPage />} />

              {/* الموردون */}
              <Route path="suppliers" element={<SupplierListPage />} />
              <Route path="suppliers/:id/statement" element={<SupplierStatementPage />} />

              {/* المنتجات */}
              <Route path="products" element={<ProductListPage />} />

              {/* الإكسسوارات */}
              <Route path="accessories" element={<AccessoryListPage />} />

              {/* الزيوت */}
              <Route path="oil" element={<OilListPage />} />

              {/* الغسيل */}
              <Route path="wash" element={<WashListPage />} />
              <Route path="wash/new" element={<WashFormPage />} />
              <Route path="wash/:id" element={<WashDetailsPage />} />
              <Route path="wash/:id/edit" element={<WashFormPage />} />

              {/* المشتريات */}
              <Route path="purchases" element={<PurchaseListPage />} />
              <Route path="purchases/new" element={<PurchaseFormPage />} />
              <Route path="purchases/:id" element={<PurchaseDetailsPage />} />

              {/* المبيعات */}
              <Route path="sales" element={<SaleListPage />} />
              <Route path="sales/new" element={<SaleFormPage />} />
              <Route path="sales/:id" element={<SaleDetailsPage />} />

              {/* المخزون */}
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="inventory/count/new" element={<StockCountFormPage />} />
              <Route path="inventory/movements" element={<StockMovementListPage />} />
              <Route path="inventory/transfers" element={<TransferListPage />} />
              <Route path="inventory/transfers/new" element={<TransferFormPage />} />

              {/* التقارير */}
              <Route path="reports" element={<ReportsPage />} />

              {/* الإعدادات */}
              <Route path="settings" element={<SettingsPage />} />

              {/* الشركاء */}
              <Route path="partners" element={<PartnerListPage />} />

              {/* مسار افتراضي */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
