import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { Sun, Moon, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SessionLockScreen } from '../components/ui/SessionLockScreen';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 دقيقة

export const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [locked, setLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // مزامنة الوضع الداكن مع عنصر html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // إعادة تعيين مؤقت النشاط عند أي تفاعل
  useEffect(() => {
    const resetTimer = () => setLastActivity(Date.now());
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    return () => events.forEach((e) => window.removeEventListener(e, resetTimer));
  }, []);

  // قفل الجلسة عند الخمول
  useEffect(() => {
    const check = setInterval(() => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        setLocked(true);
      }
    }, 60_000);
    return () => clearInterval(check);
  }, [lastActivity]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* شريط التنقل العلوي */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-5 shrink-0 shadow-sm">
        {/* اسم التطبيق */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              {t('app_name')}
            </span>
          </button>
        </div>

        {/* مسار التنقل (breadcrumb) */}
        <div className="flex-1 flex justify-center">
          <Breadcrumb />
        </div>

        {/* أدوات الشريط */}
        <div className="flex items-center gap-2">
          {/* مبدل الوضع */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* الإعدادات */}
          <button
            onClick={() => navigate('/settings')}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="الإعدادات"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          {/* معلومات المستخدم + تسجيل الخروج */}
          <div className="flex items-center gap-2 mr-1 pr-3 border-r border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-none">{user?.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {user?.role === 'admin' ? 'مدير' : user?.role === 'manager' ? 'مشرف' : 'كاشير'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* منطقة المحتوى */}
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-5">
        <Outlet />
      </main>

      {/* شاشة قفل الجلسة */}
      {locked && (
        <SessionLockScreen
          userName={user?.name || ''}
          onUnlock={() => {
            setLocked(false);
            setLastActivity(Date.now());
          }}
        />
      )}
    </div>
  );
};
