import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Customer } from '@shared/types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  customer?: Customer | null;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customer = null,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [odometerReading, setOdometerReading] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setCarNumber((customer as any).carNumber || '');
      setOdometerReading((customer as any).odometerReading ?? '');
    } else {
      setName('');
      setPhone('');
      setAddress('');
      setCarNumber('');
      setOdometerReading('');
    }
    setError(null);
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('الاسم مطلوب');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name,
      phone: phone || null,
      address: address || null,
      carNumber: carNumber || null,
      odometerReading: odometerReading === '' ? null : odometerReading,
    };

    try {
      let response;
      if (customer) {
        response = await window.api.updateCustomer(customer.id, payload);
      } else {
        response = await window.api.createCustomer(payload);
      }

      if (response.success) {
        onSave();
        onClose();
      } else {
        setError(response.error || 'فشل في حفظ بيانات العميل');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ بيانات العميل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-modal w-full max-w-md animate-scale-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <h2 className="font-black text-gray-900 dark:text-gray-100">{customer ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-5 space-y-3 overflow-y-auto">
            {error && <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">{error}</div>}

            <div>
              <label className="form-label">الاسم <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="اسم العميل" autoFocus disabled={loading} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">رقم الهاتف</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="05XXXXXXXX" disabled={loading} />
              </div>
              <div>
                <label className="form-label">رقم اللوحة</label>
                <input value={carNumber} onChange={e => setCarNumber(e.target.value)} className="input-field font-mono" placeholder="XXX-000" disabled={loading} />
              </div>
            </div>

            <div>
              <label className="form-label">العنوان</label>
              <input value={address} onChange={e => setAddress(e.target.value)} className="input-field" disabled={loading} />
            </div>

            <div>
              <label className="form-label">قراءة العداد (كم)</label>
              <input
                type="text"
                inputMode="numeric"
                value={odometerReading}
                onChange={e => {
                  // تحويل الأرقام العربية (٠-٩) لأرقام إنجليزية عادية، وحذف أي رمز غير رقمي
                  const normalized = e.target.value
                    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632))
                    .replace(/[^0-9]/g, '');
                  setOdometerReading(normalized === '' ? '' : +normalized);
                }}
                className="input-field"
                placeholder="أدخل قراءة العداد"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700 shrink-0">
            <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">إلغاء</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'جارٍ الحفظ...' : customer ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};