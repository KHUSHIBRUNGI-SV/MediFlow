import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { Product } from '../../types';
import { playSound } from '../../utils/soundEffects';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Zap, 
  Thermometer, 
  Plus, 
  Check, 
  AlertCircle, 
  Building2, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface CatalogOrderViewProps {
  onOpenCart: () => void;
}

export const CatalogOrderView: React.FC<CatalogOrderViewProps> = ({ onOpenCart }) => {
  const { 
    products, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    addToCart, 
    cart, 
    currentUser,
    hasPermission 
  } = useMediFlow();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getQuantity = (id: string) => quantities[id] || 1;

  const setQuantity = (id: string, val: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, val) }));
  };

  const handleAdd = (product: Product) => {
    const qty = getQuantity(product.id);
    addToCart(product, qty);
    playSound('CLICK');
    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            Physician & Ward Catalog
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Redis Cached (3.2ms)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Requisition medications, cold-chain vaccines, and surgical supplies with atomic stock reservation
          </p>
        </div>

        <button
          onClick={onOpenCart}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-950/50 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          View Active Requisition Cart ({cart.length})
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Brand Name, Generic Compound, or SKU..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

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

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const available = product.stockQuantity - product.allocatedReserved;
          const isOutOfStock = available <= 0;
          const inCart = cart.find(c => c.product.id === product.id);

          return (
            <div
              key={product.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-sm transition-all relative overflow-hidden"
            >
              <div>
                {/* Header pills */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {product.sku}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {product.cachedInRedis ? (
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Zap className="w-3 h-3 text-emerald-400" />
                        Redis 3.2ms
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                        DB Read 48ms
                      </span>
                    )}
                    {product.isColdChain && (
                      <span className="text-[10px] font-mono text-blue-300 bg-blue-500/20 border border-blue-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Thermometer className="w-3 h-3" />
                        2°C-8°C
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-0.5">{product.name}</h3>
                <p className="text-xs text-slate-400 italic mb-2">{product.genericName}</p>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {product.description}
                </p>

                {/* Specs */}
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1 mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Dosage Form:</span>
                    <span className="text-slate-200 truncate ml-2">{product.dosageForm}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Available Stock:</span>
                    <span className={`font-bold ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {available} units {isOutOfStock ? '(DEPLETED)' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Manufacturer:</span>
                    <span className="text-slate-300 truncate ml-2">{product.manufacturer}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Section */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Unit Price</span>
                  <span className="text-lg font-bold font-mono text-white">
                    ${product.unitPrice.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={available || 1}
                    value={getQuantity(product.id)}
                    onChange={(e) => setQuantity(product.id, parseInt(e.target.value) || 1)}
                    disabled={isOutOfStock}
                    className="w-14 bg-slate-950 border border-slate-700 text-center text-xs font-mono font-bold text-white rounded-lg py-1.5 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
                  />

                  <button
                    onClick={() => handleAdd(product)}
                    disabled={isOutOfStock}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1 ${
                      justAddedId === product.id
                        ? 'bg-emerald-600 text-white scale-105 shadow-emerald-500/30'
                        : isOutOfStock
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                    }`}
                  >
                    {justAddedId === product.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white animate-bounce" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        {inCart ? 'Add More' : 'Requisition'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
