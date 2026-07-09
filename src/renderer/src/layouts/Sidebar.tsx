import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShoppingBag,
  ShoppingCart,
  Droplet,
  GlassWater,
  HandCoins,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { path: '/',            label: 'الرئيسية',    icon: LayoutDashboard, role: 'cashier' },
    { path: '/customers',   label: 'العملاء',     icon: Users,           role: 'cashier' },
    { path: '/suppliers',   label: 'الموردون',    icon: Building2,       role: 'manager' },
    { path: '/products',    label: 'المنتجات',    icon: Package,         role: 'manager' },
    { path: '/accessories', label: 'الإكسسوارات', icon: ShoppingBag,     role: 'manager' },
    { path: '/purchases',   label: 'المشتريات',   icon: ShoppingBag,     role: 'manager' },
    { path: '/sales',       label: 'المبيعات',    icon: ShoppingCart,    role: 'cashier' },
    { path: '/oil',         label: 'الزيوت',      icon: Droplet,         role: 'manager' },
    { path: '/wash',        label: 'الغسيل',      icon: GlassWater,      role: 'cashier' },
    { path: '/partners',    label: 'الشركاء',     icon: HandCoins,       role: 'admin'   },
    { path: '/inventory',   label: 'المخزون',     icon: ClipboardList,   role: 'manager' },
    { path: '/reports',     label: 'التقارير',    icon: BarChart3,       role: 'admin'   },
    { path: '/settings',    label: 'الإعدادات',   icon: Settings,        role: 'admin'   },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'manager' && item.role !== 'admin') return true;
    return item.role === 'cashier';
  });

  return (
    <aside
      className={`bg-dark-200 border-r border-slate-800 flex flex-col transition-all duration-350 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand logo */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
        <ShoppingCart className="h-8 w-8 text-primary-500 animate-pulse-soft" />
        {!collapsed && (
          <span className="ml-3 font-bold text-lg text-slate-100 tracking-wide select-none truncate">
            ERP System
          </span>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-glow-primary'
                    : 'text-slate-400 hover:bg-dark-100 hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="ml-3 truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        {!collapsed && user && (
          <div className="px-2">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3">تسجيل الخروج</span>}
        </button>
      </div>
    </aside>
  );
};
