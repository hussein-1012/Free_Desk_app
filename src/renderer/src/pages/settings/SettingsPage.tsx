// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { Settings, Save, Store, Printer, Users, Database, Check, Loader2, RotateCcw } from 'lucide-react';
// import { useAuthStore } from '../../store/authStore';

// const TABS = [
//   { id: 'business', label: 'معلومات المؤسسة',  icon: Store },
//   { id: 'system',   label: 'إعدادات النظام',   icon: Settings },
//   { id: 'printer',  label: 'الطابعة',          icon: Printer },
//   { id: 'users',    label: 'المستخدمون',       icon: Users },
//   { id: 'backup',   label: 'النسخ الاحتياطي',  icon: Database },
// ];

// export const SettingsPage: React.FC = () => {
//   const qc = useQueryClient();
//   const { isAdmin } = useAuthStore();
//   const [activeTab, setActiveTab] = useState('business');
//   const [saved, setSaved] = useState(false);
//   const [backupMsg, setBackupMsg] = useState('');

//   // ---- الإعدادات ----
//   // Backend returns Record<string, string> directly (not an array)
//   const { data: settings = {} } = useQuery({
//     queryKey: ['settings'],
//     queryFn: async () => {
//       const resp = await window.api.getSettings();
//       if (!resp.success || !resp.data) return {};
//       // data is already Record<string, string>
//       return resp.data as Record<string, string>;
//     },
//   });

//   const [form, setForm] = useState<Record<string, string>>({});
//   React.useEffect(() => { if (settings) setForm(settings as Record<string, string>); }, [settings]);

//   const f = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }));
//   const get = (key: string, def = '') => form[key] ?? (settings as any)[key] ?? def;

//   const saveMutation = useMutation({
//     mutationFn: () => window.api.updateSettings(form),
//     onSuccess: () => {
//       qc.invalidateQueries({ queryKey: ['settings'] });
//       setSaved(true);
//       setTimeout(() => setSaved(false), 2500);
//     },
//   });

//   const backupMutation = useMutation({
//     mutationFn: () => window.api.createBackup(),
//     onSuccess: (r: any) => {
//       setBackupMsg(r.success ? 'تم إنشاء النسخة الاحتياطية بنجاح ✓' : (r.error || 'فشل في إنشاء النسخة'));
//       setTimeout(() => setBackupMsg(''), 4000);
//     },
//   });

//   const restoreMutation = useMutation({
//     mutationFn: () => window.api.restoreBackup(),
//     onSuccess: (r: any) => {
//       setBackupMsg(r.success ? 'تمت الاستعادة بنجاح ✓' : (r.error || 'فشل في الاستعادة'));
//       setTimeout(() => setBackupMsg(''), 4000);
//     },
//   });

//   // ---- المستخدمون ----
//   const { data: users = [] } = useQuery({
//     queryKey: ['users'],
//     queryFn: async () => { const r = await window.api.getUsers(); return r.success ? r.data : []; },
//     enabled: activeTab === 'users',
//   });

//   const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'cashier' });
//   const createUserMutation = useMutation({
//     mutationFn: () => window.api.createUser(newUser),
//     onSuccess: (r: any) => {
//       if (r.success) { qc.invalidateQueries({ queryKey: ['users'] }); setNewUser({ username: '', password: '', name: '', role: 'cashier' }); }
//     },
//   });

//   const toggleUserMutation = useMutation({
//     mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
//       window.api.updateUser(id, { isActive }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
//   });

//   const visibleTabs = TABS.filter(t => t.id !== 'users' || isAdmin());

//   return (
//     <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
//       <div className="flex items-center justify-between">
//         <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
//           <Settings className="w-5 h-5 text-gray-500" />
//           الإعدادات
//         </h1>
//         {activeTab !== 'backup' && activeTab !== 'users' && (
//           <button
//             onClick={() => saveMutation.mutate()}
//             disabled={saveMutation.isPending || saved}
//             className="btn-primary"
//           >
//             {saved ? <><Check className="w-4 h-4" />تم الحفظ</> : saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-4 h-4" />حفظ الإعدادات</>}
//           </button>
//         )}
//       </div>

//       <div className="flex gap-4">
//         {/* قائمة التبويبات */}
//         <div className="w-44 shrink-0 space-y-1">
//           {visibleTabs.map(tab => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
//                   activeTab === tab.id
//                     ? 'bg-accent-600 text-white shadow-sm'
//                     : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
//                 }`}
//               >
//                 <Icon className="w-4 h-4 shrink-0" />
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* محتوى التبويب */}
//         <div className="flex-1 card p-5 space-y-4">
//           {/* معلومات المؤسسة */}
//           {activeTab === 'business' && (
//             <>
//               <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">معلومات المؤسسة</p>
//               <div>
//                 <label className="form-label">اسم المؤسسة</label>
//                 <input value={get('business_name')} onChange={e => f('business_name', e.target.value)} className="input-field" placeholder="اسم المحل أو الشركة" />
//               </div>
//               <div>
//                 <label className="form-label">العنوان</label>
//                 <input value={get('business_address')} onChange={e => f('business_address', e.target.value)} className="input-field" placeholder="عنوان المؤسسة" />
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="form-label">رقم الهاتف</label>
//                   <input value={get('business_phone')} onChange={e => f('business_phone', e.target.value)} className="input-field" placeholder="05XXXXXXXX" />
//                 </div>
//                 <div>
//                   <label className="form-label">البريد الإلكتروني</label>
//                   <input type="email" value={get('business_email')} onChange={e => f('business_email', e.target.value)} className="input-field" placeholder="example@mail.com" />
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="form-label">نسبة الضريبة %</label>
//                   <input type="number" min="0" max="100" value={get('tax_percentage', '15')} onChange={e => f('tax_percentage', e.target.value)} className="input-field" />
//                 </div>
//                 <div>
//                   <label className="form-label">رمز العملة</label>
//                   <input value={get('currency', 'الجنيه')} onChange={e => f('currency', e.target.value)} className="input-field" placeholder="الجنيه" />
//                 </div>
//               </div>
//             </>
//           )}

//           {/* إعدادات النظام */}
//           {activeTab === 'system' && (
//             <>
//               <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">إعدادات النظام</p>
//               <div>
//                 <label className="form-label">مهلة قفل الشاشة (بالدقائق)</label>
//                 <input type="number" min="1" max="480" value={get('session_timeout_minutes', '30')} onChange={e => f('session_timeout_minutes', e.target.value)} className="input-field w-32" />
//                 <p className="text-xs text-gray-400 mt-1">سيتم قفل الشاشة تلقائياً بعد هذه المدة من الخمول</p>
//               </div>
//               <div>
//                 <label className="form-label">قالب الفاتورة</label>
//                 <select value={get('invoice_template', 'standard')} onChange={e => f('invoice_template', e.target.value)} className="input-field w-48">
//                   <option value="standard">قياسي</option>
//                   <option value="compact">مضغوط</option>
//                   <option value="detailed">تفصيلي</option>
//                 </select>
//               </div>
//             </>
//           )}

//           {/* إعدادات الطابعة */}
//           {activeTab === 'printer' && (
//             <>
//               <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">إعدادات الطابعة الحرارية</p>
//               <div>
//                 <label className="form-label">اسم الطابعة</label>
//                 <input value={get('receipt_printer_name', 'Default')} onChange={e => f('receipt_printer_name', e.target.value)} className="input-field" placeholder="اسم الطابعة في النظام" />
//               </div>
//               <div>
//                 <label className="form-label">عرض الإيصال</label>
//                 <div className="flex gap-3">
//                   {['58', '80'].map(w => (
//                     <button
//                       key={w}
//                       type="button"
//                       onClick={() => f('receipt_printer_width', w)}
//                       className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
//                         get('receipt_printer_width', '80') === w
//                           ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
//                           : 'border-gray-200 dark:border-gray-600 text-gray-600'
//                       }`}
//                     >
//                       {w} ملم
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}

//           {/* المستخدمون (للمدير فقط) */}
//           {activeTab === 'users' && isAdmin() && (
//             <>
//               <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">إدارة المستخدمين</p>
//               <div className="space-y-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
//                 <p className="text-xs font-bold text-gray-600 dark:text-gray-400">إضافة مستخدم جديد</p>
//                 <div className="grid grid-cols-2 gap-2">
//                   <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="input-field text-xs" placeholder="الاسم الكامل" />
//                   <input value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} className="input-field text-xs" placeholder="اسم المستخدم" />
//                   <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="input-field text-xs" placeholder="كلمة المرور" />
//                   <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} className="input-field text-xs">
//                     <option value="cashier">كاشير</option>
//                     <option value="manager">مشرف</option>
//                     <option value="admin">مدير</option>
//                   </select>
//                 </div>
//                 <button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending} className="btn-primary text-xs py-2">
//                   <Users className="w-3.5 h-3.5" />إضافة مستخدم
//                 </button>
//               </div>
//               <div className="space-y-2">
//                 {(users as any[]).map((u: any) => (
//                   <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
//                     <div>
//                       <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
//                       <p className="text-xs text-gray-500">{u.username} · {u.role === 'admin' ? 'مدير' : u.role === 'manager' ? 'مشرف' : 'كاشير'}</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className={`badge ${u.isActive ? 'badge-success' : 'badge-neutral'}`}>{u.isActive ? 'نشط' : 'موقوف'}</span>
//                       <button
//                         onClick={() => toggleUserMutation.mutate({ id: u.id, isActive: !u.isActive })}
//                         disabled={toggleUserMutation.isPending}
//                         className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
//                           u.isActive
//                             ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
//                             : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
//                         }`}
//                       >
//                         {u.isActive ? 'إيقاف' : 'تفعيل'}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}

//           {/* النسخ الاحتياطي */}
//           {activeTab === 'backup' && (
//             <>
//               <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">النسخ الاحتياطي والاستعادة</p>

//               {backupMsg && (
//                 <div className={`p-3 rounded-xl text-sm font-medium ${backupMsg.includes('✓') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'}`}>
//                   {backupMsg}
//                 </div>
//               )}

//               <div className="space-y-3">
//                 {/* إنشاء نسخة احتياطية */}
//                 <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
//                   <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">إنشاء نسخة احتياطية</p>
//                   <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">حفظ نسخة من قاعدة البيانات الحالية كملف SQLite</p>
//                   <button
//                     onClick={() => backupMutation.mutate()}
//                     disabled={backupMutation.isPending || restoreMutation.isPending}
//                     className="btn-primary text-xs py-2"
//                   >
//                     <Database className="w-3.5 h-3.5" />
//                     {backupMutation.isPending ? 'جارٍ الإنشاء...' : 'إنشاء نسخة احتياطية الآن'}
//                   </button>
//                 </div>

//                 {/* استعادة نسخة احتياطية */}
//                 <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
//                   <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">استعادة نسخة احتياطية</p>
//                   <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
//                     ⚠️ سيتم استبدال جميع البيانات الحالية بالنسخة المختارة — لا يمكن التراجع عن هذه العملية
//                   </p>
//                   <button
//                     onClick={() => restoreMutation.mutate()}
//                     disabled={backupMutation.isPending || restoreMutation.isPending}
//                     className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white transition-colors"
//                   >
//                     {restoreMutation.isPending
//                       ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />جارٍ الاستعادة...</>
//                       : <><RotateCcw className="w-3.5 h-3.5" />استعادة نسخة احتياطية</>}
//                   </button>
//                 </div>

//                 <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
//                   <p className="font-semibold mb-1">💡 نصيحة:</p>
//                   <p>قم بإنشاء نسخة احتياطية يومية وحفظها في مكان آمن (قرص خارجي أو تخزين سحابي) لضمان سلامة بياناتك.</p>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Store, Printer, Users, Database, Check, Loader2, RotateCcw, Pencil, Trash2, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const TABS = [
  { id: 'business', label: 'معلومات المؤسسة',  icon: Store },
  { id: 'system',   label: 'إعدادات النظام',   icon: Settings },
  { id: 'printer',  label: 'الطابعة',          icon: Printer },
  { id: 'users',    label: 'المستخدمون',       icon: Users },
  { id: 'backup',   label: 'النسخ الاحتياطي',  icon: Database },
];

interface EditUserForm {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  password: string;
}

const emptyEditForm = (): EditUserForm => ({
  name: '', username: '', email: '', phone: '', role: 'cashier', isActive: true, password: '',
});

export const SettingsPage: React.FC = () => {
  const qc = useQueryClient();
  const { isAdmin } = useAuthStore();
  const [activeTab, setActiveTab] = useState('business');
  const [saved, setSaved] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  // ---- الإعدادات ----
  // Backend returns Record<string, string> directly (not an array)
  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const resp = await window.api.getSettings();
      if (!resp.success || !resp.data) return {};
      // data is already Record<string, string>
      return resp.data as Record<string, string>;
    },
  });

  const [form, setForm] = useState<Record<string, string>>({});
  React.useEffect(() => { if (settings) setForm(settings as Record<string, string>); }, [settings]);

  const f = (key: string, value: string) => setForm(p => ({ ...p, [key]: value }));
  const get = (key: string, def = '') => form[key] ?? (settings as any)[key] ?? def;

  const saveMutation = useMutation({
    mutationFn: () => window.api.updateSettings(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const backupMutation = useMutation({
    mutationFn: () => window.api.createBackup(),
    onSuccess: (r: any) => {
      setBackupMsg(r.success ? 'تم إنشاء النسخة الاحتياطية بنجاح ✓' : (r.error || 'فشل في إنشاء النسخة'));
      setTimeout(() => setBackupMsg(''), 4000);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => window.api.restoreBackup(),
    onSuccess: (r: any) => {
      setBackupMsg(r.success ? 'تمت الاستعادة بنجاح ✓' : (r.error || 'فشل في الاستعادة'));
      setTimeout(() => setBackupMsg(''), 4000);
    },
  });

  // ---- المستخدمون ----
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => { const r = await window.api.getUsers(); return r.success ? r.data : []; },
    enabled: activeTab === 'users',
  });

  const [usersMsg, setUsersMsg] = useState('');

  const [newUser, setNewUser] = useState({ username: '', password: '', name: '', role: 'cashier' });
  const createUserMutation = useMutation({
    mutationFn: () => window.api.createUser(newUser),
    onSuccess: (r: any) => {
      if (r.success) { qc.invalidateQueries({ queryKey: ['users'] }); setNewUser({ username: '', password: '', name: '', role: 'cashier' }); }
    },
  });

  // مطفّى/مُفعّل + التعديل الكامل لبيانات المستخدم يستخدمان نفس نقطة التحديث
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => window.api.updateUser(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => window.api.deleteUser(id),
    onSuccess: (r: any) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      if (r && r.success === false) {
        // مثال: فشل الحذف لوجود سجلات مرتبطة (فواتير، مرتجعات...)
        setUsersMsg(r.error || 'تعذر حذف المستخدم لارتباطه بسجلات أخرى في النظام');
        setTimeout(() => setUsersMsg(''), 4500);
      }
    },
    onError: (err: any) => {
      setUsersMsg(err?.message || 'حدث خطأ غير متوقع أثناء حذف المستخدم');
      setTimeout(() => setUsersMsg(''), 4500);
    },
  });

  // ---- نافذة تعديل المستخدم ----
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>(emptyEditForm());
  const [editError, setEditError] = useState('');

  const openEditUser = (u: any) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'cashier',
      isActive: !!u.isActive,
      password: '',
    });
    setEditError('');
  };

  const closeEditUser = () => {
    setEditingUser(null);
    setEditForm(emptyEditForm());
    setEditError('');
  };

  const handleSaveEdit = () => {
    setEditError('');
    if (!editForm.name.trim()) { setEditError('يرجى إدخال الاسم الكامل'); return; }
    if (!editForm.username.trim()) { setEditError('يرجى إدخال اسم المستخدم'); return; }
    if (editForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email.trim())) {
      setEditError('صيغة البريد الإلكتروني غير صحيحة'); return;
    }
    if (editForm.password && editForm.password.length < 4) {
      setEditError('كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل'); return;
    }
    if (!editingUser) return;

    const payload: any = {
      name: editForm.name.trim(),
      username: editForm.username.trim(),
      email: editForm.email.trim() || null,
      phone: editForm.phone.trim() || null,
      role: editForm.role,
      isActive: editForm.isActive,
    };
    if (editForm.password) payload.password = editForm.password;

    updateUserMutation.mutate({ id: editingUser.id, data: payload }, {
      onSuccess: (r: any) => {
        if (r && r.success === false) { setEditError(r.error || 'فشل في حفظ تعديلات المستخدم'); return; }
        closeEditUser();
      },
      onError: (err: any) => {
        setEditError(err?.message || 'حدث خطأ غير متوقع أثناء حفظ التعديلات');
      },
    });
  };

  const handleDeleteUser = (u: any) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${u.name}"؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    deleteUserMutation.mutate(u.id);
  };

  const visibleTabs = TABS.filter(t => t.id !== 'users' || isAdmin());

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          الإعدادات
        </h1>
        {activeTab !== 'backup' && activeTab !== 'users' && (
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || saved}
            className="btn-primary"
          >
            {saved ? <><Check className="w-4 h-4" />تم الحفظ</> : saveMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />جارٍ الحفظ...</> : <><Save className="w-4 h-4" />حفظ الإعدادات</>}
          </button>
        )}
      </div>

      <div className="flex gap-4">
        {/* قائمة التبويبات */}
        <div className="w-44 shrink-0 space-y-1">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* محتوى التبويب */}
        <div className="flex-1 card p-5 space-y-4">
          {/* معلومات المؤسسة */}
          {activeTab === 'business' && (
            <>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">معلومات المؤسسة</p>
              <div>
                <label className="form-label">اسم المؤسسة</label>
                <input value={get('business_name')} onChange={e => f('business_name', e.target.value)} className="input-field" placeholder="اسم المحل أو الشركة" />
              </div>
              <div>
                <label className="form-label">العنوان</label>
                <input value={get('business_address')} onChange={e => f('business_address', e.target.value)} className="input-field" placeholder="عنوان المؤسسة" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">رقم الهاتف</label>
                  <input value={get('business_phone')} onChange={e => f('business_phone', e.target.value)} className="input-field" placeholder="05XXXXXXXX" />
                </div>
                <div>
                  <label className="form-label">البريد الإلكتروني</label>
                  <input type="email" value={get('business_email')} onChange={e => f('business_email', e.target.value)} className="input-field" placeholder="example@mail.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">نسبة الضريبة %</label>
                  <input type="number" min="0" max="100" value={get('tax_percentage', '15')} onChange={e => f('tax_percentage', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="form-label">رمز العملة</label>
                  <input value={get('currency', 'الجنيه')} onChange={e => f('currency', e.target.value)} className="input-field" placeholder="الجنيه" />
                </div>
              </div>
            </>
          )}

          {/* إعدادات النظام */}
          {activeTab === 'system' && (
            <>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">إعدادات النظام</p>
              <div>
                <label className="form-label">مهلة قفل الشاشة (بالدقائق)</label>
                <input type="number" min="1" max="480" value={get('session_timeout_minutes', '30')} onChange={e => f('session_timeout_minutes', e.target.value)} className="input-field w-32" />
                <p className="text-xs text-gray-400 mt-1">سيتم قفل الشاشة تلقائياً بعد هذه المدة من الخمول</p>
              </div>
              <div>
                <label className="form-label">قالب الفاتورة</label>
                <select value={get('invoice_template', 'standard')} onChange={e => f('invoice_template', e.target.value)} className="input-field w-48">
                  <option value="standard">قياسي</option>
                  <option value="compact">مضغوط</option>
                  <option value="detailed">تفصيلي</option>
                </select>
              </div>
            </>
          )}

          {/* إعدادات الطابعة */}
          {activeTab === 'printer' && (
            <>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">إعدادات الطابعة الحرارية</p>
              <div>
                <label className="form-label">اسم الطابعة</label>
                <input value={get('receipt_printer_name', 'Default')} onChange={e => f('receipt_printer_name', e.target.value)} className="input-field" placeholder="اسم الطابعة في النظام" />
              </div>
              <div>
                <label className="form-label">عرض الإيصال</label>
                <div className="flex gap-3">
                  {['58', '80'].map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => f('receipt_printer_width', w)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        get('receipt_printer_width', '80') === w
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600'
                      }`}
                    >
                      {w} ملم
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* المستخدمون (للمدير فقط) */}
          {activeTab === 'users' && isAdmin() && (
            <>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">إدارة المستخدمين</p>

              {usersMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                  {usersMsg}
                </div>
              )}

              <div className="space-y-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <p className="text-xs font-bold text-gray-600 dark:text-gray-400">إضافة مستخدم جديد</p>
                <div className="grid grid-cols-2 gap-2">
                  <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="input-field text-xs" placeholder="الاسم الكامل" />
                  <input value={newUser.username} onChange={e => setNewUser(p => ({ ...p, username: e.target.value }))} className="input-field text-xs" placeholder="اسم المستخدم" />
                  <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="input-field text-xs" placeholder="كلمة المرور" />
                  <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} className="input-field text-xs">
                    <option value="cashier">كاشير</option>
                    <option value="manager">مشرف</option>
                    <option value="admin">مدير</option>
                  </select>
                </div>
                <button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending} className="btn-primary text-xs py-2">
                  <Users className="w-3.5 h-3.5" />إضافة مستخدم
                </button>
              </div>
              <div className="space-y-2">
                {(users as any[]).map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.username} · {u.role === 'admin' ? 'مدير' : u.role === 'manager' ? 'مشرف' : 'كاشير'}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-neutral'}`}>{u.isActive ? 'نشط' : 'موقوف'}</span>
                      <button
                        onClick={() => updateUserMutation.mutate({ id: u.id, data: { isActive: !u.isActive } })}
                        disabled={updateUserMutation.isPending}
                        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                          u.isActive
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        {u.isActive ? 'إيقاف' : 'تفعيل'}
                      </button>
                      <button
                        onClick={() => openEditUser(u)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="تعديل المستخدم"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={deleteUserMutation.isPending}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="حذف المستخدم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* النسخ الاحتياطي */}
          {activeTab === 'backup' && (
            <>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-2">النسخ الاحتياطي والاستعادة</p>

              {backupMsg && (
                <div className={`p-3 rounded-xl text-sm font-medium ${backupMsg.includes('✓') ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'}`}>
                  {backupMsg}
                </div>
              )}

              <div className="space-y-3">
                {/* إنشاء نسخة احتياطية */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1">إنشاء نسخة احتياطية</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-3">حفظ نسخة من قاعدة البيانات الحالية كملف SQLite</p>
                  <button
                    onClick={() => backupMutation.mutate()}
                    disabled={backupMutation.isPending || restoreMutation.isPending}
                    className="btn-primary text-xs py-2"
                  >
                    <Database className="w-3.5 h-3.5" />
                    {backupMutation.isPending ? 'جارٍ الإنشاء...' : 'إنشاء نسخة احتياطية الآن'}
                  </button>
                </div>

                {/* استعادة نسخة احتياطية */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">استعادة نسخة احتياطية</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
                    ⚠️ سيتم استبدال جميع البيانات الحالية بالنسخة المختارة — لا يمكن التراجع عن هذه العملية
                  </p>
                  <button
                    onClick={() => restoreMutation.mutate()}
                    disabled={backupMutation.isPending || restoreMutation.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white transition-colors"
                  >
                    {restoreMutation.isPending
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />جارٍ الاستعادة...</>
                      : <><RotateCcw className="w-3.5 h-3.5" />استعادة نسخة احتياطية</>}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-semibold mb-1">💡 نصيحة:</p>
                  <p>قم بإنشاء نسخة احتياطية يومية وحفظها في مكان آمن (قرص خارجي أو تخزين سحابي) لضمان سلامة بياناتك.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* نافذة تعديل بيانات المستخدم */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeEditUser}>
          <div className="card w-full max-w-md p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">تعديل بيانات المستخدم</p>
              <button onClick={closeEditUser} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label text-xs">الاسم الكامل</label>
                <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="input-field text-xs" />
              </div>
              <div>
                <label className="form-label text-xs">اسم المستخدم</label>
                <input value={editForm.username} onChange={e => setEditForm(p => ({ ...p, username: e.target.value }))} className="input-field text-xs" />
              </div>
              <div>
                <label className="form-label text-xs">الدور</label>
                <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))} className="input-field text-xs">
                  <option value="cashier">كاشير</option>
                  <option value="manager">مشرف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div>
                <label className="form-label text-xs">البريد الإلكتروني (اختياري)</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="input-field text-xs" placeholder="example@mail.com" />
              </div>
              <div>
                <label className="form-label text-xs">رقم الهاتف (اختياري)</label>
                <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="input-field text-xs" placeholder="05XXXXXXXX" />
              </div>
              <div className="col-span-2">
                <label className="form-label text-xs">كلمة مرور جديدة (اتركها فارغة لعدم التغيير)</label>
                <input type="password" value={editForm.password} onChange={e => setEditForm(p => ({ ...p, password: e.target.value }))} className="input-field text-xs" placeholder="••••••" />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <input
                  id="edit-user-active"
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="edit-user-active" className="text-xs font-semibold text-gray-600 dark:text-gray-400">حساب نشط</label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button onClick={closeEditUser} className="btn-secondary text-xs py-2 px-3">إلغاء</button>
              <button onClick={handleSaveEdit} disabled={updateUserMutation.isPending} className="btn-primary text-xs py-2 px-3">
                {updateUserMutation.isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />جارٍ الحفظ...</>
                  : <><Save className="w-3.5 h-3.5" />حفظ التعديلات</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};