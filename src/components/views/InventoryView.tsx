import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { Product, Batch } from '../../types';
import { 
  Layers, 
  Search, 
  Filter, 
  AlertTriangle, 
  Thermometer, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  Calendar, 
  ShieldAlert, 
  Check, 
  Database,
  Tag
} from 'lucide-react';

interface InventoryViewProps {
  onOpenAdjust: (product: Product) => void;
  onOpenNewProduct: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenAdjust, onOpenNewProduct }) => {
  const { 
    products, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    hasPermission 
  } = useMediFlow();

  const [filterType, setFilterType] = useState<'ALL' | 'LOW_STOCK' | 'COLD_CHAIN' | 'EXPIRING_SOON'>('ALL');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.ndc.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesCategory || !matchesSearch) return false;

    if (filterType === 'LOW_STOCK') {
      return product.stockQuantity <= product.reorderLevel;
    }
    if (filterType === 'COLD_CHAIN') {
      return product.isColdChain;
    }
    if (filterType === 'EXPIRING_SOON') {
      return product.batches.some(b => b.status === 'NEAR_EXPIRY');
    }

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedProductId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            Medical Inventory & Batch Management
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filteredProducts.length} Items Listed
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time batch tracking, expiration warnings, and automatic Redis cache invalidation
          </p>
        </div>

        {hasPermission('inventory:write') && (
          <button
            onClick={onOpenNewProduct}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Catalog New Drug SKU
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Brand Name, Generic Formulation, SKU, or NDC..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-slate-500" /> Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'LOW_STOCK', label: 'Low / Reorder Alert' },
            { id: 'COLD_CHAIN', label: 'Cold-Chain (2°C-8°C)' },
            { id: 'EXPIRING_SOON', label: 'Expiring Soon (<90d)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List / Table */}
      <div className="space-y-3">
        {filteredProducts.map((product) => {
          const isExpanded = expandedProductId === product.id;
          const available = product.stockQuantity - product.allocatedReserved;
          const isCritical = product.stockQuantity <= product.criticalThreshold;
          const isLow = product.stockQuantity <= product.reorderLevel;

          return (
            <div
              key={product.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:border-slate-700 transition-all"
            >
              {/* Product Card Summary Row */}
              <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-base text-white">{product.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {product.sku}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      NDC: {product.ndc}
                    </span>
                    {product.isColdChain ? (
                      <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        2°C to 8°C Cold Chain
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                        Ambient (15°C-25°C)
                      </span>
                    )}
                    {isCritical ? (
                      <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        Critical Low
                      </span>
                    ) : isLow ? (
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Reorder Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Optimal
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 italic">{product.genericName}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{product.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono mt-2">
                    <span>Category: <strong className="text-slate-300">{product.category}</strong></span>
                    <span>&bull;</span>
                    <span>Dosage: <strong className="text-slate-300">{product.dosageForm}</strong></span>
                    <span>&bull;</span>
                    <span>Location: <strong className="text-slate-300">{product.locationRack}</strong></span>
                    <span>&bull;</span>
                    <span>Mfr: <strong className="text-slate-300">{product.manufacturer}</strong></span>
                  </div>
                </div>

                {/* Stock metrics & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Total Stock
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {product.stockQuantity} <span className="text-xs text-slate-400 font-sans font-normal">units</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        {product.allocatedReserved} reserved &bull; <span className="text-emerald-400 font-bold">{available} avail</span>
                      </div>
                    </div>

                    <div className="text-left lg:text-right pl-4 border-l border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        Unit Price
                      </div>
                      <div className="text-lg font-bold font-mono text-cyan-300">
                        ${product.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenAdjust(product)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      Adjust Stock
                    </button>

                    <button
                      onClick={() => toggleExpand(product.id)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors"
                      title="View Batches & Expiry Dates"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Batch Expansion Section */}
              {isExpanded && (
                <div className="bg-slate-950/60 border-t border-slate-800 p-4 sm:p-5 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Active Batches & Lot Serialization ({product.batches.length} Registered Lots)
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      Storage Spec: {product.targetTempRange || 'Standard Storage'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product.batches.map((batch) => (
                      <div
                        key={batch.batchNumber}
                        className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-white">{batch.batchNumber}</span>
                          {batch.status === 'NEAR_EXPIRY' ? (
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded">
                              Near Expiry
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              Optimal
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-mono text-slate-300">
                          Quantity: <strong className="text-white">{batch.quantity} units</strong>
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono space-y-0.5 border-t border-slate-800/80 pt-1.5">
                          <div className="flex items-center justify-between">
                            <span>Mfg Date:</span>
                            <span className="text-slate-300">{batch.mfgDate}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Expiry Date:</span>
                            <span className={`font-semibold ${batch.status === 'NEAR_EXPIRY' ? 'text-amber-400' : 'text-slate-300'}`}>
                              {batch.expiryDate}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
