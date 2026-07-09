import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, RefreshCw, Car } from 'lucide-react';
import { WASH_SERVICE_LABELS, WASH_STATUS_LABELS, WashOrderStatus, WashServiceType } from '@shared/types';

const STATUS_BADGE: Record<WashOrderStatus, string> = {
  received:  'badge-info',
  washing:   'badge-warning',
  ready:     'badge-success',
  delivered: 'badge-neutral',
  cancelled: 'badge-danger',
};

export const WashListPage: React.FC = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['wash-orders', search, statusFilter, page],
    queryFn: async () => {
      const resp = await window.api.getWashOrders({
        page,
        pageSize: 20,
        search: search || undefined,
        filters: statusFilter ? { status: statusFilter } : {},
      });
      return resp.success ? resp.data : { items: [], total: 0, totalPages: 1 };
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['wash-counts'],
    queryFn: async () => {
      const resp = await window.api.getWashCountByStatus();
      return resp.success ? resp.data : {};
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteWashOrder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wash-orders'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      window.api.updateWashOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wash-orders'] });
      qc.invalidateQueries({ queryKey: ['wash-counts'] });
    },
  });

  const statusOptions: { value: WashOrderStatus | ''; label: string }[] = [
    { value: '', label: 'جميع الحالات' },
    { value: 'received',  label: 'مستلم' },
    { value: 'washing',   label: 'جارٍ الغسيل' },
    { value: 'ready',     label: 'جاهز للتسليم' },
    { value: 'delivered', label: 'تم التسليم' },
    { value: 'cancelled', label: 'ملغى' },
  ];

  const nextStatus: Record<WashOrderStatus, WashOrderStatus | null> = {
    received:  'washing',
    washing:   'ready',
    ready:     'delivered',
    delivered: null,
    cancelled: null,
  };

  const nextStatusLabel: Record<string, string> = {
    received: 'بدء الغسيل',
    washing:  'جاهز للتسليم',
    ready:    'تم التسليم',
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-500" />
            طلبات الغسيل
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">غسيل السيارات والدراجات</p>
        </div>
        <button onClick={() => navigate('/wash/new')} className="btn-primary">
          <Plus className="w-4 h-4" />
          طلب غسيل جديد
        </button>
      </div>

      {/* شرائح الحالات */}
      {counts && (
        <div className="grid grid-cols-5 gap-2">
          {[
            { key: 'received',  label: 'مستلم',          color: 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { key: 'washing',   label: 'جارٍ الغسيل',    color: 'border-amber-400 text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            { key: 'ready',     label: 'جاهز',           color: 'border-emerald-400 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { key: 'delivered', label: 'تم التسليم',     color: 'border-gray-400 text-gray-600 bg-gray-50 dark:bg-gray-700' },
            { key: 'cancelled', label: 'ملغى',           color: 'border-red-400 text-red-600 bg-red-50 dark:bg-red-900/20' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(statusFilter === s.key ? '' : s.key)}
              className={`card p-3 text-center cursor-pointer border-2 transition-all ${
                statusFilter === s.key ? s.color : 'border-transparent'
              }`}
            >
              <p className="text-2xl font-black">{counts[s.key] || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* شريط البحث */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pr-10"
            placeholder="بحث برقم الطلب، اسم العميل، أو رقم اللوحة..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field w-40"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* الجدول */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data?.items?.length ? (
          <div className="py-16 text-center text-gray-400">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">لا يوجد طلبات غسيل</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم الطلب</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">العميل</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">نوع الخدمة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">رقم اللوحة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">السعر</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map((order: any) => {
                  const ns = nextStatus[order.status as WashOrderStatus];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-accent-600 dark:text-accent-400">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{order.customerName}</p>
                        {order.customerPhone && <p className="text-xs text-gray-500">{order.customerPhone}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {WASH_SERVICE_LABELS[order.serviceType as WashServiceType] || order.serviceType}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono">
                        {order.vehiclePlate || '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">
                        {order.price.toFixed(2)} الجنيه
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUS_BADGE[order.status as WashOrderStatus]}`}>
                          {WASH_STATUS_LABELS[order.status as WashOrderStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {ns && (
                            <button
                              onClick={() => statusMutation.mutate({ id: order.id, status: ns })}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 hover:bg-accent-100 transition-colors"
                              title={nextStatusLabel[order.status]}
                            >
                              <RefreshCw className="w-3 h-3" />
                              {nextStatusLabel[order.status]}
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/wash/${order.id}`)}
                            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا الطلب؟'))
                                  deleteMutation.mutate(order.id);
                              }}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* التصفح */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-500">
                  الصفحة {data.page} من {data.totalPages} — إجمالي {data.total} طلب
                </span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-3 text-xs">
                    السابق
                  </button>
                  <button disabled={page >= data.totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-3 text-xs">
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};