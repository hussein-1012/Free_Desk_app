import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Warehouse, Search, MoveHorizontal, ClipboardList,
  AlertTriangle, Wrench, Droplet, LayoutGrid
} from 'lucide-react';

type FilterKey = 'all' | 'low' | 'accessories' | 'oils';
type RowKind = 'product' | 'accessory' | 'oil';

interface InventoryRow {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  categoryLabel: string;
  kind: RowKind;
}

export const InventoryListPage: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      const res = await window.api.getProducts({ pageSize: 1000 });
      return res.success ? res.data.items : [];
    },
  });

  const { data: accessoriesData, isLoading: loadingAccessories } = useQuery({
    queryKey: ['inventory-accessories'],
    queryFn: async () => {
      const res = await window.api.getAccessories({ pageSize: 1000 });
      return res.success ? res.data.items : [];
    },
  });

  // نفس الـ endpoint اللي تستخدمه صفحة الزيوت نفسها (OilListPage) — بدون أي تكرار
  // أو نسخ بيانات، هي فقط قراءة مباشرة من نفس المصدر.
  const { data: oilsData, isLoading: loadingOils } = useQuery({
    queryKey: ['inventory-oils'],
    queryFn: async () => {
      const res = await window.api.getOilProducts({ pageSize: 1000 });
      return res.success ? res.data.items : [];
    },
  });

  const isLoading = loadingProducts || loadingAccessories || loadingOils;

  const rows: InventoryRow[] = useMemo(() => {
    // معرّفات المنتجات اللي هي أصلاً "منتج زيت" (عندها صف OilProduct) —
    // بنستبعدها من قائمة المنتجات العادية عشان ما تتكررش مع قائمة الزيوت.
    const oilProductIds = new Set((oilsData || []).map((o: any) => o.product?.id || o.productId));

    const productRows: InventoryRow[] = (productsData || [])
      .filter((p: any) => !oilProductIds.has(p.id))
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        minQuantity: p.minQuantity,
        categoryLabel: p.category?.name || 'عام',
        kind: 'product' as RowKind,
      }));

    const accessoryRows: InventoryRow[] = (accessoriesData || []).map((a: any) => ({
      id: a.id,
      name: a.name,
      quantity: a.quantity,
      minQuantity: a.minQuantity,
      categoryLabel: 'إكسسوار',
      kind: 'accessory' as RowKind,
    }));

    const oilRows: InventoryRow[] = (oilsData || []).map((o: any) => ({
      id: o.product?.id || o.id,
      name: o.product?.name || '—',
      quantity: o.product?.quantity ?? 0,
      minQuantity: o.product?.minQuantity ?? 0,
      categoryLabel: o.product?.category?.name || 'زيت',
      kind: 'oil' as RowKind,
    }));

    return [...productRows, ...accessoryRows, ...oilRows];
  }, [productsData, accessoriesData, oilsData]);

  const isLowStock = (r: InventoryRow) => r.quantity <= r.minQuantity;

  const filtered = useMemo(() => {
    let list = rows;

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((r) => r.name?.toLowerCase().includes(s));
    }

    switch (filter) {
      case 'low':
        return list.filter(isLowStock);
      case 'accessories':
        return list.filter((r) => r.kind === 'accessory');
      case 'oils':
        return list.filter((r) => r.kind === 'oil');
      default:
        return list;
    }
  }, [rows, search, filter]);

  const counts = useMemo(() => ({
    all: rows.length,
    low: rows.filter(isLowStock).length,
    accessories: rows.filter((r) => r.kind === 'accessory').length,
    oils: rows.filter((r) => r.kind === 'oil').length,
  }), [rows]);

  const filterTabs: { key: FilterKey; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: 'الكل', icon: LayoutGrid },
    { key: 'low', label: 'المنتجات الناقصة', icon: AlertTriangle },
    { key: 'accessories', label: 'الإكسسوارات', icon: Wrench },
    { key: 'oils', label: 'الزيوت', icon: Droplet },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-amber-500" />
            المخزون
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">عرض كميات المنتجات الحالية وحالة المخزون</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => navigate('/inventory/movements')} className="btn-secondary text-sm py-2">
            <MoveHorizontal className="w-4 h-4" />حركة المخزون
          </button>
          <button onClick={() => navigate('/inventory/count')} className="btn-primary text-sm py-2">
            <ClipboardList className="w-4 h-4" />جرد المخزون
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={active ? 'btn-primary text-xs py-1.5 px-3' : 'btn-secondary text-xs py-1.5 px-3'}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span className="opacity-70">({counts[tab.key]})</span>
              </button>
            );
          })}
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pr-10"
            placeholder="بحث باسم المنتج..."
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !filtered.length ? (
          <div className="py-16 text-center text-gray-400">
            <Warehouse className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">لا يوجد منتجات مطابقة</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">المنتج</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الفئة</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الكمية الحالية</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((r) => {
                const low = isLowStock(r);
                return (
                  <tr key={`${r.kind}-${r.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{r.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.categoryLabel}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{r.quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${low ? 'badge-danger' : 'badge-success'}`}>
                        {low ? 'منخفض' : 'متوفر'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};