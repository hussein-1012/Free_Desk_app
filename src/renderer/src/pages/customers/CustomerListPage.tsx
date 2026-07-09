import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Users } from 'lucide-react';
import { CustomerFormModal } from './CustomerFormModal';

export const CustomerListPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: async () => {
      const resp = await window.api.getCustomers({ page, pageSize: 20, search: search || undefined });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteCustomer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['customers'] });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            العملاء
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة بيانات العملاء وكشوف الحسابات</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />إضافة عميل
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pr-10" placeholder="بحث بالاسم أو الهاتف أو رقم اللوحة..." />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400"><Users className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد عملاء</p></div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الهاتف</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">العنوان</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم اللوحة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">قراءة العداد (كم)</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.address || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400 text-xs">{c.carNumber || '—'}</td>
                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400 text-xs">
                      {c.odometerReading != null ? `${c.odometerReading.toLocaleString()} كم` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/customers/${c.id}/statement`)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="كشف الحساب"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(`حذف عميل "${c.name}"؟`)) deleteMutation.mutate(c.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} عميل</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">السابق</button>
                  <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">التالي</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showModal && (
        <CustomerFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={refresh}
          customer={editing}
        />
      )}
    </div>
  );
};
