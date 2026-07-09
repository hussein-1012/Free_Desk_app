import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';

export const StockCountFormPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/inventory')} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-500" />
          جرد مخزون جديد
        </h1>
      </div>
      <div className="card p-8 text-center text-gray-400">
        <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-semibold">قيد التطوير</p>
        <p className="text-sm mt-1">سيتم إضافة نموذج الجرد في الإصدار القادم</p>
        <button onClick={() => navigate('/inventory')} className="btn-secondary mt-4 mx-auto">
          العودة للمخزون
        </button>
      </div>
    </div>
  );
};
