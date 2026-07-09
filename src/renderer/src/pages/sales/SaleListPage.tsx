import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Eye, ShoppingCart } from 'lucide-react';

export const SaleListPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'paid' | 'partial'>('');
  const [page, setPage] = useState(1);

  // النظام يعتمد فقط على رصيد الفاتورة (المتبقي) لتحديد حالة السداد الفعلية،
  // بدلاً من الاعتماد على قيمة inv.status المخزّنة والتي قد لا تكون متزامنة.
  const getPaymentStatus = (inv: any): 'paid' | 'partial' | 'unpaid' => {
    const remaining = (inv.total || 0) - (inv.paid || 0);
    if (remaining <= 0.009) return 'paid';
    if ((inv.paid || 0) > 0) return 'partial';
    return 'unpaid';
  };

  // البحث والصفحات تُجلب من الخادم كما هي، أما فلترة الحالة فتتم محلياً
  // بالاعتماد على الحالة المحسوبة الفعلية بدلاً من إرسالها كفلتر ثابت للخادم.
  const { data, isLoading } = useQuery({
    queryKey: ['sale-invoices', search, page],
    queryFn: async () => {
      const resp = await window.api.getSaleInvoices({
        page, pageSize: 20, search: search || undefined,
        filters: {},
      });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const filteredItems = useMemo(() => {
    const items = data?.items || [];
    if (!statusFilter) return items;
    return items.filter((inv: any) => getPaymentStatus(inv) === statusFilter);
  }, [data, statusFilter]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteSaleInvoice(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sale-invoices'] }),
  });

  const statusLabel: Record<string, string> = {
    paid: 'مدفوعة', partial: 'جزئي', unpaid: 'غير مدفوعة',
  };
  const statusBadge: Record<string, string> = {
    paid: 'badge-success', partial: 'badge-warning', unpaid: 'badge-danger',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-teal-500" />
            فواتير البيع
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة فواتير المبيعات والمرتجعات</p>
        </div>
        <button onClick={() => navigate('/sales/new')} className="btn-primary">
          <Plus className="w-4 h-4" />فاتورة بيع جديدة
        </button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pr-10" placeholder="بحث برقم الفاتورة أو العميل..." />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-36">
          <option value="">جميع الحالات</option>
          <option value="paid">مدفوعة</option>
          <option value="partial">جزئي</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !filteredItems.length ? (
          <div className="py-16 text-center text-gray-400"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد فواتير بيع</p></div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">العميل</th>
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
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-accent-600 dark:text-accent-400">
                        {inv.isReturn && <span className="badge badge-danger text-[10px] ml-1">مرتجع</span>}
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{inv.customer?.name || 'عميل مجهول'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(inv.date).toLocaleDateString('ar-EG')}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{inv.total.toFixed(2)} الجنيه</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {remaining.toFixed(2)} الجنيه
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const paymentStatus = getPaymentStatus(inv);
                          return <span className={`badge ${statusBadge[paymentStatus] || 'badge-neutral'}`}>{statusLabel[paymentStatus]}</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => navigate(`/sales/${inv.id}`)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Eye className="w-4 h-4" /></button>
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
                <span className="text-gray-500">إجمالي {statusFilter ? filteredItems.length : data.total} فاتورة</span>
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