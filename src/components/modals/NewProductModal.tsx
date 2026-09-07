import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { ProductCategory } from '../../types';
import { playSound } from '../../utils/soundEffects';
import { Plus, X, Thermometer, ShieldAlert, Package, Calendar } from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({ isOpen, onClose }) => {
  const { addNewProduct } = useMediFlow();

  const [sku, setSku] = useState(`MED-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [ndc, setNdc] = useState(`00${Math.floor(100 + Math.random() * 899)}-${Math.floor(1000 + Math.random() * 8999)}-01`);
  const [category, setCategory] = useState<ProductCategory>('Emergency & ICU');
  const [dosageForm, setDosageForm] = useState('500mg IV Infusion');
  const [unitPrice, setUnitPrice] = useState<number>(120.00);
  const [stockQuantity, setStockQuantity] = useState<number>(40);
  const [reorderLevel, setReorderLevel] = useState<number>(20);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(10);
  const [isColdChain, setIsColdChain] = useState<boolean>(false);
  const [locationRack, setLocationRack] = useState('Depot Bay B-12');
  const [manufacturer, setManufacturer] = useState('Novartis / Sandoz Biopharma');
  const [description, setDescription] = useState('Hospital-grade intravenous formulation for inpatient clinical therapy.');

  // Initial batch
  const [batchNumber, setBatchNumber] = useState(`BCH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [expiryDate, setExpiryDate] = useState('2027-08-31');
  const [mfgDate, setMfgDate] = useState('2025-05-10');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    addNewProduct({
      sku,
      name,
      genericName,
      ndc,
      category,
      dosageForm,
      unitPrice,
      stockQuantity,
      reorderLevel,
      criticalThreshold,
      isColdChain,
      targetTempRange: isColdChain ? '2°C to 8°C (Cold-Chain Refrigerated)' : '15°C to 25°C (Controlled Ambient)',
      locationRack,
      manufacturer,
      description,
      batches: [
        {
          batchNumber,
          quantity: stockQuantity,
          expiryDate,
          mfgDate,
          storageTemp: isColdChain ? '4.0°C' : '22°C',
          status: 'OPTIMAL'
        }
      ]
    });

    playSound('SUCCESS');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Register New Medical SKU</h2>
              <p className="text-xs text-slate-400">
                Add pharmaceutical, biologic, or surgical supplies to MediFlow inventory
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meropenem for Injection"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Generic Formulation *</label>
              <input
                type="text"
                required
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Meropenem Trihydrate IV"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 font-sans">SKU *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1 font-sans">NDC Code *</label>
              <input
                type="text"
                required
                value={ndc}
                onChange={(e) => setNdc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1 font-sans">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Medical Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Emergency & ICU">Emergency & ICU</option>
                <option value="Vaccines & Biologics">Vaccines & Biologics</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
                <option value="Surgical Equipment">Surgical Equipment</option>
                <option value="Diagnostics & Reagents">Diagnostics & Reagents</option>
                <option value="PPE & Consumables">PPE & Consumables</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Dosage Form</label>
              <input
                type="text"
                value={dosageForm}
                onChange={(e) => setDosageForm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Cold Chain toggle */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Thermometer className={`w-5 h-5 ${isColdChain ? 'text-blue-400' : 'text-slate-500'}`} />
              <div>
                <span className="font-semibold text-white block">Requires Cold-Chain Storage (2°C to 8°C)</span>
                <span className="text-[11px] text-slate-400">Enables IoT continuous temperature logging during dispatch</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsColdChain(!isColdChain)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isColdChain ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                isColdChain ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Stock Quantities & Thresholds */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div>
              <label className="block font-semibold text-slate-300 mb-1 font-sans">Initial Stock</label>
              <input
                type="number"
                min="1"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1 font-sans">Reorder Threshold</label>
              <input
                type="number"
                min="1"
                required
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1 font-sans">Critical Alert Level</label>
              <input
                type="number"
                min="1"
                required
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Initial Batch & Expiry */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2.5">
            <span className="font-semibold text-slate-200 block">Initial Lot / Batch Serialization</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Batch No</span>
                <input
                  type="text"
                  required
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <span className="text-slate-500 block">Mfg Date</span>
                <input
                  type="date"
                  required
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>
              <div>
                <span className="text-slate-500 block">Expiry Date</span>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
            >
              <Plus className="w-4 h-4" />
              Register SKU
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
