import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Save, Loader2, Plus, Trash2, Search, ShoppingCart } from 'lucide-react';

interface LineItem {
  productId: string;
  productName: string;
  quantity: number | '';
  unitPrice: number | '';
  discount: number | '';
  unit: string; // piece | carton | can | liter
  saleType: 'retail' | 'wholesale';
  oilProduct?: any;
  itemType: 'product' | 'accessory';
  resolving?: boolean;
  notFound?: boolean;
}

const emptyLine = (): LineItem => ({
  productId: '',
  productName: '',
  quantity: '',
  unitPrice: '',
  discount: '',
  unit: 'piece',
  saleType: 'retail',
  itemType: 'product',
  resolving: false,
  notFound: false,
});

const num = (v: number | '' | undefined): number => (v === '' || v === undefined || v === null ? 0 : v);

const getOilUnitPrice = (oilProduct: any, unit: string, saleType: 'retail' | 'wholesale'): number => {
  if (!oilProduct) return 0;
  const basePrice = saleType === 'retail' ? (oilProduct.retailPrice || 0) : (oilProduct.wholesalePrice || 0);
  const cartonCount = oilProduct.cartonUnitsCount || 12;
  const literCapacity = oilProduct.canCapacityLiters || 1;
  if (unit === 'carton') return basePrice * cartonCount;   // سعر الكرتون = سعر العلبة × عدد العلب
  if (unit === 'liter')  return basePrice / literCapacity;  // سعر اللتر = سعر العلبة / سعة العلبة
  return basePrice;                                          // can = سعر العلبة مباشرة
};

// إجمالي البند بعد تطبيق نسبة الخصم المئوية (مثال: سعر 500 × كمية 2 = 1000، خصم 10% => 900)
const lineTotal = (item: LineItem): number => {
  const qty = num(item.quantity);
  const price = num(item.unitPrice);
  const discountPct = Math.min(100, Math.max(0, num(item.discount)));
  const subtotal = qty * price;
  return subtotal * (1 - discountPct / 100);
};

export const SaleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerName, setCustomerName] = useState('عميل مجهول');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [paid, setPaid] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyLine()]);
  const [error, setError] = useState('');

  const { data: customers } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: async () => {
      if (customerSearch.length < 2) return { items: [] };
      const r = await window.api.getCustomers({ search: customerSearch, pageSize: 8 });
      return r.success ? r.data : { items: [] };
    },
    enabled: customerSearch.length >= 2,
  });

  const subtotal = items.reduce((s, i) => s + lineTotal(i), 0);
  const total    = subtotal;
  const paidNum  = num(paid);
  const remaining = Math.max(0, total - paidNum);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        customerId: customerId === 'new-customer' ? null : (customerId || null),
        newCustomerName: customerId === 'new-customer' ? newCustomerName : null,
        newCustomerPhone: customerId === 'new-customer' ? newCustomerPhone : null,
        paid: paidNum,
        notes,
        items: items.filter(i => i.productId && num(i.quantity) > 0 && i.itemType === 'product').map(i => ({
          productId: i.productId,
          quantity: num(i.quantity),
          unitPrice: num(i.unitPrice),
          discount: num(i.discount),
          unit: i.unit,
          saleType: i.saleType,
        })),
        accessoryItems: items.filter(i => i.productId && num(i.quantity) > 0 && i.itemType === 'accessory').map(i => ({
          accessoryId: i.productId,
          quantity: num(i.quantity),
          unitPrice: num(i.unitPrice),
          discount: num(i.discount),
        })),
      };
      return window.api.createSaleInvoice(payload, user?.id ?? '');
    },
    onSuccess: (r: any) => {
      if (r.success) {
        qc.invalidateQueries({ queryKey: ['sale-invoices'] });
        qc.invalidateQueries({ queryKey: ['customers'] });
        navigate('/sales');
      } else {
        setError(r.error || 'فشل في إنشاء الفاتورة');
      }
    },
    onError: (err: any) => {
      setError(err?.message || 'حدث خطأ غير متوقع أثناء إصدار الفاتورة');
    },
  });

  const addLine = () => setItems(p => [...p, emptyLine()]);
  const removeLine = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItem, val: any) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const selectCustomer = (c: any) => {
    setCustomerId(c.id);
    setCustomerName(c.name);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setCustomerSearch('');
    setShowDrop(false);
  };

  const handleProductSearch = async (lineIdx: number, val: string) => {
    if (!val) return;
    const currentItem = items[lineIdx];
    updateLine(lineIdx, 'resolving', true);
    updateLine(lineIdx, 'notFound', false);
    try {
      if (currentItem.itemType === 'accessory') {
        const searchResult = await window.api.getAccessories({ search: val, pageSize: 1 });
        if (!(searchResult.success && searchResult.data?.items?.length > 0)) {
          updateLine(lineIdx, 'resolving', false);
          updateLine(lineIdx, 'notFound', true);
          return;
        }
        const acc = searchResult.data.items[0];
        setItems(p => p.map((item, idx) => idx === lineIdx ? {
          ...item,
          productId: acc.id,
          productName: acc.name,
          unit: 'piece',
          saleType: 'retail',
          unitPrice: acc.price,
          oilProduct: null,
          resolving: false,
          notFound: false,
        } : item));
      } else {
        const searchResult = await window.api.getProducts({ search: val, pageSize: 1 });
        if (!(searchResult.success && searchResult.data?.items?.length > 0)) {
          updateLine(lineIdx, 'resolving', false);
          updateLine(lineIdx, 'notFound', true);
          return;
        }
        const r = await window.api.getProductById(searchResult.data.items[0].id);

        if (r.success && r.data) {
          const prod = r.data;
          const isOil = !!prod.oilProduct;
          const unit = isOil ? 'can' : 'piece';
          const saleType = 'retail';
          const unitPrice = isOil ? getOilUnitPrice(prod.oilProduct, unit, saleType) : prod.sellingPrice;

          setItems(p => p.map((item, idx) => idx === lineIdx ? {
            ...item,
            productId: prod.id,
            productName: prod.name,
            unit,
            saleType,
            unitPrice,
            oilProduct: prod.oilProduct,
            resolving: false,
            notFound: false,
          } : item));
        } else {
          updateLine(lineIdx, 'resolving', false);
          updateLine(lineIdx, 'notFound', true);
        }
      }
    } catch {
      updateLine(lineIdx, 'resolving', false);
      updateLine(lineIdx, 'notFound', true);
    }
  };

  const handleUnitOrTypeChange = (i: number, unit: string, saleType: 'retail' | 'wholesale', oilProduct: any) => {
    const price = oilProduct
      ? getOilUnitPrice(oilProduct, unit, saleType)
      : items[i].unitPrice;

    setItems(p => p.map((item, idx) => idx === i ? {
      ...item,
      unit,
      saleType,
      unitPrice: price,
    } : item));
  };

  const isResolving = items.some(i => i.resolving);
  const hasValidItem = items.some(i => i.productId && num(i.quantity) > 0);

  const handleSubmit = () => {
    setError('');
    if (!user) { setError('يجب تسجيل الدخول لإصدار الفاتورة'); return; }
    if (isResolving) { setError('جارٍ التحقق من المنتج، يرجى الانتظار'); return; }
    if (!hasValidItem) { setError('يجب إضافة بند واحد على الأقل قبل إصدار الفاتورة'); return; }
    if (customerId === 'new-customer' && !newCustomerName.trim()) { setError('يرجى إدخال اسم العميل الجديد'); return; }
    mutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/sales')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-teal-500" />
          فاتورة بيع جديدة
        </h1>
      </div>

      {/* العميل */}
      <div className="card p-5 space-y-3">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">العميل</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={customerSearch}
            onChange={e => { setCustomerSearch(e.target.value); setShowDrop(true); }}
            className="input-field pr-10"
            placeholder="ابحث عن عميل أو اكتب اسمه للإضافة السريعة..."
          />
          {showDrop && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-card-hover overflow-hidden">
              {(customers?.items || []).map((c: any) => (
                <button key={c.id} type="button" onClick={() => selectCustomer(c)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right transition-colors text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.phone || ''}</span>
                </button>
              ))}
              {customerSearch.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomerId('new-customer');
                    setNewCustomerName(customerSearch);
                    setCustomerName(`عميل جديد: ${customerSearch}`);
                    setCustomerSearch('');
                    setShowDrop(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right text-teal-600 dark:text-teal-400 font-bold border-t border-gray-100 dark:border-gray-700 text-sm"
                >
                  <span>➕ إضافة كعميل جديد:</span>
                  <span>{customerSearch}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {customerId && customerId !== 'new-customer' && (
          <div className="flex items-center gap-2 px-3 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-sm">
            <span className="font-semibold text-accent-700 dark:text-accent-300">{customerName}</span>
            <button onClick={() => { setCustomerId(''); setCustomerName('عميل مجهول'); }} className="text-gray-400 hover:text-red-500 mr-auto">✕</button>
          </div>
        )}

        {customerId === 'new-customer' && (
          <div className="flex flex-col gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-teal-850 dark:text-teal-300">سيتم إنشاء العميل تلقائياً عند حفظ الفاتورة</span>
              <button
                type="button"
                onClick={() => { setCustomerId(''); setCustomerName('عميل مجهول'); setNewCustomerName(''); setNewCustomerPhone(''); }}
                className="text-gray-400 hover:text-red-500 text-xs"
              >
                ✕ إلغاء
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">اسم العميل</label>
                <input
                  value={newCustomerName}
                  onChange={e => setNewCustomerName(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  required
                />
              </div>
              <div>
                <label className="form-label text-xs">رقم الهاتف (اختياري)</label>
                <input
                  value={newCustomerPhone}
                  onChange={e => setNewCustomerPhone(e.target.value)}
                  className="input-field py-1.5 text-xs"
                  placeholder="مثال: 0500000000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* بنود الفاتورة */}
      <div className="card p-5 space-y-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">بنود الفاتورة</h2>
          <button onClick={addLine} className="btn-secondary text-xs py-1.5 px-3"><Plus className="w-3.5 h-3.5" />إضافة منتج</button>
        </div>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-xs font-bold text-gray-500 dark:text-gray-400">
              <th className="text-right pb-2 w-32">نوع البند</th>
              <th className="text-right pb-2 pr-2">اسم المنتج</th>
              <th className="text-right pb-2 w-28">نوع البيع</th>
              <th className="text-right pb-2 w-20">الكمية</th>
              <th className="text-right pb-2 w-24">سعر الوحدة</th>
              <th className="text-right pb-2 w-16">خصم%</th>
              <th className="text-right pb-2 w-24">الإجمالي</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="space-y-2">
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                <td className="py-2 pl-2 w-32">
                  <select
                    value={item.itemType}
                    onChange={e => {
                      updateLine(i, 'itemType', e.target.value);
                      updateLine(i, 'productId', '');
                      updateLine(i, 'productName', '');
                      updateLine(i, 'unitPrice', '');
                      updateLine(i, 'oilProduct', null);
                      updateLine(i, 'notFound', false);
                    }}
                    className="input-field text-xs py-1.5"
                  >
                    <option value="product">منتج / زيت</option>
                    <option value="accessory">إكسسوار</option>
                  </select>
                </td>
                <td className="py-2 pl-2">
                  <input
                    placeholder={item.itemType === 'accessory' ? "اسم الإكسسوار للبحث..." : "اسم المنتج للبحث..."}
                    value={item.productName}
                    onChange={e => { updateLine(i, 'productName', e.target.value); updateLine(i, 'notFound', false); }}
                    onBlur={e => handleProductSearch(i, e.target.value)}
                    className="input-field text-xs py-1.5"
                  />
                  {item.notFound && (
                    <p className="text-red-500 text-[11px] mt-1">
                      {item.itemType === 'accessory' ? "لم يتم العثور على إكسسوار بهذا الاسم" : "لم يتم العثور على منتج بهذا الاسم"}
                    </p>
                  )}
                </td>
                <td className="py-2 px-1">
                  {item.itemType === 'accessory' ? (
                    <span className="text-gray-400 text-xs px-2 flex justify-center">—</span>
                  ) : (
                    <select
                      value={item.saleType}
                      onChange={e => handleUnitOrTypeChange(i, item.unit, e.target.value as any, item.oilProduct)}
                      className="input-field text-xs py-1.5"
                    >
                      <option value="retail">قطاعي</option>
                      <option value="wholesale">جملة</option>
                    </select>
                  )}
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    placeholder="0"
                    value={item.quantity}
                    onChange={e => updateLine(i, 'quantity', e.target.value === '' ? '' : +e.target.value)}
                    className="input-field text-xs py-1.5 text-center w-full"
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={item.unitPrice}
                    onChange={e => updateLine(i, 'unitPrice', e.target.value === '' ? '' : +e.target.value)}
                    className="input-field text-xs py-1.5 w-full"
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    value={item.discount}
                    onChange={e => updateLine(i, 'discount', e.target.value === '' ? '' : +e.target.value)}
                    className="input-field text-xs py-1.5 text-center w-full"
                  />
                </td>
                <td className="py-2 px-1 font-bold text-gray-900 dark:text-gray-100 text-xs text-right">
                  {lineTotal(item).toFixed(2)}
                </td>
                <td className="py-2">
                  {items.length > 1 && (
                    <button onClick={() => removeLine(i)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* الملخص المالي */}
      <div className="card p-5 space-y-3">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">الملخص المالي</h2>
        <div>
          <label className="form-label">المبلغ المدفوع (الجنيه)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="0"
            value={paid}
            onChange={e => setPaid(e.target.value === '' ? '' : Math.min(+e.target.value, total))}
            className="input-field w-48"
          />
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>المجموع الفرعي</span><span>{subtotal.toFixed(2)} الجنيه</span></div>
          <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-base border-t border-gray-200 dark:border-gray-600 pt-2"><span>الإجمالي</span><span>{total.toFixed(2)} الجنيه</span></div>
          <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400"><span>مدفوع</span><span>{paidNum.toFixed(2)} الجنيه</span></div>
          <div className={`flex justify-between font-black ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}><span>المتبقي</span><span>{remaining.toFixed(2)} الجنيه</span></div>
        </div>
        <div>
          <label className="form-label">ملاحظات</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input-field resize-none" rows={2} />
        </div>
      </div>

      {error && <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/sales')} className="btn-secondary">إلغاء</button>
        <button onClick={handleSubmit} disabled={mutation.isPending || isResolving} className="btn-primary">
          {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-4 h-4" />إصدار الفاتورة</>}
        </button>
      </div>
    </div>
  );
};