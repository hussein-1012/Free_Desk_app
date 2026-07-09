import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const PERIODS = [
  { value: 'today',  label: 'اليوم' },
  { value: 'week',   label: 'هذا الأسبوع' },
  { value: 'month',  label: 'هذا الشهر' },
  { value: 'year',   label: 'هذا العام' },
];

const STAT_CARD_CONFIGS = [
  { key: 'totalSales',     label: 'إجمالي المبيعات',    icon: TrendingUp,   bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'totalPurchases', label: 'إجمالي المشتريات',   icon: TrendingDown, bg: 'bg-rose-100 dark:bg-rose-900/30',     color: 'text-rose-600 dark:text-rose-400' },
  { key: 'netProfit',      label: 'صافي الربح',         icon: DollarSign,   bg: 'bg-blue-100 dark:bg-blue-900/30',     color: 'text-blue-600 dark:text-blue-400' },
  { key: 'washRevenue',    label: 'إيرادات الغسيل',     icon: Car,          bg: 'bg-cyan-100 dark:bg-cyan-900/30',     color: 'text-cyan-600 dark:text-cyan-400' },
];

const arabicTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-card-hover text-sm">
        <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value?.toFixed(2)} جنيه
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState('month');

  const { data: salesReport, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-report', period],
    queryFn: async () => { const r = await window.api.getSalesReport(period); return r.success ? r.data : null; },
  });

  const { data: purchaseReport } = useQuery({
    queryKey: ['purchase-report', period],
    queryFn: async () => { const r = await window.api.getPurchaseReport(period); return r.success ? r.data : null; },
  });

  const { data: profitReport } = useQuery({
    queryKey: ['profit-report', period],
    queryFn: async () => { const r = await window.api.getProfitReport(period); return r.success ? r.data : null; },
  });

  const stats: Record<string, number> = {
    totalSales:     salesReport?.total || 0,
    totalPurchases: purchaseReport?.total || 0,
    netProfit:      profitReport?.netProfit || 0,
    washRevenue:    salesReport?.washRevenue || 0,
  };

  const chartData: any[] = profitReport?.chartData || [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            التقارير والإحصاءات
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">تحليل الأداء المالي والتشغيلي</p>
        </div>

        {/* فلتر الفترة الزمنية */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                period === p.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* بطاقات الإحصاء */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STAT_CARD_CONFIGS.map(cfg => {
          const Icon = cfg.icon;
          return (
            <div key={cfg.key} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{cfg.label}</p>
                  <p className={`text-lg font-black ${cfg.color}`}>
                    {salesLoading ? '...' : stats[cfg.key]?.toFixed(0)} <span className="text-xs font-normal">جنيه</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* الرسم البياني للمبيعات والمشتريات */}
      {chartData.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">المبيعات مقابل المشتريات</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
              <Tooltip content={arabicTooltip} />
              <Legend formatter={(val) => val === 'sales' ? 'المبيعات' : 'المشتريات'} wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
              <Bar dataKey="sales"     name="sales"     fill="hsl(161,80%,38%)" radius={[6,6,0,0]} />
              <Bar dataKey="purchases" name="purchases"  fill="hsl(354,70%,54%)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* الربح الصافي */}
      {chartData.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">الربح الصافي</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-700" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Cairo' }} />
              <Tooltip content={arabicTooltip} />
              <Line dataKey="profit" name="profit" stroke="hsl(221,68%,45%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(221,68%,45%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* حالة الرسوم البيانية الفارغة */}
      {!salesLoading && chartData.length === 0 && (
        <div className="card p-12 text-center text-gray-400">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">لا يوجد بيانات كافية للفترة المحددة</p>
          <p className="text-xs mt-1">ابدأ بتسجيل الفواتير والمبيعات لعرض التقارير</p>
        </div>
      )}
    </div>
  );
};