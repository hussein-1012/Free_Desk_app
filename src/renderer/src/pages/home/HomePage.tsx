import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets, Car, Users, Truck,
  ShoppingBag, ShoppingCart, Warehouse, BarChart3,
  Settings, TrendingUp, TrendingDown, Wallet,
  AlertTriangle, Clock, Wrench
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

// ============================================================
// تعريف أقسام الشاشة الرئيسية
// ============================================================
const mainSections = [
  {
    id: 'oils',
    label: 'الزيوت',
    icon: Droplets,
    path: '/oil',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    roles: ['admin', 'manager'],
  },
  {
    id: 'wash',
    label: 'غسيل السيارات\nوالدراجات',
    icon: Car,
    path: '/wash',
    color: 'bg-cyan-500',
    lightBg: 'bg-cyan-50',
    iconColor: 'text-cyan-500',
    roles: ['admin', 'cashier'],
  },
  {
    id: 'accessories',
    label: 'الإكسسوارات',
    icon: Wrench,
    path: '/accessories',
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    roles: ['admin', 'manager'],
  },
  {
    id: 'customers',
    label: 'العملاء',
    icon: Users,
    path: '/customers',
    color: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    roles: ['admin', 'manager'],
  },
  {
    id: 'suppliers',
    label: 'الموردون',
    icon: Truck,
    path: '/suppliers',
    color: 'bg-violet-500',
    lightBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    roles: ['admin', 'manager'],
  },
  {
    id: 'purchases',
    label: 'المشتريات',
    icon: ShoppingBag,
    path: '/purchases',
    color: 'bg-rose-500',
    lightBg: 'bg-rose-50',
    iconColor: 'text-rose-500',
    roles: ['admin', 'manager'],
  },
  {
    id: 'sales',
    label: 'المبيعات\nوالفواتير',
    icon: ShoppingCart,
    path: '/sales',
    color: 'bg-teal-500',
    lightBg: 'bg-teal-50',
    iconColor: 'text-teal-500',
    roles: ['admin', 'cashier'],
  },
  {
    id: 'inventory',
    label: 'المخزون',
    icon: Warehouse,
    path: '/inventory',
    color: 'bg-amber-500',
    lightBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    roles: ['admin', 'manager'],
  },
  {
    id: 'reports',
    label: 'التقارير',
    icon: BarChart3,
    path: '/reports',
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    roles: ['admin'],
  },
  {
    id: 'partners',
    label: 'الأرباح والشركاء',
    icon: Users,
    path: '/partners',
    color: 'bg-indigo-500',
    lightBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
    roles: ['admin'],
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    icon: Settings,
    path: '/settings',
    color: 'bg-gray-500',
    lightBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    roles: ['admin'],
  },
];

// ============================================================
// مكون بطاقة الإحصاء
// ============================================================
const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}> = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="card p-4 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
    </div>
  </div>
);

// ============================================================
// الشاشة الرئيسية (Level 1)
// ============================================================
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    window.api.getDashboardReport()
      .then((r: any) => { if (r.success) setStats(r.data); })
      .catch(() => {});
  }, []);

  // فلترة الأقسام حسب صلاحيات المستخدم
  const visibleSections = mainSections.filter((sec) =>
    user && sec.roles.includes(user.role)
  );

  const currency = 'الجنيه';

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* ترحيب */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
            مرحباً، {user?.name} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-xs font-semibold text-green-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          يعمل بدون إنترنت
        </div>
      </div>

      {/* بطاقات الإحصاء */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="مبيعات اليوم" value={`${(stats.todaySales || 0).toFixed(0)} ${currency}`}
            icon={TrendingUp} iconBg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600 dark:text-emerald-400" />
          <StatCard label="مشتريات اليوم" value={`${(stats.todayPurchases || 0).toFixed(0)} ${currency}`}
            icon={TrendingDown} iconBg="bg-rose-100 dark:bg-rose-900/30" iconColor="text-rose-600 dark:text-rose-400" />
          <StatCard label="رصيد الصندوق" value={`${(stats.cashBalance || 0).toFixed(0)} ${currency}`}
            icon={Wallet} iconBg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600 dark:text-blue-400" />
          <StatCard label="العملاء" value={stats.customerCount || 0}
            icon={Users} iconBg="bg-violet-100 dark:bg-violet-900/30" iconColor="text-violet-600 dark:text-violet-400" />
          <StatCard label="طلبات غسيل جارية" value={stats.activeWashOrders || 0}
            icon={Clock} iconBg="bg-cyan-100 dark:bg-cyan-900/30" iconColor="text-cyan-600 dark:text-cyan-400" />
          <StatCard label="مخزون منخفض" value={stats.lowStockAlerts || 0}
            icon={AlertTriangle} iconBg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600 dark:text-amber-400" />
        </div>
      )}

      {/* شبكة الأقسام الرئيسية */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          الأقسام
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => navigate(section.path)}
                className="tile-btn group"
              >
                <div className={`tile-icon ${section.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-7 h-7" />
                </div>
                <span className="tile-label whitespace-pre-line leading-snug">
                  {section.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* أحدث الفواتير */}
      {stats?.recentSales && stats.recentSales.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            أحدث الفواتير
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">الإجمالي</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {stats.recentSales.slice(0, 5).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/sales/${inv.id}`)}>
                    <td className="px-4 py-3 font-mono text-accent-600 dark:text-accent-400 font-semibold">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{inv.customer?.name || 'عميل مجهول'}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{inv.total.toFixed(2)} {currency}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        inv.status === 'paid' ? 'badge-success' :
                        inv.status === 'partial' ? 'badge-warning' :
                        inv.status === 'cancelled' ? 'badge-danger' : 'badge-info'
                      }`}>
                        {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'partial' ? 'جزئي' :
                         inv.status === 'cancelled' ? 'ملغاة' : inv.status === 'confirmed' ? 'مؤكدة' : 'مسودة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
