import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertTriangle, Package, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ProductForm {
  name: string; barcode: string; categoryId: string;
  purchasePrice: number; sellingPrice: number;
  quantity: number; minQuantity: number;
  location: string; notes: string; isActive: boolean;
}
const emptyForm: ProductForm = {
  name: '', barcode: '', categoryId: '',
  purchasePrice: 0, sellingPrice: 0,
  quantity: 0, minQuantity: 5,
  location: '', notes: '', isActive: true,
};

const ProductModal: React.FC<{ item?: any; onClose: () => void; onSaved: () => void }> = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState<ProductForm>(
    item ? {
      name: item.name, barcode: item.barcode || '', categoryId: item.categoryId || '',
      purchasePrice: item.purchasePrice, sellingPrice: item.sellingPrice,
      quantity: item.quantity, minQuantity: item.minQuantity,
      location: item.location || '', notes: item.notes || '', isActive: item.isActive,
    } : emptyForm
  );
  const [error, setError] = useState('');
  const f = (field: keyof ProductForm, val: any) => setForm(p => ({ ...p, [field]: val }));

  const mutation = useMutation({
    mutationFn: () => item ? window.api.updateProduct(item.id, form) : window.api.createProduct(form),
    onSuccess: (resp: any) => { if (resp.success) { onSaved(); onClose(); } else setError(resp.error || 'فشل في الحفظ'); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-modal w-full max-w-md animate-scale-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="font-black text-gray-900 dark:text-gray-100">{item ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-3 overflow-y-auto">
          {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}
          <div>
            <label className="form-label">اسم المنتج <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={e => f('name', e.target.value)} className="input-field" placeholder="اسم المنتج" autoFocus />
          </div>
          <div>
            <label className="form-label">الباركود</label>
            <input value={form.barcode} onChange={e => f('barcode', e.target.value)} className="input-field font-mono" placeholder="رمز الباركود" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">سعر الشراء (الجنيه)</label>
              <input type="number" min="0" step="0.5" value={form.purchasePrice} onChange={e => f('purchasePrice', +e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="form-label">سعر البيع (الجنيه) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.5" value={form.sellingPrice} onChange={e => f('sellingPrice', +e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">الكمية</label>
              <input type="number" min="0" value={form.quantity} onChange={e => f('quantity', +e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="form-label">الحد الأدنى</label>
              <input type="number" min="0" value={form.minQuantity} onChange={e => f('minQuantity', +e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="form-label">الموقع</label>
              <input value={form.location} onChange={e => f('location', e.target.value)} className="input-field" placeholder="A-01" />
            </div>
          </div>
          <div>
            <label className="form-label">ملاحظات</label>
            <textarea value={form.notes} onChange={e => f('notes', e.target.value)} className="input-field resize-none" rows={2} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => f('isActive', e.target.checked)} className="w-4 h-4 rounded accent-accent-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">نشط</span>
          </label>
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

export const ProductListPage: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const isCashier = user?.role === 'cashier';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, page],
    queryFn: async () => {
      const resp = await window.api.getProducts({ page, pageSize: 20, search: search || undefined });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-500" />
            المنتجات
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة قائمة المنتجات والأسعار</p>
        </div>
        {!isCashier && (
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" />إضافة منتج
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pr-10" placeholder="بحث بالاسم أو الباركود..." />
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-semibold">لا يوجد منتجات</p></div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الباركود</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">سعر البيع</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                  {!isCashier && <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((p: any) => {
                  const isLow = p.quantity <= p.minQuantity;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-gray-500 text-xs">{p.barcode || '—'}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{p.sellingPrice.toFixed(2)} الجنيه</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold flex items-center gap-1 ${isLow ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                          {p.quantity}{isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        </span>
                      </td>
                      <td className="px-4 py-3"><span className={`badge ${p.isActive ? 'badge-success' : 'badge-neutral'}`}>{p.isActive ? 'نشط' : 'غير نشط'}</span></td>
                      {!isCashier && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => { if (confirm(`حذف "${p.name}"؟`)) deleteMutation.mutate(p.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} منتج</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">السابق</button>
                  <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">التالي</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {showModal && <ProductModal item={editing} onClose={() => setShowModal(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['products'] })} />}
    </div>
  );
};
