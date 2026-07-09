import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Building2,
  AlertTriangle,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  todaySales: number;
  todayPurchases: number;
  cashBalance: number;
  customerCount: number;
  supplierCount: number;
  lowStockAlerts: number;
  recentSales: any[];
  chartData: any[];
}

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await window.api.getReportSummary();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: t('today_sales'),
      value: `${stats?.todaySales?.toFixed(2) || '0.00'} SAR`,
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: t('today_purchases'),
      value: `${stats?.todayPurchases?.toFixed(2) || '0.00'} SAR`,
      icon: TrendingDown,
      color: 'text-red-500 bg-red-500/10 border-red-500/20',
    },
    {
      title: t('cash_balance'),
      value: `${stats?.cashBalance?.toFixed(2) || '0.00'} SAR`,
      icon: Wallet,
      color: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
    },
    {
      title: t('customer_count'),
      value: stats?.customerCount || 0,
      icon: Users,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: t('supplier_count'),
      value: stats?.supplierCount || 0,
      icon: Building2,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: t('low_stock_alert'),
      value: stats?.lowStockAlerts || 0,
      icon: AlertTriangle,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-200">{t('dashboard')}</h2>
        <span className="text-sm text-slate-500 flex items-center space-x-1.5 bg-dark-200 border border-slate-800 px-3.5 py-1.5 rounded-xl font-medium">
          <Clock className="h-4 w-4" />
          <span>Real-time Data Active</span>
        </span>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-dark-200 border border-slate-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-slate-700 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <span className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-xl font-bold text-slate-100 tracking-tight mt-3">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Chart */}
        <div className="lg:col-span-2 bg-dark-200 border border-slate-800 rounded-2xl p-6 shadow-card">
          <h3 className="font-bold text-slate-200 tracking-wide mb-6">Sales vs Purchases (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '12px' }}
                  labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                />
                <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Sales" />
                <Bar dataKey="purchases" fill="#ef4444" radius={[4, 4, 0, 0]} name="Purchases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-dark-200 border border-slate-800 rounded-2xl p-6 shadow-card flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-200 tracking-wide">{t('recent_invoices')}</h3>
            <FileSpreadsheet className="h-5 w-5 text-slate-500" />
          </div>
          <div className="flex-1 overflow-auto space-y-3.5">
            {stats?.recentSales && stats.recentSales.length > 0 ? (
              stats.recentSales.map((sale: any) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3.5 bg-dark-100/60 hover:bg-dark-100 border border-slate-800 rounded-xl transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {sale.customer?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs font-mono text-slate-500 mt-1">{sale.invoiceNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-100">
                      {sale.total.toFixed(2)} SAR
                    </p>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No recent invoices found.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
