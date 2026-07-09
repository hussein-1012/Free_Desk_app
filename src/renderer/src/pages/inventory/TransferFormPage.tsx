import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Trash2, Loader2, ArrowRightLeft, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface TransferItemInput {
  productId: string;
  productName: string;
  quantity: number;
  stock: number;
}

const LOCATIONS = ['المستودع الرئيسي', 'الفرع أ', 'الفرع ب', 'رف العرض'];

export const TransferFormPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const [products, setProducts] = useState<any[]>([]);
  const [transferNumber, setTransferNumber] = useState('');
  const [fromLocation, setFromLocation] = useState(LOCATIONS[0]);
  const [toLocation, setToLocation] = useState(LOCATIONS[1]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<TransferItemInput[]>([{ productId: '', productName: '', quantity: 1, stock: 0 }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await window.api.getProducts({ pageSize: 500 });
        if (res.success && res.data) setProducts(res.data.items);
      } catch {/* ignore */}
      setTransferNumber(`تح-${Math.floor(100000 + Math.random() * 900000)}`);
    };
    load();
  }, []);

  const addItem = () => setItems(p => [...p, { productId: '', productName: '', quantity: 1, stock: 0 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof TransferItemInput, value: any) => {
    setItems(p => p.map((item, idx) => {
      if (idx !== i) return item;
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        return { ...item, productId: value, productName: prod?.name || '', stock: prod?.quantity || 0 };
      }
      return { ...item, [field]: value };
    }));
  };

  const handleSubmit = async () => {
    setError('');
    if (!items.some(i => i.productId && i.quantity > 0)) {
      setError('يجب إضافة منتج واحد على الأقل للتحويل');
      return;
    }
    if (fromLocation === toLocation) {
      setError('لا يمكن أن يكون موقع المصدر والوجهة نفس الموقع');
      return;
    }
    const overstock = items.find(i => i.productId && i.quantity > i.stock);
    if (overstock) {
      setError(`الكمية المطلوبة من "${overstock.productName}" تتجاوز المخزون المتاح (${overstock.stock})`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        transferNumber,
        fromLocation,
        toLocation,
        date: new Date(date),
        status: 'completed',
        notes: notes || null,
        items: items.filter(i => i.productId && i.quantity > 0).map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      const r = await window.api.createInventoryTransfer(payload, user?.id || '');
      if (r.success) {
        navigate('/inventory/transfers');
      } else {
        setError(r.error || 'فشل في تنفيذ عملية التحويل');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء التحويل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/inventory/transfers')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-violet-500" />
          تحويل مخزون جديد
        </h1>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* بيانات التحويل */}
      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-700 pb-2">بيانات التحويل</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">رقم التحويل</label>
            <input value={transferNumber} onChange={e => setTransferNumber(e.target.value)} className="input-field font-mono" />
          </div>
          <div>
            <label className="form-label">تاريخ التحويل</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="form-label">من موقع</label>
            <select value={fromLocation} onChange={e => setFromLocation(e.target.value)} className="input-field">
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">إلى موقع</label>
            <select value={toLocation} onChange={e => setToLocation(e.target.value)} className="input-field">
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* المنتجات */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">المنتجات المحوّلة</h2>
          <button onClick={addItem} className="btn-secondary text-xs py-1.5 px-3"><Plus className="w-3.5 h-3.5" />إضافة منتج</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs font-bold text-gray-500 dark:text-gray-400">
              <th className="text-right pb-2">المنتج</th>
              <th className="text-right pb-2 w-24">المخزون</th>
              <th className="text-right pb-2 w-24">الكمية</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <td className="py-2 pl-2">
                  <select
                    value={item.productId}
                    onChange={e => updateItem(i, 'productId', e.target.value)}
                    className="input-field text-xs py-1.5"
                  >
                    <option value="">-- اختر منتجاً --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-1 text-center text-xs text-gray-500">
                  {item.stock > 0 ? item.stock : '—'}
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    min="1"
                    max={item.stock || undefined}
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', +e.target.value)}
                    className="input-field text-xs py-1.5 text-center w-full"
                  />
                </td>
                <td className="py-2">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ملاحظات */}
      <div className="card p-5">
        <label className="form-label">ملاحظات (اختياري)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field resize-none" rows={2} placeholder="ملاحظات التحويل..." />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/inventory/transfers')} className="btn-secondary">إلغاء</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التحويل...</> : <><Save className="w-4 h-4" />تأكيد التحويل</>}
        </button>
      </div>
    </div>
  );
};
