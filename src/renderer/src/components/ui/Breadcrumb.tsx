import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

// خريطة المسارات إلى الأسماء العربية
const routeLabels: Record<string, string> = {
  '':             'الرئيسية',
  'customers':    'العملاء',
  'suppliers':    'الموردون',
  'products':     'المنتجات',
  'accessories':  'الإكسسوارات',
  'purchases':    'المشتريات',
  'sales':        'المبيعات',
  'oil':          'الزيوت',
  'wash':         'الغسيل',
  'inventory':    'المخزون',
  'reports':      'التقارير',
  'settings':     'الإعدادات',
  'partners':     'الشركاء',
  'new':          'جديد',
  'edit':         'تعديل',
  'statement':    'كشف الحساب',
  'detail':       'التفاصيل',
  'stock-counts': 'جرد المخزون',
  'stock-movements': 'حركة المخزون',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();

  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = [
    { label: 'الرئيسية', path: '/' },
    ...segments.map((seg, i) => {
      const path = '/' + segments.slice(0, i + 1).join('/');
      // If segment looks like an ID (cuid), skip label display
      const label = /^[a-z0-9]{20,}$/i.test(seg)
        ? 'التفاصيل'
        : routeLabels[seg] || seg;
      return { label, path };
    }),
  ];

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            {idx > 0 && <ChevronLeft className="w-3.5 h-3.5 rotate-180 shrink-0" />}
            {isLast ? (
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors truncate max-w-[120px]"
              >
                {idx === 0 ? <Home className="w-3.5 h-3.5 inline -mt-0.5" /> : crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
