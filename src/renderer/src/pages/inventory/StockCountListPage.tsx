// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import { Plus, ClipboardList, Eye, ArrowRightLeft, MoveHorizontal } from 'lucide-react';

// export const StockCountListPage: React.FC = () => {
//   const navigate = useNavigate();

//   const { data, isLoading } = useQuery({
//     queryKey: ['inventory-counts'],
//     queryFn: async () => {
//       const resp = await window.api.getInventoryCounts({ page: 1, pageSize: 20 });
//       return resp.success ? resp.data : { items: [], total: 0 };
//     },
//   });

//   const statusLabel: Record<string, string> = { draft: 'مسودة', completed: 'مكتمل', cancelled: 'ملغى' };
//   const statusBadge: Record<string, string> = { draft: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };

//   return (
//     <div className="space-y-5 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
//             <ClipboardList className="w-5 h-5 text-amber-500" />
//             جرد المخزون
//           </h1>
//           <p className="text-sm text-gray-500 mt-0.5">إدارة عمليات جرد وحصر المخزون</p>
//         </div>
//         <div className="flex gap-2">
//           <button onClick={() => navigate('/inventory/movements')} className="btn-secondary text-sm py-2">
//             <MoveHorizontal className="w-4 h-4" />حركة المخزون
//           </button>
//           <button onClick={() => navigate('/inventory/transfers')} className="btn-secondary text-sm py-2">
//             <ArrowRightLeft className="w-4 h-4" />تحويلات المخزون
//           </button>
//           <button onClick={() => navigate('/inventory/count/new')} className="btn-primary">
//             <Plus className="w-4 h-4" />جرد جديد
//           </button>
//         </div>
//       </div>

//       <div className="card overflow-hidden">
//         {isLoading ? (
//           <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
//         ) : !data?.items?.length ? (
//           <div className="py-16 text-center text-gray-400">
//             <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
//             <p className="font-semibold">لا يوجد عمليات جرد</p>
//             <p className="text-xs mt-1">ابدأ بإنشاء جرد جديد لحصر المخزون</p>
//           </div>
//         ) : (
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50 dark:bg-gray-700/50">
//               <tr>
//                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
//                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">عدد المنتجات</th>
//                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
//                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الملاحظات</th>
//                 <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//               {data.items.map((c: any) => (
//                 <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
//                   <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{new Date(c.date).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}</td>
//                   <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{c.items?.length || 0} منتج</td>
//                   <td className="px-4 py-3"><span className={`badge ${statusBadge[c.status] || 'badge-neutral'}`}>{statusLabel[c.status] || c.status}</span></td>
//                   <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">{c.notes || '—'}</td>
//                   <td className="px-4 py-3">
//                     <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="عرض">
//                       <Eye className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Eye, Trash2, X, Loader2 } from 'lucide-react';

const statusLabel: Record<string, string> = { draft: 'مسودة', completed: 'مكتمل', cancelled: 'ملغى' };
const statusBadge: Record<string, string> = { draft: 'badge-warning', completed: 'badge-success', cancelled: 'badge-danger' };

// ─────────────────────────────────────────────
// مودال عرض تفاصيل مستند الجرد (داخل نفس الصفحة، مش صفحة/راوت جديد)
// ─────────────────────────────────────────────
const StockCountDetailsModal: React.FC<{ countId: string; onClose: () => void }> = ({ countId, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-count-details', countId],
    queryFn: async () => {
      const res = await window.api.getInventoryCountById(countId);
      return res.success ? res.data : null;
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-modal w-full max-w-2xl max-h-[85vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            تفاصيل الجرد
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
            </div>
          ) : !data ? (
            <p className="text-center text-gray-400 py-8">تعذر تحميل بيانات الجرد</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 text-xs block">تاريخ الإنشاء</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {new Date(data.date).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">الحالة</span>
                  <span className={`badge ${statusBadge[data.status] || 'badge-neutral'}`}>
                    {statusLabel[data.status] || data.status}
                  </span>
                </div>
                {data.notes && (
                  <div className="col-span-2">
                    <span className="text-gray-500 text-xs block">ملاحظات عامة</span>
                    <span className="text-gray-700 dark:text-gray-300">{data.notes}</span>
                  </div>
                )}
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المنتج</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية بالنظام</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية الفعلية</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الفرق</th>
                    <th className="px-3 py-2 text-right text-xs font-bold text-gray-500 dark:text-gray-400">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(data.items || []).map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">{item.product?.name || '—'}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{item.systemQuantity}</td>
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{item.actualQuantity}</td>
                      <td className={`px-3 py-2 font-bold ${item.difference === 0 ? 'text-gray-500' : item.difference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {item.difference > 0 ? `+${item.difference}` : item.difference}
                      </td>
                      <td className="px-3 py-2 text-gray-500 text-xs">{item.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// صفحة قائمة الجرد
// ─────────────────────────────────────────────
export const StockCountListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCountId, setSelectedCountId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-counts'],
    queryFn: async () => {
      const resp = await window.api.getInventoryCounts({ page: 1, pageSize: 20 });
      return resp.success ? resp.data : { items: [], total: 0 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteInventoryCount(id),
    onSuccess: (resp: any) => {
      if (resp?.success) {
        queryClient.invalidateQueries({ queryKey: ['inventory-counts'] });
      }
    },
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف مستند الجرد هذا؟ لا يمكن التراجع عن هذا الإجراء.')) {
      deleteMutation.mutate(id);
    }
  };

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
        <button onClick={() => navigate('/inventory/count/new')} className="btn-primary">
          <Plus className="w-4 h-4" />جرد جديد
        </button>
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
                <tr
                  key={c.id}
                  onClick={() => setSelectedCountId(c.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{new Date(c.date).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{c.items?.length || 0} منتج</td>
                  <td className="px-4 py-3"><span className={`badge ${statusBadge[c.status] || 'badge-neutral'}`}>{statusLabel[c.status] || c.status}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">{c.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedCountId(c.id); }}
                        title="عرض التفاصيل"
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, c.id)}
                        disabled={deleteMutation.isPending}
                        title="حذف"
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedCountId && (
        <StockCountDetailsModal countId={selectedCountId} onClose={() => setSelectedCountId(null)} />
      )}
    </div>
  );
};