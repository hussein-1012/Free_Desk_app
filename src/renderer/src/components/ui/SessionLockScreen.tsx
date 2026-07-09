import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface SessionLockScreenProps {
  userName: string;
  onUnlock: () => void;
}

export const SessionLockScreen: React.FC<SessionLockScreenProps> = ({ userName, onUnlock }) => {
  const user = useAuthStore((s) => s.user);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('أدخل كلمة المرور');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await window.api.login({ username: user?.username, password });
      if (resp.success) {
        setPassword('');
        onUnlock();
      } else {
        setError(resp.error || 'كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ. حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-900/90 backdrop-blur-md flex items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-modal p-8 w-full max-w-sm mx-4 animate-scale-in">
        {/* أيقونة القفل */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-900 flex items-center justify-center mb-3">
            <Lock className="w-8 h-8 text-accent-600 dark:text-accent-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            الجلسة مقفلة
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            مرحباً، <span className="font-semibold">{userName}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            أدخل كلمة المرور للمتابعة
          </p>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-10"
              placeholder="كلمة المرور"
              disabled={loading}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center"
          >
            {loading ? 'جارٍ التحقق...' : 'فتح الجلسة'}
          </button>
        </form>
      </div>
    </div>
  );
};
