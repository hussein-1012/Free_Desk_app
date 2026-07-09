import React, { useState, useEffect } from 'react';
import { Users, ArrowLeftRight, Landmark, Wallet, Users2, Plus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export const PartnerListPage: React.FC = () => {

  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCapital, setTotalCapital] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);

  // Modals
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isDistributeOpen, setIsDistributeOpen] = useState(false);

  // Form states
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState('rent');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [withdrawPartnerId, setWithdrawPartnerId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawNotes, setWithdrawNotes] = useState('');

  const [distributeAmount, setDistributeAmount] = useState(0);

  const fetchPartnersData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await window.api.getPartners({});
      if (response.success && response.data) {
        setPartners(response.data.partners || []);
        setTotalCapital(response.data.totalCapital || 0);
        setCashBalance(response.data.cashBalance || 0);
      } else {
        setErrorMessage(response.error || 'فشل تحميل بيانات الشركاء');
      }
    } catch (err: any) {
      console.error('Failed to load partners data:', err);
      setErrorMessage(err.message || 'فشل تحميل بيانات الشركاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnersData();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseDescription || expenseAmount <= 0) return;

    setActionLoading(true);
    setErrorMessage('');
    try {
      const response = await window.api.addBusinessExpense({
        description: expenseDescription,
        category: expenseCategory,
        amount: Number(expenseAmount),
        notes: expenseNotes || null,
        date: new Date(),
      });

      if (response.success) {
        setIsExpenseOpen(false);
        setExpenseDescription('');
        setExpenseAmount(0);
        setExpenseNotes('');
        fetchPartnersData();
      } else {
        setErrorMessage(response.error || 'فشل تسجيل المصروف');
      }
    } catch (err: any) {
      console.error('Failed to log expense:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ المصروف');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawPartnerId || withdrawAmount <= 0) return;

    // Check if drawing exceeds limit
    const partner = partners.find(p => p.id === withdrawPartnerId);
    if (partner && withdrawAmount > partner.currentProfitBalance) {
      setErrorMessage(`خطأ: المبلغ المطلوب سحبه أكبر من أرباح الشريك المتاحة (${partner.currentProfitBalance.toFixed(2)} الجنيه)`);
      return;
    }

    setActionLoading(true);
    setErrorMessage('');
    try {
      const response = await window.api.addPartnerWithdrawal({
        partnerId: withdrawPartnerId,
        amount: Number(withdrawAmount),
        notes: withdrawNotes || null,
        date: new Date(),
      });

      if (response.success) {
        setIsWithdrawalOpen(false);
        setWithdrawPartnerId('');
        setWithdrawAmount(0);
        setWithdrawNotes('');
        fetchPartnersData();
      } else {
        setErrorMessage(response.error || 'فشل تسجيل المسحوبات');
      }
    } catch (err: any) {
      console.error('Failed to log withdrawal:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ المسحوبات');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (distributeAmount <= 0) return;

    if (distributeAmount > cashBalance) {
      setErrorMessage('خطأ: المبلغ المراد توزيعه أكبر من رصيد الصندوق المتاح');
      return;
    }

    setActionLoading(true);
    setErrorMessage('');
    try {
      // Prepare distribution items based on partner percentages
      const items = partners.map(p => ({
        partnerId: p.id,
        amount: Number((distributeAmount * (p.profitSharePercentage / 100)).toFixed(2)),
        percentage: p.profitSharePercentage,
      }));

      const response = await window.api.distributeProfit({
        period: 'custom',
        startDate: new Date(),
        endDate: new Date(),
        totalRevenue: distributeAmount,
        totalExpenses: 0,
        netProfit: distributeAmount,
        notes: `توزيع أرباح بقيمة ${distributeAmount} الجنيه`,
        items,
      });

      if (response.success) {
        setIsDistributeOpen(false);
        setDistributeAmount(0);
        fetchPartnersData();
      } else {
        setErrorMessage(response.error || 'فشل توزيع الأرباح');
      }
    } catch (err: any) {
      console.error('Failed to distribute profits:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء توزيع الأرباح');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            الأرباح والشركاء
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">إدارة الحصص الرأسمالية والمصروفات وتوزيع الأرباح والمسحوبات للشركاء</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setErrorMessage(''); setIsExpenseOpen(true); }}
            className="btn-secondary py-2 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            تسجيل مصروفات
          </button>
          <button
            onClick={() => { setErrorMessage(''); setIsWithdrawalOpen(true); }}
            className="btn-secondary py-2 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5 ml-1" />
            مسحوبات شريك
          </button>
          <button
            onClick={() => { setErrorMessage(''); setIsDistributeOpen(true); }}
            className="btn-primary py-2 px-3.5 text-xs flex items-center gap-1.5"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span>توزيع الأرباح</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">إجمالي رأس المال المساهم</span>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1 block">
              {totalCapital.toFixed(2)} الجنيه
            </span>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">رصيد الصندوق المتاح للتوزيع</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {cashBalance.toFixed(2)} الجنيه
            </span>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 block">عدد المساهمين النشطين</span>
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
              {partners.length} شركاء
            </span>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="card overflow-hidden">
        {!partners.length ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">لا يوجد شركاء مسجلين</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">اسم الشريك</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">حصة رأس المال</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">نسبة الأرباح %</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">إجمالي المسحوبات</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 dark:text-gray-400">الأرباح غير الموزعة المتاحة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{partner.name}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{partner.capitalShare.toFixed(2)} الجنيه</td>
                  <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{partner.profitSharePercentage}%</td>
                  <td className="px-4 py-3 text-red-500 font-bold">-{partner.totalWithdrawals.toFixed(2)} الجنيه</td>
                  <td className="px-4 py-3 font-black text-emerald-600 dark:text-emerald-400">{partner.currentProfitBalance.toFixed(2)} الجنيه</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Log Expense Modal */}
      <Modal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} title="تسجيل مصروف تشغيلي جديد">
        <form onSubmit={handleRecordExpense} className="space-y-4 text-right" dir="rtl">
          <div>
            <label className="form-label text-xs">وصف المصروف *</label>
            <input
              type="text"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              className="input-field w-full text-sm"
              placeholder="مثال: إيجار المحل، فاتورة كهرباء..."
              required
              disabled={actionLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">تصنيف المصروف</label>
              <select
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                className="input-field w-full text-sm"
                disabled={actionLoading}
              >
                <option value="rent">إيجار ومستحقات عقارية</option>
                <option value="salary">رواتب موظفين</option>
                <option value="utilities">مرافق (كهرباء ومياه وغاز)</option>
                <option value="maintenance">صيانة وتشغيل ومعدات</option>
                <option value="other">مصروفات أخرى</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs">المبلغ (الجنيه) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={expenseAmount || ''}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="input-field w-full text-sm"
                placeholder="0.00"
                required
                disabled={actionLoading}
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs">ملاحظات إضافية</label>
            <textarea
              value={expenseNotes}
              onChange={(e) => setExpenseNotes(e.target.value)}
              rows={2}
              className="input-field w-full text-sm resize-none"
              placeholder="ملاحظات اختيارية..."
              disabled={actionLoading}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 justify-end">
            <button
              type="button"
              onClick={() => setIsExpenseOpen(false)}
              className="btn-secondary text-sm"
              disabled={actionLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={actionLoading || expenseAmount <= 0}
              className="btn-primary text-sm"
            >
              {actionLoading ? 'جاري الحفظ...' : 'حفظ المصروف'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Withdrawal Modal */}
      <Modal isOpen={isWithdrawalOpen} onClose={() => setIsWithdrawalOpen(false)} title="تسجيل مسحوبات شريك من أرباحه">
        <form onSubmit={handleRecordWithdrawal} className="space-y-4 text-right" dir="rtl">
          <div>
            <label className="form-label text-xs">اختيار الشريك المساهم *</label>
            <select
              value={withdrawPartnerId}
              onChange={(e) => setWithdrawPartnerId(e.target.value)}
              className="input-field w-full text-sm"
              required
              disabled={actionLoading}
            >
              <option value="">اختر شريكًا من القائمة...</option>
              {partners.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} (الرصيد المتاح: {p.currentProfitBalance.toFixed(2)} الجنيه)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label text-xs">مبلغ السحب (الجنيه) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={withdrawAmount || ''}
              onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              className="input-field w-full text-sm"
              placeholder="0.00"
              required
              disabled={actionLoading}
            />
          </div>

          <div>
            <label className="form-label text-xs">ملاحظات ومذكرة السحب</label>
            <textarea
              value={withdrawNotes}
              onChange={(e) => setWithdrawNotes(e.target.value)}
              rows={2}
              className="input-field w-full text-sm resize-none"
              placeholder="مثال: سحب نقدي طارئ..."
              disabled={actionLoading}
            />
          </div>

          <div className="flex items-center gap-3 pt-4 justify-end">
            <button
              type="button"
              onClick={() => setIsWithdrawalOpen(false)}
              className="btn-secondary text-sm"
              disabled={actionLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={actionLoading || !withdrawPartnerId || withdrawAmount <= 0}
              className="btn-primary text-sm"
            >
              {actionLoading ? 'جاري الحفظ...' : 'حفظ حركة السحب'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Distribute Profits Modal */}
      <Modal isOpen={isDistributeOpen} onClose={() => setIsDistributeOpen(false)} title="توزيع صافي الأرباح على الشركاء">
        <form onSubmit={handleRecordDistribution} className="space-y-4 text-right" dir="rtl">
          <div>
            <label className="form-label text-xs">مبلغ الأرباح الكلي لتوزيعه *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={cashBalance}
              value={distributeAmount || ''}
              onChange={(e) => setDistributeAmount(Number(e.target.value))}
              className="input-field w-full text-sm"
              placeholder="0.00"
              required
              disabled={actionLoading}
            />
            <span className="text-[10px] text-gray-400 block mt-2 font-semibold">
              ملاحظة: الحد الأقصى للتوزيع هو رصيد الصندوق المتوفر حالياً: {cashBalance.toFixed(2)} الجنيه.
            </span>
          </div>

          {distributeAmount > 0 && distributeAmount <= cashBalance && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-2 border border-gray-100 dark:border-gray-800 text-xs">
              <p className="font-bold text-gray-500 mb-1 text-[11px]">معاينة توزيع الأرباح المقترحة:</p>
              {partners.map(p => (
                <div key={p.id} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-850 last:border-0">
                  <span className="text-gray-700 dark:text-gray-300">{p.name} ({p.profitSharePercentage}%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {(distributeAmount * (p.profitSharePercentage / 100)).toFixed(2)} الجنيه
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4 justify-end">
            <button
              type="button"
              onClick={() => setIsDistributeOpen(false)}
              className="btn-secondary text-sm"
              disabled={actionLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={actionLoading || distributeAmount <= 0 || distributeAmount > cashBalance}
              className="btn-primary text-sm bg-indigo-600 hover:bg-indigo-500"
            >
              {actionLoading ? 'جاري التوزيع...' : 'تنفيذ عملية التوزيع'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
