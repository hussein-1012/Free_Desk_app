import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Product } from '@shared/types';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  products: Product[];
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  products,
}) => {
  const user = useAuthStore((state) => state.user);
  const [productId, setProductId] = useState('');
  const [type, setType] = useState('add'); // add, reduce
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setProductId('');
    setType('add');
    setQuantity(1);
    setNotes('');
    setError(null);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0) {
      setError('Please select a valid product and input quantity');
      return;
    }

    setLoading(true);
    setError(null);

    const actualQty = type === 'add' ? quantity : -quantity;

    try {
      const response = await window.api.createStockAdjustment({
        productId,
        quantity: actualQty,
        reason: notes || 'Manual Stock Adjustment',
        date: new Date(),
      }, user?.id || 'admin');

      if (response.success) {
        onSave();
        onClose();
      } else {
        setError(response.error || 'Failed to adjust stock');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during adjustment save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manual Stock Adjustment">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Product *
          </label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-205 focus:outline-none focus:border-primary-500 text-sm font-medium"
            required
            disabled={loading}
          >
            <option value="">Select inventory product...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Current Stock: {p.quantity})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Adjustment Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-205 focus:outline-none focus:border-primary-500 text-sm font-medium"
              disabled={loading}
            >
              <option value="add">Add Stock (+)</option>
              <option value="reduce">Reduce Stock (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 text-sm font-medium"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Reason / Notes *
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 text-sm font-medium"
            placeholder="e.g. Found extra boxes, damaged during transit"
            required
            disabled={loading}
          />
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-dark-100 hover:bg-dark-50 text-slate-350 font-semibold rounded-xl border border-slate-800 transition-colors text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !productId || quantity <= 0}
            className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-glow-primary active:scale-98 flex items-center justify-center space-x-1.5 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adjusting...</span>
              </>
            ) : (
              <span>Confirm Adjustment</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
