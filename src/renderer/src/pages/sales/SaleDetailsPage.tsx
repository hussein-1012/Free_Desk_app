import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Printer, ShoppingCart, User } from 'lucide-react';

export const SaleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inv, isLoading } = useQuery({
    queryKey: ['sale-invoice', id],
    queryFn: async () => {
      const r = await window.api.getSaleInvoiceById(id!);
      return r.success ? r.data : null;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!inv) return <div className="text-center py-16 text-gray-400"><p className="font-semibold">الفاتورة غير موجودة</p></div>;

  const statusLabel: Record<string, string> = { draft: 'مسودة', confirmed: 'مؤكدة', paid: 'مدفوعة', partial: 'جزئي', cancelled: 'ملغاة' };
  const statusBadge: Record<string, string> = { draft: 'badge-neutral', confirmed: 'badge-info', paid: 'badge-success', partial: 'badge-warning', cancelled: 'badge-danger' };
  const remaining = inv.total - inv.paid;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sales')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-teal-500" />
              فاتورة بيع #{inv.invoiceNumber}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{new Date(inv.date).toLocaleDateString('ar-EG', { dateStyle: 'full' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${statusBadge[inv.status] || 'badge-neutral'}`}>{statusLabel[inv.status]}</span>
          <button onClick={() => window.api.printWindow(true)} className="btn-secondary py-2 px-3">
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* بيانات العميل */}
      <div className="card p-5 space-y-2 text-sm">
        <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">بيانات العميل</p>
        <div className="flex justify-between"><span className="text-gray-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />العميل</span><span className="font-semibold">{inv.customer?.name || 'عميل مجهول'}</span></div>
        {inv.customer?.phone && <div className="flex justify-between"><span className="text-gray-500">الهاتف</span><span>{inv.customer.phone}</span></div>}
      </div>

      {/* بنود الفاتورة */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-700 dark:text-gray-300">بنود الفاتورة</div>
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
              <tr key={`item-${i}`}>
                <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                  {item.product?.name || item.productId}
                  {item.unit && item.unit !== 'piece' && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded mr-1">
                      {item.unit === 'carton' ? 'كرتون' : item.unit === 'can' ? 'علبة' : item.unit === 'liter' ? 'لتر' : item.unit}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-gray-100">{(item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)).toFixed(2)}</td>
              </tr>
            ))}
            {(inv.accessoryItems || []).map((item: any, i: number) => (
              <tr key={`acc-${i}`} className="bg-amber-50/20 dark:bg-amber-900/10">
                <td className="px-4 py-2.5 font-medium text-amber-800 dark:text-amber-200">
                  🔧 {item.accessory?.name || item.accessoryId} <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal mr-1">(إكسسوار)</span>
                </td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.quantity}</td>
                <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{item.unitPrice.toFixed(2)}</td>
                <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-gray-100">{(item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* الملخص المالي */}
      <div className="card p-5 space-y-2 text-sm">
        <p className="font-bold text-gray-600 dark:text-gray-400 mb-3">الملخص المالي</p>
        <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-base border-t border-gray-100 dark:border-gray-700 pt-2"><span>الإجمالي</span><span>{inv.total.toFixed(2)} الجنيه</span></div>
        <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400"><span>مدفوع</span><span>{inv.paid.toFixed(2)} الجنيه</span></div>
        <div className={`flex justify-between font-black ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}><span>المتبقي</span><span>{remaining.toFixed(2)} الجنيه</span></div>
      </div>

      {inv.notes && (
        <div className="card p-5 text-sm"><p className="font-bold text-gray-600 dark:text-gray-400 mb-2">ملاحظات</p><p className="text-gray-700 dark:text-gray-300">{inv.notes}</p></div>
      )}
    </div>
  );
};