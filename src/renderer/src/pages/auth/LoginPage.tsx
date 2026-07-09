import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, User, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await window.api.login({ username, password });

      if (response.success && response.data) {
        const { user, token } = response.data;
        login(user, token);
        navigate('/');
      } else {
        setError(response.error || 'اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      {/* خلفية تأثير التدرج */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-50 via-transparent to-gray-100 dark:from-accent-900/20 dark:to-gray-900 pointer-events-none" />

      <div className="w-full max-w-sm relative animate-scale-in">
        <div className="card p-8">
          {/* شعار وعنوان */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-600 shadow-glow mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
              نظام إدارة المحل
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              نظام محلي مؤمّن — يعمل بدون إنترنت
            </p>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-scale-in">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-red-600 dark:text-red-400 leading-snug">{error}</span>
            </div>
          )}

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pr-10"
                  placeholder="أدخل اسم المستخدم"
                  disabled={loading}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="form-label">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10 pl-10"
                  placeholder="أدخل كلمة المرور"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ التحقق...</span>
                </>
              ) : (
                <span>دخول</span>
              )}
            </button>
          </form>

          {/* تلميح بيانات الدخول */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-400">
              بيانات الدخول الافتراضية:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-accent-600 dark:text-accent-400 font-mono">
                admin
              </code>{' '}
              /{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-accent-600 dark:text-accent-400 font-mono">
                admin123
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
