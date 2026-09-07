import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useMediFlow } from '../../context/MediFlowContext';
import { OrderPriority } from '../../types';
import { playSound } from '../../utils/soundEffects';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Hospital 
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
  onCheckoutSuccess?: () => void;
}

export const CartRequisitionDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose,
  onOrderCreated,
  onCheckoutSuccess
}) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, submitRequisition, currentUser } = useMediFlow();

  const [priority, setPriority] = useState<OrderPriority>('HIGH');
  const [ward, setWard] = useState<string>('Cardiothoracic ICU & Trauma Satellite Bay');
  const [notes, setNotes] = useState<string>('Urgent protocol requisition for critical care replenishment.');

  if (!isOpen) return null;

  const totalAmount = cart.reduce((sum, item) => sum + (item.product.unitPrice * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = submitRequisition(priority, notes, ward);
    if (newOrder) {
      playSound('SUCCESS');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (onOrderCreated) onOrderCreated(newOrder.id);
      if (onCheckoutSuccess) onCheckoutSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hospital Requisition Order</h2>
              <p className="text-xs text-slate-400">
                {cart.length} item{cart.length !== 1 ? 's' : ''} staged for atomic reservation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-slate-300 font-semibold text-sm">Your Requisition Cart is Empty</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Browse the Medical Catalog tab to request pharmaceuticals, vaccines, or ICU supplies.
              </p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                {cart.map(({ product, quantity }) => {
                  const available = product.stockQuantity - product.allocatedReserved;

                  return (
                    <div
                      key={product.id}
                      className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                          <span>{product.sku}</span>
                          <span>&bull;</span>
                          <span className="text-cyan-300">${product.unitPrice.toFixed(2)}/ea</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Avail: {available} units
                        </span>
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-xs text-white">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            disabled={quantity >= available}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form specs */}
              <form id="requisition-form" onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                    <Hospital className="w-3 h-3 text-cyan-400" />
                    Destination Ward / Department
                  </label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Cardiothoracic ICU & Trauma Satellite Bay">Cardiothoracic ICU & Trauma Bay</option>
                    <option value="Emergency Resuscitation & Shock Suite">Emergency Resuscitation Suite</option>
                    <option value="General & Minimally Invasive Surgery OR 4">General Surgery OR 4</option>
                    <option value="Pediatric Critical Care Unit">Pediatric Critical Care Unit</option>
                    <option value="Inpatient Oncology & Infusion Wing">Inpatient Oncology Wing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clinical Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['NORMAL', 'HIGH', 'CRITICAL'] as OrderPriority[]).map((pri) => (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => setPriority(pri)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                          priority === pri
                            ? pri === 'CRITICAL' 
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                              : pri === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {pri}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clinical Requisition Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Patient case number, attending instructions, or protocol..."
                  />
                </div>

                {/* Overselling safety guarantee badge */}
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Concurrency Protection:</span>
                    <p className="text-[11px] text-emerald-200/80 mt-0.5 font-mono">
                      Submitting triggers Golang sync.Mutex + Postgres row-level locking (SELECT FOR UPDATE) to guarantee zero overselling.
                    </p>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-800/90 border-t border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Requisition Total</span>
              <span className="text-xl font-bold font-mono text-white">
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearCart}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                form="requisition-form"
                className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Submit Requisition & Reserve Stock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
