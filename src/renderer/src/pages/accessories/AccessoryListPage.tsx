import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertTriangle, Wrench, X } from 'lucide-react';
import { Accessory } from '@shared/types';

interface FormState {
  name: string;
  barcode: string;
  price: number | '';
  quantity: number | '';
  minQuantity: number | '';
  notes: string;
  isActive: boolean;
}

const emptyForm: FormState = { name: '', barcode: '', price: '', quantity: '', minQuantity: '', notes: '', isActive: true };

const AccessoryModal: React.FC<{
  item?: Accessory | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState<FormState>(
    item
      ? { name: item.name, barcode: item.barcode || '', price: item.price, quantity: item.quantity, minQuantity: item.minQuantity, notes: item.notes || '', isActive: item.isActive }
      : emptyForm
  );
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        barcode: form.barcode.trim() || null,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 0,
        minQuantity: Number(form.minQuantity) || 0,
      };
      if (item) return window.api.updateAccessory(item.id, payload);
      return window.api.createAccessory(payload);
    },
    onSuccess: (resp: any) => {
      if (resp.success) { onSaved(); onClose(); }
      else setError(resp.error || 'فشل في الحفظ');
    },
  });

  const f = (field: keyof FormState, value: any) => setForm((p) => ({ ...p, [field]: value }));

  const numField = (field: 'price' | 'quantity' | 'minQuantity', raw: string) => {
    f(field, raw === '' ? '' : +raw);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-modal w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-gray-100">
            {item ? 'تعديل الإكسسوار' : 'إضافة إكسسوار جديد'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="form-label">الاسم <span className="text-red-500">*</span></label>
            <input value={form.name} onChange={(e) => f('name', e.target.value)} className="input-field" placeholder="اسم الإكسسوار" />
          </div>

          <div>
            <label className="form-label">الباركود (اختياري)</label>
            <input value={form.barcode} onChange={(e) => f('barcode', e.target.value)} className="input-field" placeholder="رمز الباركود الفريد" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">السعر (جنيه) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.5" value={form.price} onChange={(e) => numField('price', e.target.value)} className="input-field" placeholder="0.00" />
            </div>
            <div>
              <label className="form-label">الكمية</label>
              <input type="number" min="0" value={form.quantity} onChange={(e) => numField('quantity', e.target.value)} className="input-field" placeholder="0" />
            </div>
            <div>
              <label className="form-label">الحد الأدنى</label>
              <input type="number" min="0" value={form.minQuantity} onChange={(e) => numField('minQuantity', e.target.value)} className="input-field" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="form-label">ملاحظات</label>
            <textarea value={form.notes} onChange={(e) => f('notes', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => f('isActive', e.target.checked)}
              className="w-4 h-4 rounded accent-accent-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">نشط</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
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
// صفحة قائمة الإكسسوارات
// ============================================================
export const AccessoryListPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Accessory | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['accessories', search, page],
    queryFn: async () => {
      const resp = await window.api.getAccessories({ page, pageSize: 20, search: search || undefined });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteAccessory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['accessories'] }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['accessories'] });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" />
            الإكسسوارات
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة إكسسوارات السيارات والدراجات</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          إضافة إكسسوار
        </button>
      </div>

      {/* البحث */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field pr-10"
          placeholder="بحث بالاسم..."
        />
      </div>

      {/* الجدول */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">لا يوجد إكسسوارات</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الاسم</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الباركود</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">السعر</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((item: Accessory) => {
                  const isLow = item.quantity <= item.minQuantity;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{item.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{item.barcode || '—'}</td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{item.price.toFixed(2)} جنيه</td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${isLow ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                          {item.quantity}
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 mb-0.5 text-red-500" />}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${item.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {item.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setEditing(item); setShowModal(true); }}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`حذف "${item.name}"؟`)) deleteMutation.mutate(item.id); }}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} إكسسوار</span>
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
        <AccessoryModal
          item={editing}
          onClose={() => setShowModal(false)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};