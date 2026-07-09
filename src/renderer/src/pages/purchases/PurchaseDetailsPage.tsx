// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import { ArrowRight, Printer, ShoppingBag } from 'lucide-react';

// export const PurchaseDetailsPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const { data: inv, isLoading } = useQuery({
//     queryKey: ['purchase-invoice', id],
//     queryFn: async () => {
//       const r = await window.api.getPurchaseInvoiceById(id!);
//       return r.success ? r.data : null;
//     },
//     enabled: !!id,
//   });

//   if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;
//   if (!inv) return <div className="text-center py-16 text-gray-400"><p className="font-semibold">الفاتورة غير موجودة</p></div>;

//   const statusLabel: Record<string, string> = { draft: 'مسودة', confirmed: 'مؤكدة', paid: 'مدفوعة', partial: 'جزئي', cancelled: 'ملغاة' };
//   const statusBadge: Record<string, string> = { draft: 'badge-neutral', confirmed: 'badge-info', paid: 'badge-success', partial: 'badge-warning', cancelled: 'badge-danger' };
//   const remaining = inv.total - inv.paid;

//   return (
//     <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <button onClick={() => navigate('/purchases')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
//             <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//           </button>
//           <div>
//             <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
//               <ShoppingBag className="w-5 h-5 text-rose-500" />
//               فاتورة شراء #{inv.invoiceNumber}
//             </h1>
//             <p className="text-xs text-gray-500 mt-0.5">{new Date(inv.date).toLocaleDateString('ar-EG', { dateStyle: 'full' })}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <span className={`badge ${statusBadge[inv.status] || 'badge-neutral'}`}>{statusLabel[inv.status]}</span>
//           <button onClick={() => window.api.printWindow(true)} className="btn-secondary py-2 px-3">
//             <Printer className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* بيانات المورد */}
//       <div className="card p-5 space-y-2 text-sm">
//         <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">بيانات المورد</p>
//         <div className="flex justify-between"><span className="text-gray-500">المورد</span><span className="font-semibold">{inv.supplier?.name || '—'}</span></div>
//         {inv.supplier?.companyName && <div className="flex justify-between"><span className="text-gray-500">الشركة</span><span>{inv.supplier.companyName}</span></div>}
//         {inv.supplier?.phone && <div className="flex justify-between"><span className="text-gray-500">الهاتف</span><span>{inv.supplier.phone}</span></div>}
//       </div>

//       {/* البنود */}
//       <div className="card overflow-hidden">
//         <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300">المنتجات المشتراة</div>
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 dark:bg-gray-700/50">
//             <tr>
//               <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المنتج</th>
//               <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
//               <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">السعر</th>
//               <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجمالي</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//             {(inv.items || []).map((item: any, i: number) => (
//               <tr key={i}>
//                 <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{item.product?.name || item.productName || item.productId}</td>
//                 <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.quantity}</td>
//                 <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.unitPrice.toFixed(2)}</td>
//                 <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-gray-100">{(item.quantity * item.unitPrice).toFixed(2)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* الملخص */}
//       <div className="card p-5 space-y-2 text-sm">
//         <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">الملخص المالي</p>
//         <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-base border-b border-gray-100 dark:border-gray-700 pb-2"><span>الإجمالي</span><span>{inv.total.toFixed(2)} الجنيه</span></div>
//         <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400"><span>مدفوع</span><span>{inv.paid.toFixed(2)} الجنيه</span></div>
//         <div className={`flex justify-between font-black ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}><span>المتبقي</span><span>{remaining.toFixed(2)} الجنيه</span></div>
//       </div>

//       {inv.notes && (
//         <div className="card p-5 text-sm"><p className="font-bold text-gray-600 dark:text-gray-400 mb-2">ملاحظات</p><p className="text-gray-700 dark:text-gray-300">{inv.notes}</p></div>
//       )}
//     </div>
//   );
// };
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Printer, ShoppingBag } from 'lucide-react';

// Derives the real payment status from the actual financial data,
// instead of relying on a possibly-stale/hardcoded status field.
const getComputedStatus = (inv: { total: number; paid: number }): 'paid' | 'partial' => {
  const remaining = Number(inv.total) - Number(inv.paid);
  return remaining <= 0 ? 'paid' : 'partial';
};

export const PurchaseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inv, isLoading } = useQuery({
    queryKey: ['purchase-invoice', id],
    queryFn: async () => {
      const r = await window.api.getPurchaseInvoiceById(id!);
      return r.success ? r.data : null;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!inv) return <div className="text-center py-16 text-gray-400"><p className="font-semibold">الفاتورة غير موجودة</p></div>;

  // Only Paid / Partial remain, as required.
  const statusLabel: Record<string, string> = { paid: 'مدفوعة', partial: 'جزئي' };
  const statusBadge: Record<string, string> = { paid: 'badge-success', partial: 'badge-warning' };
  const remaining = inv.total - inv.paid;
  const computedStatus = getComputedStatus(inv);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/purchases')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              فاتورة شراء #{inv.invoiceNumber}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(inv.date).toLocaleDateString('ar-EG', { dateStyle: 'full' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${statusBadge[computedStatus]}`}>{statusLabel[computedStatus]}</span>
          <button onClick={() => window.api.printWindow(true)} className="btn-secondary py-2 px-3">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* بيانات المورد */}
      <div className="card p-5 space-y-2 text-sm">
        <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">بيانات المورد</p>
        <div className="flex justify-between"><span className="text-gray-500">المورد</span><span className="font-semibold">{inv.supplier?.name || '—'}</span></div>
        {inv.supplier?.companyName && <div className="flex justify-between"><span className="text-gray-500">الشركة</span><span>{inv.supplier.companyName}</span></div>}
        {inv.supplier?.phone && <div className="flex justify-between"><span className="text-gray-500">الهاتف</span><span>{inv.supplier.phone}</span></div>}
      </div>

      {/* البنود */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300">المنتجات المشتراة</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المنتج</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">السعر</th>
              <th className="px-4 py-2.5 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {(inv.items || []).map((item: any, i: number) => (
              <tr key={i}>
                <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{item.product?.name || item.productName || item.productId}</td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-gray-100">{(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* الملخص */}
      <div className="card p-5 space-y-2 text-sm">
        <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">الملخص المالي</p>
        <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-base border-b border-gray-100 dark:border-gray-700 pb-2"><span>الإجمالي</span><span>{inv.total.toFixed(2)} الجنيه</span></div>
        <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400"><span>مدفوع</span><span>{inv.paid.toFixed(2)} الجنيه</span></div>
        <div className={`flex justify-between font-black ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}><span>المتبقي</span><span>{remaining.toFixed(2)} الجنيه</span></div>
      </div>

      {inv.notes && (
        <div className="card p-5 text-sm"><p className="font-bold text-gray-600 dark:text-gray-400 mb-2">ملاحظات</p><p className="text-gray-700 dark:text-gray-300">{inv.notes}</p></div>
      )}
    </div>
  );
};