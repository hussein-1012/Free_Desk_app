import { create } from 'zustand';
import { User } from '@shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (requiredRole: 'admin' | 'manager' | 'cashier') => boolean;
  isAdmin: () => boolean;
  isManager: () => boolean;
}

// تنظيف أي بيانات قديمة مخزنة في localStorage لضمان أمان الجلسة
localStorage.removeItem('shop_user');
localStorage.removeItem('shop_token');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(sessionStorage.getItem('shop_user') || 'null'),
  token: sessionStorage.getItem('shop_token'),
  isAuthenticated: !!sessionStorage.getItem('shop_token'),

  login: (user, token) => {
    sessionStorage.setItem('shop_user', JSON.stringify(user));
    sessionStorage.setItem('shop_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('shop_user');
    sessionStorage.removeItem('shop_token');
    window.api.logout().catch(console.error);
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasPermission: (requiredRole) => {
    const { user } = get();
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'manager' && requiredRole !== 'admin') return true;
    return user.role === requiredRole;
  },

  isAdmin: () => get().user?.role === 'admin',
  isManager: () => ['admin', 'manager'].includes(get().user?.role || ''),
}));
