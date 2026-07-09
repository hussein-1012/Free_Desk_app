import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Droplets, Package } from 'lucide-react';
import { OilModal, SellingType } from './OilFormModal';

export const OilListPage: React.FC = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['oil-products', search, page, typeFilter],
    queryFn: async () => {
      const resp = await window.api.getOilProducts({
        page,
        pageSize: 20,
        search: search || undefined,
        filters: typeFilter ? { sellingType: typeFilter } : {},
      });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteOilProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['oil-products'] }),
  });

  const sellingTypeLabel = (t: SellingType) =>
    t === 'retail' ? 'تجزئة فقط' : t === 'wholesale' ? 'جملة فقط' : 'تجزئة وجملة';

  const sellingTypeBadgeClass = (t: SellingType) =>
    t === 'retail'
      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
      : t === 'wholesale'
      ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
      : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';

  return (
    <div className="space-y-5 animate-fade-in" dir="rtl">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            إدارة الزيوت
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">عرض وإضافة وتعديل منتجات الزيوت وأسعارها بالجنيه</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج زيت
        </button>
      </div>

      {/* فلاتر البحث */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-field pr-10 w-full"
            placeholder="ابحث باسم المنتج..."
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="input-field w-44"
        >
          <option value="">كل أنواع البيع</option>
          <option value="retail">تجزئة فقط</option>
          <option value="wholesale">جملة فقط</option>
          <option value="both">تجزئة وجملة</option>
        </select>
      </div>

      {/* الجدول */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400">
            <Droplets className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-base">لا يوجد منتجات زيوت</p>
            <p className="text-sm mt-1">اضغط على زر "إضافة منتج زيت" لإضافة منتج جديد</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">اسم المنتج</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الصنف / التصنيف</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">نوع البيع</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">سعر التجزئة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">سعر الجملة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">العلبة / الكرتون</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((oil: any) => (
                  <tr key={oil.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                          <Droplets className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {oil.product?.name || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 opacity-50" />
                        {oil.product?.category?.name || 'عام'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${sellingTypeBadgeClass(oil.sellingType)}`}>
                        {sellingTypeLabel(oil.sellingType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                      {oil.sellingType !== 'wholesale' ? (
                        <span>{(oil.retailPrice ?? 0).toFixed(2)} الجنيه</span>
                      ) : (
                        <span className="text-gray-400 text-xs">لا ينطبق</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-800 dark:text-gray-200">
                      {oil.sellingType !== 'retail' ? (
                        <span>{(oil.wholesalePrice ?? 0).toFixed(2)} الجنيه</span>
                      ) : (
                        <span className="text-gray-400 text-xs">لا ينطبق</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${(oil.product?.quantity ?? 0) <= (oil.product?.minQuantity ?? 0) ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                        {oil.product?.quantity ?? 0}
                      </span>
                      {(oil.product?.quantity ?? 0) <= (oil.product?.minQuantity ?? 0) && (
                        <span className="block text-xs text-red-400 font-semibold">مخزون منخفض!</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      <div>{oil.cartonUnitsCount ?? 12} علبة / كرتون</div>
                      <div>{oil.canCapacityLiters ?? 1} لتر / علبة</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setEditing(oil); setShowModal(true); }}
                          title="تعديل"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل تريد حذف "${oil.product?.name}"؟`))
                              deleteMutation.mutate(oil.id);
                          }}
                          title="حذف"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ترقيم الصفحات */}
            {(data.totalPages ?? 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-sm">
                <span className="text-gray-500">إجمالي {data.total} منتج</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                  >
                    السابق
                  </button>
                  <span className="py-1.5 px-3 text-xs text-gray-500">
                    {page} / {data.totalPages}
                  </span>
                  <button
                    disabled={page >= (data.totalPages ?? 1)}
                    onClick={() => setPage(p => p + 1)}
                    className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <OilModal
          item={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['oil-products'] });
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default OilListPage;
