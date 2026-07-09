import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Save, Loader2, User, Phone, Car, Search } from 'lucide-react';



const serviceTypes = [
  { value: 'bag_polish',        label: 'شنطة ومطور' },
  { value: 'interior_exterior', label: 'داخلي وخارجي' },
  { value: 'chemical_wash',     label: 'غسيل كيميائي' },
  { value: 'exterior_only',     label: 'خارجي فقط' },
  { value: 'vip',               label: 'VIP' },
  { value: 'bike_wash',         label: 'غسيل دراجة' },
];

interface FormData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleType: 'car' | 'bike';
  vehiclePlate: string;
  serviceType: string;
  price: number | '';
  paid: number | '';
  notes: string;
}

const initialForm: FormData = {
  customerId: '',
  customerName: '',
  customerPhone: '',
  vehicleType: 'car',
  vehiclePlate: '',
  serviceType: 'bag_polish',
  price: '',
  paid: '',
  notes: '',
};

export const WashFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>(initialForm);
  const [error, setError] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // جلب بيانات الطلب عند التعديل
  const { data: orderData } = useQuery({
    queryKey: ['wash-order', id],
    queryFn: async () => {
      if (!id) return null;
      const resp = await window.api.getWashOrderById(id);
      return resp.success ? resp.data : null;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (orderData) {
      setForm({
        customerId: orderData.customerId || '',
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone || '',
        vehicleType: orderData.vehicleType,
        vehiclePlate: orderData.vehiclePlate || '',
        serviceType: orderData.serviceType,
        price: orderData.price,
        paid: orderData.paid,
        notes: orderData.notes || '',
      });
    }
  }, [orderData]);

  // بحث العملاء
  const { data: customersData } = useQuery({
    queryKey: ['customers-search', customerSearch],
    queryFn: async () => {
      if (!customerSearch || customerSearch.length < 2) return { items: [] };
      const resp = await window.api.getCustomers({ search: customerSearch, pageSize: 8 });
      return resp.success ? resp.data : { items: [] };
    },
    enabled: customerSearch.length >= 2,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        price: Number(data.price) || 0,
        paid: Number(data.paid) || 0,
      };
      if (isEdit) {
        return window.api.updateWashOrder(id!, payload);
      }
      return window.api.createWashOrder(payload, user!.id);
    },
    onSuccess: (resp) => {
      if (resp.success) {
        qc.invalidateQueries({ queryKey: ['wash-orders'] });
        navigate('/wash');
      } else {
        setError(resp.error || 'حدث خطأ أثناء الحفظ');
      }
    },
  });

  const handleChange = (field: keyof FormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'price' | 'paid', raw: string) => {
    if (raw === '') {
      handleChange(field, '');
      return;
    }
    handleChange(field, Number(raw));
  };

  const priceValue = Number(form.price) || 0;
  const paidValue = Number(form.paid) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.customerName.trim()) { setError('اسم العميل مطلوب'); return; }
    if (!form.serviceType) { setError('نوع الخدمة مطلوب'); return; }
    if (priceValue <= 0) { setError('السعر يجب أن يكون أكبر من صفر'); return; }
    mutation.mutate(form);
  };

  const selectCustomer = (customer: any) => {
    setForm((prev) => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone || '',
      vehiclePlate: customer.carNumber || prev.vehiclePlate,
    }));
    setCustomerSearch('');
    setShowCustomerDropdown(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* رأس الصفحة */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/wash')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">
          {isEdit ? 'تعديل طلب الغسيل' : 'طلب غسيل جديد'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* بيانات العميل */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <User className="w-4 h-4 text-accent-500" />
            بيانات العميل
          </h2>

          {/* بحث العميل */}
          <div className="relative">
            <label className="form-label">العميل (اختياري)</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                className="input-field pr-10"
                placeholder="ابحث عن عميل موجود..."
              />
            </div>
            {showCustomerDropdown && customersData?.items?.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-card-hover overflow-hidden">
                {customersData.items.map((c: any) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCustomer(c)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-right transition-colors"
                  >
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.name}</span>
                    <span className="text-xs text-gray-500">{c.carNumber || c.phone || ''}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">اسم العميل <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                className="input-field"
                placeholder="اسم العميل"
                required
              />
            </div>
            <div>
              <label className="form-label">رقم الهاتف</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  className="input-field pr-10"
                  placeholder="05XXXXXXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* بيانات المركبة والخدمة */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Car className="w-4 h-4 text-accent-500" />
            المركبة والخدمة
          </h2>

          {/* نوع المركبة */}
          <div>
            <label className="form-label">نوع المركبة</label>
            <div className="flex gap-3">
              {[
                { value: 'car',  label: '🚗 سيارة' },
                { value: 'bike', label: '🏍️ دراجة' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    handleChange('vehicleType', opt.value);
                    if (opt.value === 'bike') handleChange('serviceType', 'bike_wash');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    form.vehicleType === opt.value
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">رقم اللوحة</label>
              <input
                type="text"
                value={form.vehiclePlate}
                onChange={(e) => handleChange('vehiclePlate', e.target.value)}
                className="input-field font-mono"
                placeholder="XXX-000"
              />
            </div>
            <div>
              <label className="form-label">نوع الخدمة <span className="text-red-500">*</span></label>
              <select
                value={form.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
                className="input-field"
              >
                {serviceTypes
                  .filter((s) => form.vehicleType === 'bike' ? s.value === 'bike_wash' : s.value !== 'bike_wash')
                  .map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* السعر والدفع */}
        <div className="card p-5 space-y-4">
          <h2 className="font-bold text-gray-800 dark:text-gray-200">السعر والدفع</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">السعر <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.5"
                value={form.price}
                onChange={(e) => handleNumberChange('price', e.target.value)}
                className="input-field"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="form-label">المبلغ المدفوع</label>
              <input
                type="number"
                min="0"
                max={priceValue || undefined}
                step="0.5"
                value={form.paid}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') { handleChange('paid', ''); return; }
                  handleChange('paid', Math.min(Number(raw), priceValue));
                }}
                className="input-field"
                placeholder="0.00"
              />
            </div>
          </div>
          {priceValue > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
              <span className="text-gray-600 dark:text-gray-400">المتبقي:</span>
              <span className={`font-bold ${priceValue - paidValue > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {(priceValue - paidValue).toFixed(2)} الجنيه
              </span>
            </div>
          )}
        </div>

        {/* ملاحظات */}
        <div className="card p-5">
          <label className="form-label">ملاحظات</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder="أي ملاحظات إضافية..."
          />
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/wash')} className="btn-secondary">
            إلغاء
          </button>
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> جارٍ الحفظ...</>
            ) : (
              <><Save className="w-4 h-4" /> {isEdit ? 'تحديث الطلب' : 'حفظ الطلب'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};