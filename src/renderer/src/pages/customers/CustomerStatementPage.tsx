import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, FileText, TrendingUp, TrendingDown, Gauge } from 'lucide-react';

export const CustomerStatementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: customer } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => { const r = await window.api.getCustomerById(id!); return r.success ? r.data : null; },
    enabled: !!id,
  });

  const { data: statement = [], isLoading } = useQuery({
    queryKey: ['customer-statement', id],
    queryFn: async () => { const r = await window.api.getCustomerStatement(id!); return r.success ? r.data : []; },
    enabled: !!id,
  });

  const { data: odometerHistory = [] } = useQuery({
    queryKey: ['odometer', id],
    queryFn: async () => { const r = await window.api.getOdometerHistory(id!); return r.success ? r.data : []; },
    enabled: !!id,
  });

  let runningBalance = 0;
  const rows = (statement as any[]).map((row: any) => {
    runningBalance += row.balanceEffect;
    return { ...row, runningBalance };
  });

  const totalDebit  = rows.reduce((s: number, r: any) => s + (r.debit  || 0), 0);
  const totalCredit = rows.reduce((s: number, r: any) => s + (r.credit || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-500" />
            كشف حساب — {customer?.name}
          </h1>
          {customer?.carNumber && (
            <p className="text-sm text-gray-500 mt-0.5">رقم اللوحة: <span className="font-mono font-bold">{customer.carNumber}</span></p>
          )}
        </div>
      </div>

      {/* ملخص */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">إجمالي المديونية</p>
            <p className="font-bold text-red-600 dark:text-red-400">{totalDebit.toFixed(2)} جنيه مصري</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">إجمالي المدفوع</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400">{totalCredit.toFixed(2)} جنيه مصري</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${runningBalance > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
            <FileText className={`w-5 h-5 ${runningBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
          </div>
          <div>
            <p className="text-xs text-gray-500">صافي الرصيد</p>
            <p className={`font-bold ${runningBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {Math.abs(runningBalance).toFixed(2)} جنيه مصري {runningBalance > 0 ? '(مدين)' : '(دائن)'}
            </p>
          </div>
        </div>
      </div>

      {/* جدول الحركات */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300">
          حركات الحساب
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-gray-400"><p className="font-semibold">لا يوجد حركات</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">البيان</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المرجع</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">مدين</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">دائن</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rows.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{new Date(row.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium">{row.type}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-accent-600 dark:text-accent-400">{row.reference || '—'}</td>
                  <td className="px-4 py-2.5 text-red-600 dark:text-red-400 font-bold">{row.debit > 0 ? row.debit.toFixed(2) : '—'}</td>
                  <td className="px-4 py-2.5 text-emerald-600 dark:text-emerald-400 font-bold">{row.credit > 0 ? row.credit.toFixed(2) : '—'}</td>
                  <td className={`px-4 py-2.5 font-black ${row.runningBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {row.runningBalance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* سجل العداد */}
      {(odometerHistory as any[]).length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-accent-500" />
            سجل قراءات العداد
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">القراءة (كم)</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(odometerHistory as any[]).map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-2.5 text-gray-500 text-xs">{new Date(r.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-4 py-2.5 font-bold font-mono text-gray-900 dark:text-gray-100">{r.reading.toLocaleString()} كم</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
