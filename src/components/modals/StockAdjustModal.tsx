import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { Product } from '../../types';
import { playSound } from '../../utils/soundEffects';
import { X, Layers, AlertTriangle, Plus, Minus, Database, RefreshCw, Calendar } from 'lucide-react';

interface StockAdjustModalProps {
  isOpen?: boolean;
  product: Product | null;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ isOpen, product, onClose }) => {
  const { adjustStock, addNewBatch, currentUser } = useMediFlow();
  
  const [activeTab, setActiveTab] = useState<'adjust' | 'new_batch'>('adjust');
  const [selectedBatch, setSelectedBatch] = useState<string>(product?.batches[0]?.batchNumber || '');
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState<string>('Cycle Count Inventory Reconciliation');

  // New batch form state
  const [newBatchNumber, setNewBatchNumber] = useState(`BCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newBatchQuantity, setNewBatchQuantity] = useState(50);
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');
  const [newMfgDate, setNewMfgDate] = useState('2025-06-01');

  if (isOpen === false || !product) return null;

  const currentBatchObj = product.batches.find(b => b.batchNumber === selectedBatch) || product.batches[0];

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    const ok = adjustStock(product.id, selectedBatch, delta, reason);
    if (ok) {
      playSound('SUCCESS');
      onClose();
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    addNewBatch(product.id, newBatchNumber, newBatchQuantity, newExpiryDate, newMfgDate);
    playSound('SUCCESS');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Inventory Stock & Batch Control
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {product.sku} &bull; {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'adjust'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Adjust Stock & Evict Cache
          </button>
          <button
            onClick={() => setActiveTab('new_batch')}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'new_batch'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Register New Batch
          </button>
        </div>

        {/* Current status stats */}
        <div className="px-6 pt-4 pb-2 bg-slate-950/30 grid grid-cols-3 gap-3">
          <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Stock</span>
            <span className="text-lg font-bold text-white font-mono">{product.stockQuantity}</span>
          </div>
          <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Allocated</span>
            <span className="text-lg font-bold text-amber-400 font-mono">{product.allocatedReserved}</span>
          </div>
          <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Available</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              {product.stockQuantity - product.allocatedReserved}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'adjust' ? (
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Batch to Modify
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  {product.batches.map(b => (
                    <option key={b.batchNumber} value={b.batchNumber}>
                      {b.batchNumber} &mdash; Current: {b.quantity} units (Exp: {b.expiryDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Adjustment Units (+ or -)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDelta(prev => prev - 5)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(parseInt(e.target.value) || 0)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-center text-sm font-bold font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDelta(prev => prev + 5)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  {[+10, +25, +50, -5, -10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDelta(val)}
                      className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Reconciliation Audit Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Cycle Count Inventory Reconciliation">Cycle Count Physical Audit</option>
                  <option value="Supplier Depot Inbound Delivery">Supplier Depot Inbound Delivery</option>
                  <option value="Damaged/Excursion Loss Quarantine">Damaged / Thermal Excursion Quarantine</option>
                  <option value="Emergency Hospital Transfer Reallocation">Emergency Inter-Hospital Transfer</option>
                </select>
              </div>

              {/* Cache invalidation notice */}
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-start gap-2.5 text-xs text-indigo-300">
                <Database className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Automated Redis Cache-Aside Invalidation:</span>
                  <p className="text-[11px] text-indigo-200/80 mt-0.5 font-mono">
                    Applying this update invalidates `mediflow:product:{product.sku}:stock` and `mediflow:catalog:products:all` in Redis in-memory store.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Commit & Invalidate Cache
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batch Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatchNumber}
                    onChange={(e) => setNewBatchNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Batch Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatchQuantity}
                    onChange={(e) => setNewBatchQuantity(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newMfgDate}
                    onChange={(e) => setNewMfgDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-400" />
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Register Batch
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
