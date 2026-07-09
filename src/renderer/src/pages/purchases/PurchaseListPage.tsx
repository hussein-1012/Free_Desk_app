// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import { Plus, Search, Eye, Trash2, ShoppingBag } from 'lucide-react';

// export const PurchaseListPage: React.FC = () => {
//   const navigate = useNavigate();
//   const qc = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [page, setPage] = useState(1);

//   const { data, isLoading } = useQuery({
//     queryKey: ['purchase-invoices', search, statusFilter, page],
//     queryFn: async () => {
//       const resp = await window.api.getPurchaseInvoices({
//         page, pageSize: 20, search: search || undefined,
//         filters: statusFilter ? { status: statusFilter } : {},
//       });
//       return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id: string) => window.api.deletePurchaseInvoice(id),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-invoices'] }),
//   });

//   const statusLabel: Record<string, string> = {
//     draft: 'مسودة', confirmed: 'مؤكدة', paid: 'مدفوعة', partial: 'جزئي', cancelled: 'ملغاة',
//   };
//   const statusBadge: Record<string, string> = {
//     draft: 'badge-neutral', confirmed: 'badge-info', paid: 'badge-success', partial: 'badge-warning', cancelled: 'badge-danger',
//   };

//   return (
//     <div className="space-y-5 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
//             <ShoppingBag className="w-5 h-5 text-rose-500" />
//             فواتير الشراء
//           </h1>
//           <p className="text-sm text-gray-500 mt-0.5">إدارة فواتير المشتريات من الموردين</p>
//         </div>
//         <button onClick={() => navigate('/purchases/new')} className="btn-primary">
//           <Plus className="w-4 h-4" />فاتورة شراء جديدة
//         </button>
//       </div>

//       <div className="flex gap-3">
//         <div className="relative flex-1 max-w-xs">
//           <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pr-10" placeholder="بحث برقم الفاتورة أو المورد..." />
//         </div>
//         <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
//           <option value="">جميع الحالات</option>
//           {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
//         </select>
//       </div>

//       <div className="card overflow-hidden">
//         {isLoading ? (
//           <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
//         ) : !data?.items?.length ? (
//           <div className="py-16 text-center text-gray-400"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد فواتير شراء</p></div>
//         ) : (
//           <>
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 dark:bg-gray-700/50">
//                 <tr>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم الفاتورة</th>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المورد</th>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجمالي</th>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المتبقي</th>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
//                   <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//                 {data.items.map((inv: any) => {
//                   const remaining = inv.total - inv.paid;
//                   return (
//                     <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
//                       <td className="px-4 py-3 font-mono font-bold text-accent-600 dark:text-accent-400">{inv.invoiceNumber}</td>
//                       <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{inv.supplier?.name || '—'}</td>
//                       <td className="px-4 py-3 text-gray-500 text-xs">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
//                       <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{inv.total.toFixed(2)} الجنيه</td>
//                       <td className="px-4 py-3">
//                         <span className={`font-bold ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
//                           {remaining.toFixed(2)} الجنيه
//                         </span>
//                       </td>
//                       <td className="px-4 py-3"><span className={`badge ${statusBadge[inv.status] || 'badge-neutral'}`}>{statusLabel[inv.status] || inv.status}</span></td>
//                       <td className="px-4 py-3">
//                         <div className="flex items-center gap-1.5">
//                           <button onClick={() => navigate(`/purchases/${inv.id}`)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Eye className="w-4 h-4" /></button>
//                           <button onClick={() => { if (confirm('حذف هذه الفاتورة؟')) deleteMutation.mutate(inv.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//             {data.totalPages > 1 && (
//               <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
//                 <span className="text-gray-500">إجمالي {data.total} فاتورة</span>
//                 <div className="flex gap-2">
//                   <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">السابق</button>
//                   <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">التالي</button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, ShoppingBag } from 'lucide-react';

// Derives the real payment status from the actual financial data,
// instead of relying on a possibly-stale/hardcoded status field.
const getComputedStatus = (inv: { total: number; paid: number }): 'paid' | 'partial' => {
  const remaining = Number(inv.total) - Number(inv.paid);
  return remaining <= 0 ? 'paid' : 'partial';
};

export const PurchaseListPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['purchase-invoices', search, statusFilter, page],
    queryFn: async () => {
      const resp = await window.api.getPurchaseInvoices({
        page, pageSize: 20, search: search || undefined,
        filters: statusFilter ? { status: statusFilter } : {},
      });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deletePurchaseInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchase-invoices'] }),
  });

  // Only Paid / Partial remain, as required.
  const statusLabel: Record<string, string> = {
    paid: 'مدفوعة',
    partial: 'جزئي',
  };
  const statusBadge: Record<string, string> = {
    paid: 'badge-success',
    partial: 'badge-warning',
  };

  // Client-side filter fallback: since status is now computed rather than stored,
  // we filter the fetched page by the computed status to guarantee correctness
  // even if the backend still stores/returns a stale status field.
  const filteredItems = (data?.items || []).filter((inv: any) => {
    if (!statusFilter) return true;
    return getComputedStatus(inv) === statusFilter;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            فواتير الشراء
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة فواتير المشتريات من الموردين</p>
        </div>
        <button onClick={() => navigate('/purchases/new')} className="btn-primary">
          <Plus className="w-4 h-4" />فاتورة شراء جديدة
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pr-10" placeholder="بحث برقم الفاتورة أو المورد..." />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="">جميع الحالات</option>
          {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !filteredItems.length ? (
          <div className="py-16 text-center text-gray-400"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد فواتير شراء</p></div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المورد</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">التاريخ</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجمالي</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المتبقي</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredItems.map((inv: any) => {
                  const remaining = inv.total - inv.paid;
                  const computedStatus = getComputedStatus(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-accent-600 dark:text-accent-400">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{inv.supplier?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{inv.total.toFixed(2)} الجنيه</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {remaining.toFixed(2)} الجنيه
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className={`badge ${statusBadge[computedStatus]}`}>{statusLabel[computedStatus]}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => navigate(`/purchases/${inv.id}`)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => { if (confirm('حذف هذه الفاتورة؟')) deleteMutation.mutate(inv.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} فاتورة</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">السابق</button>
                  <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">التالي</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};