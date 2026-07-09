import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Eye, ArrowRightLeft, MoveHorizontal } from 'lucide-react';

export const StockCountListPage: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-counts'],
    queryFn: async () => {
      const resp = await window.api.getInventoryCounts({ page: 1, pageSize: 20 });
      return resp.success ? resp.data : { items: [], total: 0 };
    },
  });

  const statusLabel: Record<string, string> = { draft: 'مسودة', completed: 'مكتمل', cancelled: 'ملغى' };
  const statusBadge: Record<string, string> = { draft: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            جرد المخزون
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة عمليات جرد وحصر المخزون</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/inventory/movements')} className="btn-secondary text-sm py-2">
            <MoveHorizontal className="w-4 h-4" />حركة المخزون
          </button>
          <button onClick={() => navigate('/inventory/transfers')} className="btn-secondary text-sm py-2">
            <ArrowRightLeft className="w-4 h-4" />تحويلات المخزون
          </button>
          <button onClick={() => navigate('/inventory/count/new')} className="btn-primary">
            <Plus className="w-4 h-4" />جرد جديد
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">لا يوجد عمليات جرد</p>
            <p className="text-xs mt-1">ابدأ بإنشاء جرد جديد لحصر المخزون</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">عدد المنتجات</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الملاحظات</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data.items.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{new Date(c.date).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{c.items?.length || 0} منتج</td>
                  <td className="px-4 py-3"><span className={`badge ${statusBadge[c.status] || 'badge-neutral'}`}>{statusLabel[c.status] || c.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">{c.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="عرض">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
