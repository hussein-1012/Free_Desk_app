import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Truck, X, Building2 } from 'lucide-react';

// ============================================================
// مودال إضافة / تعديل مورد
// ============================================================
interface SupplierForm {
  name: string;
  phone: string;
  companyName: string;
  productsPurchased: string;
  weOwe: number | '';
  theyOwe: number | '';
}
const empty: SupplierForm = { name: '', phone: '', companyName: '', productsPurchased: '', weOwe: '', theyOwe: '' };

// يحوّل أي أرقام عربية (٠-٩) لأرقام إنجليزية، ويحذف أي رمز غير رقمي
const normalizeDigits = (value: string) =>
  value.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632)).replace(/[^0-9.]/g, '');

const SupplierModal: React.FC<{ item?: any; onClose: () => void; onSaved: () => void }> = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState<SupplierForm>(
    item
      ? {
          name: item.name,
          phone: item.phone || '',
          companyName: item.companyName || '',
          productsPurchased: item.productsPurchased || '',
          weOwe: item.weOwe ?? '',
          theyOwe: item.theyOwe ?? '',
        }
      : empty
  );
  const [error, setError] = useState('');
  const f = (field: keyof SupplierForm, val: any) => setForm(p => ({ ...p, [field]: val }));

  const mutation = useMutation({
    mutationFn: () => item ? window.api.updateSupplier(item.id, form) : window.api.createSupplier(form),
    onSuccess: (resp: any) => { if (resp.success) { onSaved(); onClose(); } else setError(resp.error || 'فشل في الحفظ'); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-modal w-full max-w-md animate-scale-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="font-black text-gray-900 dark:text-gray-100">{item ? 'تعديل بيانات المورد' : 'إضافة مورد جديد'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">اسم المورد <span className="text-red-500">*</span></label>
              <input value={form.name} onChange={e => f('name', e.target.value)} className="input-field" placeholder="اسم المورد" autoFocus />
            </div>
            <div>
              <label className="form-label">اسم الشركة</label>
              <input value={form.companyName} onChange={e => f('companyName', e.target.value)} className="input-field" placeholder="الشركة المورّدة" />
            </div>
          </div>
          <div>
            <label className="form-label">رقم الهاتف</label>
            <input value={form.phone} onChange={e => f('phone', e.target.value)} className="input-field" placeholder="05XXXXXXXX" />
          </div>
          <div>
            <label className="form-label">المنتجات المشتراة من هذا المورد</label>
            <textarea value={form.productsPurchased} onChange={e => f('productsPurchased', e.target.value)} className="input-field resize-none" rows={2} placeholder="مثال: زيوت موبيل، فلاتر هواء..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">ليك كام</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.weOwe}
                onChange={e => {
                  const n = normalizeDigits(e.target.value);
                  f('weOwe', n === '' ? '' : +n);
                }}
                className="input-field"
                placeholder="المبلغ المستحق للمورد"
              />
            </div>
            <div>
              <label className="form-label">عليك كام</label>
              <input
                type="text"
                inputMode="decimal"
                value={form.theyOwe}
                onChange={e => {
                  const n = normalizeDigits(e.target.value);
                  f('theyOwe', n === '' ? '' : +n);
                }}
                className="input-field"
                placeholder="المبلغ المستحق لنا"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700 shrink-0">
          <button onClick={onClose} className="btn-secondary">إلغاء</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'جارٍ الحفظ...' : item ? 'تحديث' : 'إضافة'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// قائمة الموردين
// ============================================================
export const SupplierListPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', search, page],
    queryFn: async () => {
      const resp = await window.api.getSuppliers({ page, pageSize: 20, search: search || undefined });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteSupplier(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suppliers'] }),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-violet-500" />
            الموردون
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة بيانات الموردين وكشوف الحسابات</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />إضافة مورد
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pr-10" placeholder="بحث بالاسم أو اسم الشركة..." />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400"><Truck className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد موردون</p></div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الشركة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الهاتف</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المنتجات المشتراة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">ليك كام</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">عليك كام</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((s: any) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {s.companyName ? <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{s.companyName}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs max-w-[200px] truncate">{s.productsPurchased || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-red-600 dark:text-red-400">
                        {(s.weOwe ?? 0).toFixed(2)} جنيه مصري
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {(s.theyOwe ?? 0).toFixed(2)} جنيه مصري
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => navigate(`/suppliers/${s.id}/statement`)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="كشف الحساب"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditing(s); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="تعديل"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => { if (confirm(`حذف "${s.name}"؟`)) deleteMutation.mutate(s.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="حذف"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} مورد</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">السابق</button>
                  <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">التالي</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && <SupplierModal item={editing} onClose={() => setShowModal(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['suppliers'] })} />}
    </div>
  );
};