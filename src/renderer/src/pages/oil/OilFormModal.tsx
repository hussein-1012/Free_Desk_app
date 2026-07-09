import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, Droplets, Tag, Package, DollarSign, AlertCircle,
  ShoppingCart, Store, ArrowLeftRight, Award, Archive, Layers, Droplet, Coins
} from 'lucide-react';

export type SellingType = 'retail' | 'wholesale' | 'both';

export interface OilForm {
  productName: string;
  categoryId: string;
  quantity: number | '';
  minQuantity: number | '';
  cartonUnitsCount: number | '';
  canCapacityLiters: number | '';
  sellingType: SellingType;
  retailPrice: number | '';
  wholesalePrice: number | '';
  brand: string;
  oilType: string;
}

const emptyForm: OilForm = {
  productName: '',
  categoryId: '',
  quantity: '',
  minQuantity: '',
  cartonUnitsCount: '',
  canCapacityLiters: '',
  sellingType: 'retail',
  retailPrice: '',
  wholesalePrice: '',
  brand: '',
  oilType: '',
};

interface OilModalProps {
  item?: any;
  onClose: () => void;
  onSaved: () => void;
}

/* ─────────────────────────────────── */
/* مكوّن عنوان القسم */
/* ─────────────────────────────────── */
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color: string }> = ({ icon, title, color }) => (
  <div className={`flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700`}>
    <span className={`p-1.5 rounded-lg ${color}`}>{icon}</span>
    <p className="text-sm font-black text-gray-700 dark:text-gray-200">{title}</p>
  </div>
);

/* ─────────────────────────────────── */
/* المكوّن الرئيسي */
/* ─────────────────────────────────── */
export const OilModal: React.FC<OilModalProps> = ({ item, onClose, onSaved }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState<OilForm>(
    item
      ? {
        productName: item.product?.name || '',
        categoryId: item.product?.categoryId || '',
        quantity: item.product?.quantity ?? '',
        minQuantity: item.product?.minQuantity ?? '',
        cartonUnitsCount: item.cartonUnitsCount ?? '',
        canCapacityLiters: item.canCapacityLiters ?? '',
        sellingType: (item.sellingType as SellingType) || 'retail',
        retailPrice: item.retailPrice ?? '',
        wholesalePrice: item.wholesalePrice ?? '',
        brand: item.brand || '',
        oilType: item.oilType || '',
      }
      : emptyForm
  );
  const [error, setError] = useState('');
  const f = (field: keyof OilForm, val: any) => setForm(p => ({ ...p, [field]: val }));

  /* جلب الأصناف */
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const r = await window.api.getCategories();
      return r.success ? (r.data as any[]) : [];
    },
  });

  // تصفية الأصناف لتشمل الزيوت والسوائل فقط
  const oilCategories = categories.filter((c: any) =>
    c.name.includes('زيوت') || c.name.includes('سوائل')
  );

  /* التحقق من البيانات */
  const validate = (): string | null => {
    if (!form.productName.trim()) return 'اسم المنتج مطلوب';
    if (form.sellingType !== 'wholesale' && (form.retailPrice === '' || Number(form.retailPrice) < 0))
      return 'يجب إدخال سعر التجزئة';
    if (form.sellingType !== 'retail' && (form.wholesalePrice === '' || Number(form.wholesalePrice) < 0))
      return 'يجب إدخال سعر الجملة';
    return null;
  };

  /* الحفظ */
  const mutation = useMutation({
    mutationFn: async () => {
      const validationError = validate();
      if (validationError) throw new Error(validationError);

      const payload = {
        ...form,
        retailPrice: form.retailPrice === '' ? 0 : Number(form.retailPrice),
        wholesalePrice: form.wholesalePrice === '' ? 0 : Number(form.wholesalePrice),
        quantity: form.quantity === '' ? 0 : Number(form.quantity),
        minQuantity: form.minQuantity === '' ? 0 : Number(form.minQuantity),
        cartonUnitsCount: form.cartonUnitsCount === '' ? 1 : Number(form.cartonUnitsCount),
        canCapacityLiters: form.canCapacityLiters === '' ? 1 : Number(form.canCapacityLiters),
        categoryId: form.categoryId || null,
      };

      if (item) return window.api.updateOilProduct(item.id, payload);
      return window.api.createOilProduct(payload);
    },
    onSuccess: (resp: any) => {
      if (resp?.success) {
        qc.invalidateQueries({ queryKey: ['oil-products'] });
        onSaved();
      } else {
        setError(resp?.error || 'فشل في حفظ المنتج');
      }
    },
    onError: (err: any) => setError(err.message || 'حدث خطأ غير متوقع'),
  });

  const showRetail = form.sellingType === 'retail' || form.sellingType === 'both';
  const showWholesale = form.sellingType === 'wholesale' || form.sellingType === 'both';

  /* خيارات نوع البيع */
  const sellingOptions: { type: SellingType; label: string; icon: React.ReactNode; color: string }[] = [
    { type: 'retail', label: 'تجزئة', icon: <ShoppingCart className="w-3.5 h-3.5" />, color: 'bg-blue-500' },
    { type: 'both', label: 'الاثنان', icon: <ArrowLeftRight className="w-3.5 h-3.5" />, color: 'bg-purple-500' },
    { type: 'wholesale', label: 'جملة', icon: <Store className="w-3.5 h-3.5" />, color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in max-h-[92vh] flex flex-col" dir="rtl">

        {/* ══════════════════════════════════
            رأس النافذة
        ══════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-t-2xl shrink-0">
          {/* خلفية متدرجة */}
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-blue-500 opacity-90" />
          <div className="relative flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base leading-tight">
                  {item ? 'تعديل منتج زيت' : 'إضافة منتج زيت جديد'}
                </h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  {item ? 'تعديل بيانات المنتج الحالي' : 'أدخل بيانات المنتج الجديد'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════
            جسم النموذج
        ══════════════════════════════════ */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</span>
            </div>
          )}

          {/* ════ الصفين العلويين: بيانات + مخزون جنباً لجنب ════ */}
          <div className="grid grid-cols-2 gap-5">

            {/* ──── القسم 1: بيانات المنتج ──── */}
            <section className="space-y-3.5">
              <SectionHeader
                icon={<Tag className="w-3.5 h-3.5 text-blue-500" />}
                title="بيانات المنتج"
                color="bg-blue-50 dark:bg-blue-900/20"
              />

              {/* اسم المنتج */}
              <div>
                <label className="form-label">
                  اسم المنتج <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    autoFocus
                    value={form.productName}
                    onChange={e => f('productName', e.target.value)}
                    className="input-field pr-10"
                    placeholder="مثال: زيت موتول 5W-40..."
                  />
                  <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* العلامة التجارية */}
              <div>
                <label className="form-label">العلامة التجارية</label>
                <div className="relative">
                  <input
                    value={form.brand}
                    onChange={e => f('brand', e.target.value)}
                    className="input-field pr-10"
                    placeholder="موتول، شل، توتال..."
                  />
                  <Award className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </section>

            {/* ──── القسم 2: المخزون ──── */}
            <section className="space-y-3.5">
              <SectionHeader
                icon={<Package className="w-3.5 h-3.5 text-amber-500" />}
                title="بيانات المخزون"
                color="bg-amber-50 dark:bg-amber-900/20"
              />

              <div>
                <label className="form-label">الكمية الحالية</label>
                <div className="relative">
                  <input type="number" min="0"
                    value={form.quantity}
                    onChange={e => f('quantity', e.target.value === '' ? '' : +e.target.value)}
                    className="input-field pr-10 pl-14" placeholder="0" />
                  <Archive className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">علبة</span>
                </div>
              </div>

              <div>
                <label className="form-label">حد التنبيه</label>
                <div className="relative">
                  <input type="number" min="0"
                    value={form.minQuantity}
                    onChange={e => f('minQuantity', e.target.value === '' ? '' : +e.target.value)}
                    className="input-field pr-10 pl-14" placeholder="0" />
                  <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">علبة</span>
                </div>
              </div>
            </section>
          </div>

          {/* ════ علب الكرتون + سعة العلبة — صف كامل العرض ════ */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="form-label">علب الكرتون</label>
              <div className="relative">
                <input type="number" min="1"
                  value={form.cartonUnitsCount}
                  onChange={e => f('cartonUnitsCount', e.target.value === '' ? '' : +e.target.value)}
                  className="input-field pr-10 pl-14" placeholder="12" />
                <Layers className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">علبة</span>
              </div>
            </div>
            <div>
              <label className="form-label">سعة العلبة</label>
              <div className="relative">
                <input type="number" min="0" step="0.1"
                  value={form.canCapacityLiters}
                  onChange={e => f('canCapacityLiters', e.target.value === '' ? '' : +e.target.value)}
                  className="input-field pr-10 pl-10" placeholder="1" />
                <Droplet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">لتر</span>
              </div>
            </div>
          </div>

          {/* ════ نوع الزيت — صف كامل العرض ════ */}
          <section>
            <SectionHeader
              icon={<Tag className="w-3.5 h-3.5 text-indigo-500" />}
              title="نوع الزيت"
              color="bg-indigo-50 dark:bg-indigo-900/20"
            />
            {oilCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-2xl border border-gray-100 dark:border-gray-700 min-h-[56px] shadow-inner">
                {/* أزرار الأصناف بالاسم العربي */}
                {oilCategories.map((c: any) => {
                  const active = form.categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => f('categoryId', c.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${active
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.03] ring-2 ring-indigo-400/30'
                        : 'bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 hover:scale-[1.02]'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-indigo-400'}`} />
                      {c.name}
                    </button>
                  );
                })}
                {/* زر «أخرى» في النهاية بدلاً من بدون صنف */}
                <button
                  type="button"
                  onClick={() => f('categoryId', '')}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 ${form.categoryId === ''
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.03] ring-2 ring-indigo-400/30'
                    : 'bg-white dark:bg-gray-850 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 hover:scale-[1.02]'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${form.categoryId === '' ? 'bg-white' : 'bg-gray-400'}`} />
                  أخرى
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                لا توجد أنواع زيت
              </div>
            )}
            <p className="mt-1.5 text-xs text-indigo-500 font-bold">
              ✓ نوع الزيت المختار: {categories.find((c: any) => c.id === form.categoryId)?.name || 'أخرى'}
            </p>
          </section>

          {/* ──── القسم 3: الأسعار ──── */}
          <section>
            <SectionHeader
              icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
              title="الأسعار"
              color="bg-emerald-50 dark:bg-emerald-900/20"
            />

            {/* نوع البيع — أزرار toggle مرئية */}
            <div className="p-1 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-100 dark:border-gray-700/60 flex gap-1 mb-4">
              {sellingOptions.map(({ type, label, icon, color }) => {
                const active = form.sellingType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => f('sellingType', type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${active
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-850/40'
                      }`}
                  >
                    <span className={`p-1 rounded-md transition-colors ${active ? `${color} text-white` : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                      {icon}
                    </span>
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {showRetail && (
                <div className={!showWholesale ? 'col-span-2' : ''}>
                  <label className="form-label flex items-center gap-1">
                    <ShoppingCart className="w-3 h-3 text-blue-500" />
                    سعر التجزئة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" min="0" step="0.5"
                      value={form.retailPrice}
                      onChange={e => f('retailPrice', e.target.value === '' ? '' : +e.target.value)}
                      className="input-field pr-10 pl-16"
                      placeholder="0.00"
                    />
                    <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">
                      الجنيه
                    </span>
                  </div>
                </div>
              )}
              {showWholesale && (
                <div className={!showRetail ? 'col-span-2' : ''}>
                  <label className="form-label flex items-center gap-1">
                    <Store className="w-3 h-3 text-emerald-500" />
                    سعر الجملة <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number" min="0" step="0.5"
                      value={form.wholesalePrice}
                      onChange={e => f('wholesalePrice', e.target.value === '' ? '' : +e.target.value)}
                      className="input-field pr-10 pl-16"
                      placeholder="0.00"
                    />
                    <Coins className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">
                      الجنيه
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ══════════════════════════════════
            أزرار الحفظ
        ══════════════════════════════════ */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60 rounded-b-2xl shrink-0">
          <button onClick={onClose} className="btn-secondary" disabled={mutation.isPending}>
            إلغاء
          </button>
          <button
            onClick={() => { setError(''); mutation.mutate(); }}
            disabled={mutation.isPending}
            className="btn-primary min-w-[130px] justify-center"
          >
            {mutation.isPending
              ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> جارٍ الحفظ...</>
              : item ? '✓ حفظ التعديلات' : '+ إضافة المنتج'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default OilModal;
