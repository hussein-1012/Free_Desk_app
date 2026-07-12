// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowRight, ClipboardList } from 'lucide-react';

// export const StockCountFormPage: React.FC = () => {
//   const navigate = useNavigate();
//   return (
//     <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
//       <div className="flex items-center gap-3">
//         <button onClick={() => navigate('/inventory')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//           <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//         </button>
//         <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
//           <ClipboardList className="w-5 h-5 text-amber-500" />
//           جرد مخزون جديد
//         </h1>
//       </div>
//       <div className="card p-8 text-center text-gray-400">
//         <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
//         <p className="font-semibold">قيد التطوير</p>
//         <p className="text-sm mt-1">سيتم إضافة نموذج الجرد في الإصدار القادم</p>
//         <button onClick={() => navigate('/inventory')} className="btn-secondary mt-4 mx-auto">
//           العودة للمخزون
//         </button>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, Loader2, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface CountRow {
  productId: string;
  productName: string;
  systemQuantity: number;
  actualQuantity: number;
  notes: string;
}

export const StockCountFormPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [rows, setRows] = useState<CountRow[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true);
      try {
        const res = await window.api.getProducts({ pageSize: 1000 });
        if (res.success && res.data) {
          setRows(
            res.data.items.map((p: any) => ({
              productId: p.id,
              productName: p.name,
              systemQuantity: p.quantity,
              actualQuantity: p.quantity,
              notes: '',
            }))
          );
        } else {
          setError('فشل في تحميل المنتجات');
        }
      } catch {
        setError('فشل في تحميل المنتجات');
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, []);

  // تحديث الكمية الفعلية لصف معيّن؛ يمنع القيم السالبة والقيم غير الرقمية مباشرة عند الإدخال
  const updateActual = (productId: string, rawValue: string) => {
    const value = rawValue === '' ? 0 : Number(rawValue);
    const safeValue = Number.isFinite(value) && value >= 0 ? value : 0;
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, actualQuantity: safeValue } : r))
    );
  };

  const updateRowNotes = (productId: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, notes: value } : r))
    );
  };

  const validate = (): string | null => {
    if (!rows.length) return 'لا يوجد منتجات لجردها';
    for (const r of rows) {
      if (!Number.isFinite(r.actualQuantity)) {
        return `قيمة الكمية الفعلية غير صالحة للمنتج "${r.productName}"`;
      }
      if (r.actualQuantity < 0) {
        return `لا يمكن أن تكون الكمية الفعلية سالبة للمنتج "${r.productName}"`;
      }
      if (!Number.isInteger(r.actualQuantity)) {
        return `يجب أن تكون الكمية الفعلية عدداً صحيحاً للمنتج "${r.productName}"`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        date: new Date(date),
        status: 'completed',
        notes: notes || null,
        items: rows.map((r) => ({
          productId: r.productId,
          systemQuantity: r.systemQuantity,
          actualQuantity: r.actualQuantity,
          difference: r.actualQuantity - r.systemQuantity,
          notes: r.notes || null,
        })),
      };
      const res = await window.api.createInventoryCount(payload, user?.id || '');
      if (res.success) {
        navigate('/inventory/count');
      } else {
        setError(res.error || 'فشل في حفظ الجرد');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الجرد');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/inventory/count')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-500" />
          جرد مخزون جديد
        </h1>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
        </div>
      )}

      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="form-label">تاريخ الجرد</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
          المنتجات
        </h2>

        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  <th className="text-right pb-2">المنتج</th>
                  <th className="text-right pb-2 w-28">الكمية بالنظام</th>
                  <th className="text-right pb-2 w-28">الكمية الفعلية</th>
                  <th className="text-right pb-2 w-24">الفرق</th>
                  <th className="text-right pb-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const diff = row.actualQuantity - row.systemQuantity;
                  return (
                    <tr key={row.productId} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <td className="py-2 pl-2 font-medium text-gray-800 dark:text-gray-200">{row.productName}</td>
                      <td className="py-2 px-1 text-center text-gray-500">{row.systemQuantity}</td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={row.actualQuantity}
                          onChange={(e) => updateActual(row.productId, e.target.value)}
                          className="input-field text-xs py-1.5 text-center w-24"
                        />
                      </td>
                      <td className={`py-2 px-1 text-center font-bold ${diff === 0 ? 'text-gray-500' : diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={row.notes}
                          onChange={(e) => updateRowNotes(row.productId, e.target.value)}
                          className="input-field text-xs py-1.5"
                          placeholder="اختياري"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-5">
        <label className="form-label">ملاحظات عامة (اختياري)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field resize-none" rows={2} placeholder="ملاحظات الجرد..." />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/inventory/count')} className="btn-secondary">إلغاء</button>
        <button onClick={handleSubmit} disabled={saving || loadingProducts} className="btn-primary">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-4 h-4" />حفظ الجرد</>}
        </button>
      </div>
    </div>
  );
};