import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Eye, ArrowRightLeft } from 'lucide-react';

export const TransferListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-transfers', search, page],
    queryFn: async () => {
      const r = await window.api.getInventoryTransfers({ page, pageSize: 15, search: search || undefined });
      return r.success ? r.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const statusLabel: Record<string, string> = { completed: 'مكتمل', pending: 'معلق', cancelled: 'ملغي' };
  const statusBadge: Record<string, string> = { completed: 'badge-success', pending: 'badge-warning', cancelled: 'badge-danger' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-violet-500" />
            تحويلات المخزون
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">نقل المنتجات بين المواقع والمستودعات</p>
        </div>
        <button onClick={() => navigate('/inventory/transfers/new')} className="btn-primary">
          <Plus className="w-4 h-4" />تحويل جديد
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field pr-10"
          placeholder="بحث برقم التحويل أو الموقع..."
        />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400"><ArrowRightLeft className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد تحويلات مخزون</p></div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم التحويل</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">من</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">إلى</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((tr: any) => (
                  <tr key={tr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-violet-600 dark:text-violet-400">{tr.transferNumber}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{tr.fromLocation}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{tr.toLocation}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(tr.date).toLocaleDateString('ar-EG')}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${statusBadge[tr.status] || 'badge-neutral'}`}>{statusLabel[tr.status] || tr.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/inventory/transfers/${tr.id}`)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} تحويل</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">السابق</button>
                  <button disabled={page >= (data.totalPages ?? 1)} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">التالي</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
