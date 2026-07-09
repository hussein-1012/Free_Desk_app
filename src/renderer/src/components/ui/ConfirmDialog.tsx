import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 animate-pulse-soft">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex items-center space-x-3 w-full pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-dark-100 hover:bg-dark-50 text-slate-300 font-semibold rounded-xl border border-slate-800 transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center space-x-1.5 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
