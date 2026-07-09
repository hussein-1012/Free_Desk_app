import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Warehouse, ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';

export const StockMovementListPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      const resp = await window.api.getInventoryMovements({ page: 1, pageSize: 50 });
      return resp.success ? resp.data : { items: [], total: 0 };
    },
  });

  const typeLabel: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    in:         { label: 'وارد',   icon: ArrowUpCircle,   cls: 'text-emerald-600 dark:text-emerald-400' },
    out:        { label: 'صادر',  icon: ArrowDownCircle, cls: 'text-red-600 dark:text-red-400' },
    adjustment: { label: 'تسوية', icon: MinusCircle,     cls: 'text-amber-600 dark:text-amber-400' },
    return:     { label: 'مرتجع', icon: ArrowUpCircle,   cls: 'text-blue-600 dark:text-blue-400' },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-amber-500" />
          حركة المخزون
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">سجل جميع حركات الوارد والصادر</p>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400"><Warehouse className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد حركات مخزون</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المنتج</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">النوع</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المرجع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.items.map((m: any) => {
                const t = typeLabel[m.type] || { label: m.type, icon: MinusCircle, cls: 'text-gray-500' };
                const Icon = t.icon;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-2.5 text-gray-500 text-xs">{new Date(m.date).toLocaleDateString('ar-SA')}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{m.product?.name || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`flex items-center gap-1.5 ${t.cls} font-semibold text-xs`}>
                        <Icon className="w-3.5 h-3.5" />{t.label}
                      </span>
                    </td>
                    <td className={`px-4 py-2.5 font-bold ${m.type === 'in' || m.type === 'return' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {m.type === 'in' || m.type === 'return' ? '+' : '-'}{m.quantity}
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs font-mono">{m.reference || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
