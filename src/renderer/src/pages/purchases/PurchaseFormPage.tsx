// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
// import { useAuthStore } from '../../store/authStore';
// import { ArrowRight, Save, Loader2, Plus, Trash2, Search, ShoppingBag } from 'lucide-react';

// interface LineItem {
//   productId: string;
//   productName: string;
//   quantity: number | '';
//   unitPrice: number | '';
//   discount: number;
//   tax: number;
//   notFound?: boolean;
// }

// const emptyLine = (): LineItem => ({
//   productId: '',
//   productName: '',
//   quantity: '',
//   unitPrice: '',
//   discount: 0,
//   tax: 0,
//   notFound: false,
// });

// export const PurchaseFormPage: React.FC = () => {
//   const navigate = useNavigate();
//   const qc = useQueryClient();
//   const user = useAuthStore(s => s.user);

//   const [invoiceNumber, setInvoiceNumber] = useState('');
//   const [supplierId, setSupplierId] = useState('');
//   const [supplierSearch, setSupplierSearch] = useState('');
//   const [supplierName, setSupplierName] = useState('');
//   const [showDrop, setShowDrop] = useState(false);
//   const [paid, setPaid] = useState<number | ''>('');
//   const [notes, setNotes] = useState('');
//   const [items, setItems] = useState<LineItem[]>([emptyLine()]);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const randomNum = Math.floor(100000 + Math.random() * 900000);
//     setInvoiceNumber(`ش-${randomNum}`);
//   }, []);

//   const { data: suppliers } = useQuery({
//     queryKey: ['suppliers-search', supplierSearch],
//     queryFn: async () => {
//       if (supplierSearch.length < 2) return { items: [] };
//       const r = await window.api.getSuppliers({ search: supplierSearch, pageSize: 8 });
//       return r.success ? r.data : { items: [] };
//     },
//     enabled: supplierSearch.length >= 2,
//   });

//   const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
//   const discountTotal = items.reduce((s, i) => s + Number(i.discount || 0), 0);
//   const taxTotal = items.reduce((s, i) => s + Number(i.tax || 0), 0);
//   const total = Math.max(0, subtotal - discountTotal + taxTotal);
//   const paidValue = Number(paid) || 0;
//   const remaining = Math.max(0, total - paidValue);

//   const handleProductSearch = async (lineIdx: number, val: string) => {
//     if (!val.trim()) return;
//     try {
//       const searchResult = await window.api.getProducts({ search: val, pageSize: 1 });
//       if (searchResult.success && searchResult.data?.items?.length > 0) {
//         const prod = searchResult.data.items[0];
//         setItems(p => p.map((item, idx) => idx === lineIdx ? {
//           ...item,
//           productId: prod.id,
//           productName: prod.name,
//           unitPrice: prod.purchasePrice || 0,
//           notFound: false,
//         } : item));
//       } else {
//         setItems(p => p.map((item, idx) => idx === lineIdx ? {
//           ...item,
//           productId: '',
//           notFound: true,
//         } : item));
//       }
//     } catch {
//       setItems(p => p.map((item, idx) => idx === lineIdx ? {
//         ...item,
//         productId: '',
//         notFound: true,
//       } : item));
//     }
//   };

//   const mutation = useMutation({
//     mutationFn: async () => {
//       const validItems = items
//         .filter(i => i.productName.trim() && Number(i.quantity) > 0)
//         .map(i => ({
//           productId: i.productId || undefined,
//           productName: i.productName.trim(),
//           quantity: Number(i.quantity),
//           unitPrice: Number(i.unitPrice) || 0,
//           discount: Number(i.discount) || 0,
//           tax: Number(i.tax) || 0,
//           total: (Number(i.quantity) * (Number(i.unitPrice) || 0)) - (Number(i.discount) || 0) + (Number(i.tax) || 0),
//         }));

//       const payload = {
//         invoiceNumber,
//         date: new Date(),
//         supplierId: supplierId || null,
//         paid: paidValue,
//         subtotal,
//         discount: discountTotal,
//         tax: taxTotal,
//         total,
//         notes,
//         items: validItems,
//       };
//       return window.api.createPurchaseInvoice(payload, user!.id);
//     },
//     onSuccess: (r: any) => {
//       if (r.success) {
//         qc.invalidateQueries({ queryKey: ['purchase-invoices'] });
//         navigate('/purchases');
//       } else {
//         setError(r.error || 'فشل في إنشاء الفاتورة');
//       }
//     },
//   });

//   const addLine = () => setItems(p => [...p, emptyLine()]);
//   const removeLine = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
//   const updateLine = (i: number, field: keyof LineItem, val: any) =>
//     setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

//   const selectSupplier = (s: any) => {
//     setSupplierId(s.id);
//     setSupplierName(s.name);
//     setSupplierSearch('');
//     setShowDrop(false);
//   };

//   const handleSubmit = () => {
//     setError('');
//     const hasValidItem = items.some(i => i.productName.trim() && Number(i.quantity) > 0);
//     if (!hasValidItem) { setError('الفاتورة يجب أن تحتوي على منتج واحد على الأقل'); return; }
//     if (!supplierId) { setError('يرجى اختيار المورد أولاً'); return; }
//     mutation.mutate();
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
//       <div className="flex items-center gap-3">
//         <button onClick={() => navigate('/purchases')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//           <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//         </button>
//         <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
//           <ShoppingBag className="w-5 h-5 text-rose-500" />
//           فاتورة شراء جديدة
//         </h1>
//       </div>

//       {/* المورد */}
//       <div className="card p-5 space-y-3">
//         <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">المورد</h2>
//         <div className="relative">
//           <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             value={supplierSearch}
//             onChange={e => { setSupplierSearch(e.target.value); setShowDrop(true); }}
//             className="input-field pr-10"
//             placeholder="ابحث عن مورد..."
//           />
//           {showDrop && (suppliers?.items?.length ?? 0) > 0 && (
//             <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-card-hover overflow-hidden">
//               {suppliers!.items.map((s: any) => (
//                 <button
//                   key={s.id}
//                   type="button"
//                   onClick={() => selectSupplier(s)}
//                   className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right text-sm transition-colors"
//                 >
//                   <span className="font-semibold text-gray-800 dark:text-gray-200">{s.name}</span>
//                   <span className="text-xs text-gray-500">{s.companyName || ''}</span>
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//         {supplierId && (
//           <div className="flex items-center gap-2 px-3 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-sm">
//             <span className="font-semibold text-accent-700 dark:text-accent-300">{supplierName}</span>
//             <button onClick={() => { setSupplierId(''); setSupplierName(''); }} className="text-gray-400 hover:text-red-500 mr-auto">✕</button>
//           </div>
//         )}
//       </div>

//       {/* البنود */}
//       <div className="card p-5 space-y-3 overflow-x-auto">
//         <div className="flex items-center justify-between min-w-[700px]">
//           <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">المنتجات المشتراة</h2>
//           <button onClick={addLine} className="btn-secondary text-xs py-1.5 px-3">
//             <Plus className="w-3.5 h-3.5" />إضافة بند
//           </button>
//         </div>
//         <table className="w-full text-sm min-w-[700px]">
//           <thead>
//             <tr className="text-xs font-bold text-gray-500 dark:text-gray-400">
//               <th className="text-right pb-2 pr-2">اسم المنتج / الباركود</th>
//               <th className="text-right pb-2 w-20">الكمية</th>
//               <th className="text-right pb-2 w-24">سعر الشراء</th>
//               <th className="text-right pb-2 w-20">خصم</th>
//               <th className="text-right pb-2 w-20">ضريبة</th>
//               <th className="text-right pb-2 w-24">الإجمالي</th>
//               <th className="w-8" />
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item, i) => {
//               const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) - Number(item.discount || 0) + Number(item.tax || 0);
//               return (
//                 <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
//                   <td className="py-2 pl-2">
//                     <input
//                       placeholder="ابحث عن منتج بالاسم/الباركود..."
//                       value={item.productName}
//                       onChange={e => { updateLine(i, 'productName', e.target.value); updateLine(i, 'notFound', false); }}
//                       onBlur={e => handleProductSearch(i, e.target.value)}
//                       className="input-field text-xs py-1.5"
//                     />
//                     {item.notFound && (
//                       <p className="text-amber-600 text-[10px] mt-1 font-semibold">
//                         ⚠️ منتج جديد (سيتم إنشاؤه تلقائياً عند حفظ الفاتورة)
//                       </p>
//                     )}
//                   </td>
//                   <td className="py-2 px-1">
//                     <input
//                       type="number"
//                       min="1"
//                       value={item.quantity}
//                       onChange={e => updateLine(i, 'quantity', e.target.value === '' ? '' : +e.target.value)}
//                       className="input-field text-xs py-1.5 text-center w-full"
//                       placeholder="0"
//                     />
//                   </td>
//                   <td className="py-2 px-1">
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.5"
//                       value={item.unitPrice}
//                       onChange={e => updateLine(i, 'unitPrice', e.target.value === '' ? '' : +e.target.value)}
//                       className="input-field text-xs py-1.5 w-full"
//                       placeholder="0.00"
//                     />
//                   </td>
//                   <td className="py-2 px-1">
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.5"
//                       value={item.discount}
//                       onChange={e => updateLine(i, 'discount', +e.target.value)}
//                       className="input-field text-xs py-1.5 w-full text-center"
//                       placeholder="0.00"
//                     />
//                   </td>
//                   <td className="py-2 px-1">
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.5"
//                       value={item.tax}
//                       onChange={e => updateLine(i, 'tax', +e.target.value)}
//                       className="input-field text-xs py-1.5 w-full text-center"
//                       placeholder="0.00"
//                     />
//                   </td>
//                   <td className="py-2 px-1 font-bold text-gray-900 dark:text-gray-100 text-xs text-right">
//                     {lineTotal !== 0 ? lineTotal.toFixed(2) : '—'}
//                   </td>
//                   <td className="py-2">
//                     {items.length > 1 && (
//                       <button onClick={() => removeLine(i)} className="p-1 text-red-400 hover:text-red-600">
//                         <Trash2 className="w-3.5 h-3.5" />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* الملخص المالي */}
//       <div className="card p-5 space-y-3">
//         <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">الملخص المالي</h2>
//         <div>
//           <label className="form-label">المبلغ المدفوع (الجنيه)</label>
//           <input
//             type="number"
//             min="0"
//             step="0.5"
//             value={paid}
//             onChange={e => {
//               const raw = e.target.value;
//               if (raw === '') { setPaid(''); return; }
//               setPaid(Math.min(+raw, total));
//             }}
//             className="input-field w-48"
//             placeholder="0.00"
//           />
//         </div>
//         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-2 text-sm">
//           <div className="flex justify-between text-gray-600 dark:text-gray-400">
//             <span>المجموع الفرعي</span>
//             <span>{subtotal.toFixed(2)} الجنيه</span>
//           </div>
//           {discountTotal > 0 && (
//             <div className="flex justify-between text-red-500">
//               <span>إجمالي الخصم</span>
//               <span>-{discountTotal.toFixed(2)} الجنيه</span>
//             </div>
//           )}
//           {taxTotal > 0 && (
//             <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
//               <span>إجمالي الضريبة</span>
//               <span>+{taxTotal.toFixed(2)} الجنيه</span>
//             </div>
//           )}
//           <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-base border-t border-gray-200 dark:border-gray-600 pt-2">
//             <span>الإجمالي النهائي</span>
//             <span>{total.toFixed(2)} الجنيه</span>
//           </div>
//           <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
//             <span>مدفوع</span>
//             <span>{paidValue.toFixed(2)} الجنيه</span>
//           </div>
//           <div className={`flex justify-between font-black ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
//             <span>المتبقي في ذمة المورد</span>
//             <span>{remaining.toFixed(2)} الجنيه</span>
//           </div>
//         </div>
//         <div>
//           <label className="form-label">ملاحظات الفاتورة</label>
//           <textarea
//             value={notes}
//             onChange={e => setNotes(e.target.value)}
//             className="input-field resize-none"
//             rows={2}
//             placeholder="ملاحظات إضافية..."
//           />
//         </div>
//       </div>

//       {error && (
//         <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
//           {error}
//         </div>
//       )}

//       <div className="flex justify-end gap-3">
//         <button onClick={() => navigate('/purchases')} className="btn-secondary">إلغاء</button>
//         <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary">
//           {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-4 h-4" />إصدار فاتورة الشراء</>}
//         </button>
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Save, Loader2, Plus, Trash2, Search, ShoppingBag } from 'lucide-react';

interface LineItem {
  productId: string;
  productName: string;
  quantity: number | '';
  unitPrice: number | '';
  discount: number | '';
  tax: number | '';
  notFound?: boolean;
}

const emptyLine = (): LineItem => ({
  productId: '',
  productName: '',
  quantity: '',
  unitPrice: '',
  discount: '',
  tax: '',
  notFound: false,
});

export const PurchaseFormPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [showDrop, setShowDrop] = useState(false);
  const [paid, setPaid] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyLine()]);
  const [error, setError] = useState('');

  useEffect(() => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNumber(`ش-${randomNum}`);
  }, []);

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers-search', supplierSearch],
    queryFn: async () => {
      if (supplierSearch.length < 2) return { items: [] };
      const r = await window.api.getSuppliers({ search: supplierSearch, pageSize: 8 });
      return r.success ? r.data : { items: [] };
    },
    enabled: supplierSearch.length >= 2,
  });

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
  const discountTotal = items.reduce((s, i) => s + (Number(i.discount) || 0), 0);
  const taxTotal = items.reduce((s, i) => s + (Number(i.tax) || 0), 0);
  const total = Math.max(0, subtotal - discountTotal + taxTotal);
  const paidValue = Number(paid) || 0;
  const remaining = Math.max(0, total - paidValue);

  const handleProductSearch = async (lineIdx: number, val: string) => {
    if (!val.trim()) return;
    try {
      const searchResult = await window.api.getProducts({ search: val, pageSize: 1 });
      if (searchResult.success && searchResult.data?.items?.length > 0) {
        const prod = searchResult.data.items[0];
        setItems(p => p.map((item, idx) => idx === lineIdx ? {
          ...item,
          productId: prod.id,
          productName: prod.name,
          unitPrice: prod.purchasePrice || 0,
          notFound: false,
        } : item));
      } else {
        setItems(p => p.map((item, idx) => idx === lineIdx ? {
          ...item,
          productId: '',
          notFound: true,
        } : item));
      }
    } catch {
      setItems(p => p.map((item, idx) => idx === lineIdx ? {
        ...item,
        productId: '',
        notFound: true,
      } : item));
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const validItems = items
        .filter(i => i.productName.trim() && Number(i.quantity) > 0)
        .map(i => ({
          productId: i.productId || undefined,
          productName: i.productName.trim(),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice) || 0,
          discount: Number(i.discount) || 0,
          tax: Number(i.tax) || 0,
          total: (Number(i.quantity) * (Number(i.unitPrice) || 0)) - (Number(i.discount) || 0) + (Number(i.tax) || 0),
        }));

      const payload = {
        invoiceNumber,
        date: new Date(),
        supplierId: supplierId || null,
        paid: paidValue,
        subtotal,
        discount: discountTotal,
        tax: taxTotal,
        total,
        notes,
        items: validItems,
      };
      return window.api.createPurchaseInvoice(payload, user!.id);
    },
    onSuccess: (r: any) => {
      if (r.success) {
        qc.invalidateQueries({ queryKey: ['purchase-invoices'] });
        navigate('/purchases');
      } else {
        setError(r.error || 'فشل في إنشاء الفاتورة');
      }
    },
  });

  const addLine = () => setItems(p => [...p, emptyLine()]);
  const removeLine = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: keyof LineItem, val: any) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const selectSupplier = (s: any) => {
    setSupplierId(s.id);
    setSupplierName(s.name);
    setSupplierSearch('');
    setShowDrop(false);
  };

  const handleSubmit = () => {
    setError('');
    const hasValidItem = items.some(i => i.productName.trim() && Number(i.quantity) > 0);
    if (!hasValidItem) { setError('الفاتورة يجب أن تحتوي على منتج واحد على الأقل'); return; }
    if (!supplierId) { setError('يرجى اختيار المورد أولاً'); return; }
    mutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/purchases')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-rose-500" />
          فاتورة شراء جديدة
        </h1>
      </div>

      {/* المورد */}
      <div className="card p-5 space-y-3">
        <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">المورد</h2>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={supplierSearch}
            onChange={e => { setSupplierSearch(e.target.value); setShowDrop(true); }}
            className="input-field pr-10"
            placeholder="ابحث عن مورد..."
          />
          {showDrop && (suppliers?.items?.length ?? 0) > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-card-hover overflow-hidden">
              {suppliers!.items.map((s: any) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSupplier(s)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right text-sm transition-colors"
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{s.name}</span>
                  <span className="text-xs text-gray-500">{s.companyName || ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {supplierId && (
          <div className="flex items-center gap-2 px-3 py-2 bg-accent-50 dark:bg-accent-900/20 rounded-xl text-sm">
            <span className="font-semibold text-accent-700 dark:text-accent-300">{supplierName}</span>
            <button onClick={() => { setSupplierId(''); setSupplierName(''); }} className="text-gray-400 hover:text-red-500 mr-auto">✕</button>
          </div>
        )}
      </div>

      {/* البنود */}
      <div className="card p-5 space-y-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          <h2 className="font-bold text-gray-800 dark:text-gray-200 text-sm">المنتجات المشتراة</h2>
          <button onClick={addLine} className="btn-secondary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />إضافة بند
          </button>
        </div>
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-xs font-bold text-gray-500 dark:text-gray-400">
              <th className="text-right pb-2 pr-2">اسم المنتج / الباركود</th>
              <th className="text-right pb-2 w-20">الكمية</th>
              <th className="text-right pb-2 w-24">سعر الشراء</th>
              <th className="text-right pb-2 w-20">خصم</th>
              <th className="text-right pb-2 w-20">ضريبة</th>
              <th className="text-right pb-2 w-24">الإجمالي</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) - (Number(item.discount) || 0) + (Number(item.tax) || 0);
              return (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <td className="py-2 pl-2">
                    <input
                      placeholder="ابحث عن منتج بالاسم/الباركود..."
                      value={item.productName}
                      onChange={e => { updateLine(i, 'productName', e.target.value); updateLine(i, 'notFound', false); }}
                      onBlur={e => handleProductSearch(i, e.target.value)}
                      className="input-field text-xs py-1.5"
                    />
                    {item.notFound && (
                      <p className="text-amber-600 text-[10px] mt-1 font-semibold">
                        ⚠️ منتج جديد (سيتم إنشاؤه تلقائياً عند حفظ الفاتورة)
                      </p>
                    )}
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => updateLine(i, 'quantity', e.target.value === '' ? '' : +e.target.value)}
                      className="input-field text-xs py-1.5 text-center w-full"
                      placeholder="0"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.unitPrice}
                      onChange={e => updateLine(i, 'unitPrice', e.target.value === '' ? '' : +e.target.value)}
                      className="input-field text-xs py-1.5 w-full"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.discount}
                      onChange={e => updateLine(i, 'discount', e.target.value === '' ? '' : +e.target.value)}
                      className="input-field text-xs py-1.5 w-full text-center"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.tax}
                      onChange={e => updateLine(i, 'tax', e.target.value === '' ? '' : +e.target.value)}
                      className="input-field text-xs py-1.5 w-full text-center"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="py-2 px-1 font-bold text-gray-900 dark:text-gray-100 text-xs text-right">
                    {lineTotal !== 0 ? lineTotal.toFixed(2) : '—'}
                  </td>
                  <td className="py-2">
                    {items.length > 1 && (
                      <button onClick={() => removeLine(i)} className="p-1 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
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
            value={paid}
            onChange={e => {
              const raw = e.target.value;
              if (raw === '') { setPaid(''); return; }
              setPaid(Math.min(+raw, total));
            }}
            className="input-field w-48"
            placeholder="0.00"
          />
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>المجموع الفرعي</span>
            <span>{subtotal.toFixed(2)} الجنيه</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-red-500">
              <span>إجمالي الخصم</span>
              <span>-{discountTotal.toFixed(2)} الجنيه</span>
            </div>
          )}
          {taxTotal > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>إجمالي الضريبة</span>
              <span>+{taxTotal.toFixed(2)} الجنيه</span>
            </div>
          )}
          <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-base border-t border-gray-200 dark:border-gray-600 pt-2">
            <span>الإجمالي النهائي</span>
            <span>{total.toFixed(2)} الجنيه</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
            <span>مدفوع</span>
            <span>{paidValue.toFixed(2)} الجنيه</span>
          </div>
          <div className={`flex justify-between font-black ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            <span>المتبقي في ذمة المورد</span>
            <span>{remaining.toFixed(2)} الجنيه</span>
          </div>
        </div>
        <div>
          <label className="form-label">ملاحظات الفاتورة</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="input-field resize-none"
            rows={2}
            placeholder="ملاحظات إضافية..."
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button onClick={() => navigate('/purchases')} className="btn-secondary">إلغاء</button>
        <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-4 h-4" />إصدار فاتورة الشراء</>}
        </button>
      </div>
    </div>
  );
};