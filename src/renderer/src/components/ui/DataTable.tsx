import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <div className="flex flex-col h-full bg-dark-200 border border-slate-800 rounded-xl overflow-hidden shadow-card">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-100 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider select-none">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-semibold">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-sm text-slate-200 font-medium">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce" />
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row: any, i) => (
                <tr
                  key={row.id || i}
                  className="hover:bg-dark-100/40 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-3.5 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {onPageChange && total > pageSize && (
        <div className="h-16 px-6 border-t border-slate-800 bg-dark-100 flex items-center justify-between select-none">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} items
          </span>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-dark-200 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-dark-200 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm text-slate-300 font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-dark-200 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-dark-200 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
