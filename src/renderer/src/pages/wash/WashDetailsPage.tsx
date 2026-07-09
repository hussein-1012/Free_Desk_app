import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Edit, Trash2, RefreshCw, Car, User, Phone, Hash, Calendar, Printer } from 'lucide-react';
import { WASH_SERVICE_LABELS, WASH_STATUS_LABELS, WashOrderStatus, WashServiceType } from '@shared/types';

const STATUS_STEPS: WashOrderStatus[] = ['received', 'washing', 'ready', 'delivered'];

const STATUS_COLOR: Record<WashOrderStatus, string> = {
  received:  'bg-blue-500',
  washing:   'bg-amber-500',
  ready:     'bg-emerald-500',
  delivered: 'bg-gray-400',
  cancelled: 'bg-red-500',
};

const nextStatus: Record<WashOrderStatus, WashOrderStatus | null> = {
  received:  'washing',
  washing:   'ready',
  ready:     'delivered',
  delivered: null,
  cancelled: null,
};

const nextLabel: Record<string, string> = {
  received: 'بدء الغسيل',
  washing:  'تحديد كجاهز',
  ready:    'تأكيد التسليم',
};

export const WashDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['wash-order', id],
    queryFn: async () => {
      const resp = await window.api.getWashOrderById(id!);
      return resp.success ? resp.data : null;
    },
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => window.api.updateWashOrderStatus(id!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wash-order', id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => window.api.deleteWashOrder(id!),
    onSuccess: () => navigate('/wash'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg font-semibold">الطلب غير موجود</p>
        <button onClick={() => navigate('/wash')} className="btn-secondary mt-4 mx-auto">
          العودة للقائمة
        </button>
      </div>
    );
  }

  const status = order.status as WashOrderStatus;
  const ns = nextStatus[status];
  const activeStep = STATUS_STEPS.indexOf(status);
  const remaining = order.price - order.paid;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/wash')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Car className="w-5 h-5 text-cyan-500" />
              طلب غسيل #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(order.receivedDate).toLocaleDateString('ar-EG', { dateStyle: 'full' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.api.printWindow(true)} className="btn-secondary py-2 px-3">
            <Printer className="w-4 h-4" />
          </button>
          {status !== 'delivered' && status !== 'cancelled' && (
            <>
              <button onClick={() => navigate(`/wash/${id}/edit`)} className="btn-secondary py-2 px-3">
                <Edit className="w-4 h-4" />
                تعديل
              </button>
              <button
                onClick={() => { if (confirm('هل تريد حذف هذا الطلب؟')) deleteMutation.mutate(); }}
                className="btn-danger py-2 px-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* خط سير الطلب (Pipeline) */}
      {status !== 'cancelled' && (
        <div className="card p-5">
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4">مراحل الطلب</p>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const isPast    = i < activeStep;
              const isCurrent = i === activeStep;


              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all
                      ${isCurrent ? STATUS_COLOR[status] + ' ring-4 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-current' :
                        isPast ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap
                      ${isCurrent ? 'text-gray-900 dark:text-gray-100' :
                        isPast ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {WASH_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isPast ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {ns && (
            <button
              onClick={() => statusMutation.mutate(ns)}
              disabled={statusMutation.isPending}
              className="btn-primary mt-4 w-full justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${statusMutation.isPending ? 'animate-spin' : ''}`} />
              {nextLabel[status]}
            </button>
          )}
        </div>
      )}

      {/* بيانات الطلب */}
      <div className="card p-5">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4">تفاصيل الطلب</p>
        <div className="space-y-3 text-sm">
          <Row icon={User} label="العميل" value={order.customerName} />
          {order.customerPhone && <Row icon={Phone} label="الهاتف" value={order.customerPhone} />}
          <Row icon={Car} label="نوع المركبة" value={order.vehicleType === 'car' ? '🚗 سيارة' : '🏍️ دراجة'} />
          {order.vehiclePlate && <Row icon={Hash} label="رقم اللوحة" value={<code className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{order.vehiclePlate}</code>} />}
          <Row icon={RefreshCw} label="نوع الخدمة" value={WASH_SERVICE_LABELS[order.serviceType as WashServiceType] || order.serviceType} />
          <Row icon={Calendar} label="تاريخ الاستلام" value={new Date(order.receivedDate).toLocaleDateString('ar-EG')} />
          {order.deliveryDate && (
            <Row icon={Calendar} label="تاريخ التسليم" value={new Date(order.deliveryDate).toLocaleDateString('ar-EG')} />
          )}
        </div>
      </div>

      {/* ملخص المالي */}
      <div className="card p-5">
        <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-4">الملخص المالي</p>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">قيمة الخدمة</span>
            <span className="font-bold">{order.price.toFixed(2)} الجنيه</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">المبلغ المدفوع</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{order.paid.toFixed(2)} الجنيه</span>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between">
            <span className="font-bold text-gray-800 dark:text-gray-200">المتبقي</span>
            <span className={`font-black text-lg ${remaining > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {remaining.toFixed(2)} الجنيه
            </span>
          </div>
        </div>
      </div>

      {/* الملاحظات */}
      {order.notes && (
        <div className="card p-5">
          <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">ملاحظات</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{order.notes}</p>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
  </div>
);