import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Product, Category } from '@shared/types';
import { Loader2 } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product?: Product | null;
  categories: Category[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product = null,
  categories,
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [minQuantity, setMinQuantity] = useState(5);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBarcode(product.barcode || '');
      setCategoryId(product.categoryId || '');
      setPurchasePrice(product.purchasePrice);
      setSellingPrice(product.sellingPrice);
      setQuantity(product.quantity);
      setMinQuantity(product.minQuantity);
      setLocation(product.location || '');
      setNotes(product.notes || '');
    } else {
      setName('');
      setBarcode('');
      setCategoryId(categories[0]?.id || '');
      setPurchasePrice(0);
      setSellingPrice(0);
      setQuantity(0);
      setMinQuantity(5);
      setLocation('');
      setNotes('');
    }
    setError(null);
  }, [product, isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId) {
      setError('Name and Category are required');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name,
      barcode: barcode || null,
      categoryId,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      quantity: Number(quantity),
      minQuantity: Number(minQuantity),
      location: location || null,
      notes: notes || null,
    };

    try {
      let response;
      if (product) {
        response = await window.api.updateProduct(product.id, payload);
      } else {
        response = await window.api.createProduct(payload);
      }

      if (response.success) {
        onSave();
        onClose();
      } else {
        setError(response.error || 'Failed to save product');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              placeholder="Product name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              required
              disabled={loading}
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Barcode / UPC / SKU
            </label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              placeholder="Scan or enter code"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Purchase Price (Cost) *
            </label>
            <input
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Selling Price (Retail) *
            </label>
            <input
              type="number"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Initial Quantity *
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              required
              disabled={loading || !!product}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Min Stock Limit (Alerts) *
            </label>
            <input
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Storage Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              placeholder="Shelf number / aisle"
              disabled={loading}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description / Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2.5 bg-dark-300 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 text-sm font-medium"
              placeholder="Product notes"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-dark-100 hover:bg-dark-50 text-slate-350 font-semibold rounded-xl border border-slate-800 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-glow-primary active:scale-98 flex items-center justify-center space-x-1.5 text-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
