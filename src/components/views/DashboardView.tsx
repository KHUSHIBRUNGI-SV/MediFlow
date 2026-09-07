import React from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { ActiveTab } from '../Navigation';
import { 
  Activity, 
  Layers, 
  AlertTriangle, 
  ShoppingCart, 
  Truck, 
  Zap, 
  ShieldCheck, 
  Thermometer, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Database, 
  Cpu, 
  Key 
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenAdjust: (product: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, onOpenAdjust }) => {
  const { 
    products, 
    orders, 
    currentUser, 
    redisTelemetry, 
    setIsJwtModalOpen, 
    setIsDockerModalOpen,
    setSelectedOrderForTracking 
  } = useMediFlow();

  // Metrics
  const totalSkus = products.length;
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.reorderLevel);
  const criticalStockProducts = products.filter(p => p.stockQuantity <= p.criticalThreshold);
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'REJECTED');
  const coldChainProducts = products.filter(p => p.isColdChain);
  const inTransitOrders = orders.filter(o => o.status === 'DISPATCHED');

  const dispatchedOrderWithTracking = orders.find(o => o.status === 'DISPATCHED' && o.deliveryTracking);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Role Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/70 rounded-2xl border border-slate-700/80 p-5 sm:p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md shadow-cyan-950/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Welcome, {currentUser.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Tier {currentUser.tierLevel} &bull; {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {currentUser.roleTitle} &bull; <span className="text-slate-400">{currentUser.department}</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {currentUser.permissions.length} RBAC Scopes Active
                </span>
                <span className="text-slate-600">&bull;</span>
                <button
                  onClick={() => setIsJwtModalOpen(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono underline flex items-center gap-1"
                >
                  <Key className="w-3 h-3" /> View Decoded JWT Claims
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('concurrency')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-950/50 flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              Test Concurrency Lock Engine
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-cyan-400" />
              Place Clinical Requisition
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Inventory SKUs */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Medical Inventory</span>
            <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{totalSkus} SKUs</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-cyan-400 font-semibold">{coldChainProducts.length} Cold-Chain</span> items logged
          </p>
        </div>

        {/* Low Stock Alarms */}
        <div className={`bg-slate-900/90 border rounded-2xl p-4 shadow-sm relative overflow-hidden ${
          lowStockProducts.length > 0 ? 'border-amber-500/30' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Stock Threshold Alerts</span>
            <div className={`p-1.5 rounded-lg ${lowStockProducts.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1 flex items-baseline gap-2">
            {lowStockProducts.length}
            {criticalStockProducts.length > 0 && (
              <span className="text-xs text-rose-400 font-sans font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                {criticalStockProducts.length} Critical
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Automatic PO suggestions pending
          </p>
        </div>

        {/* Active Orders Pipeline */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Orders Funnel</span>
            <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{activeOrders.length} In Progress</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">{inTransitOrders.length} In Transit</span> with IoT telemetry
          </p>
        </div>

        {/* Redis Cache Telemetry */}
        <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Redis Cache Hit Ratio</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {redisTelemetry.hitRatePercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-semibold">3.2ms</span> Redis vs 51ms Postgres
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Low Stock Warnings & Order Pipeline Funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Low Stock & Critical Alarms Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Low-Stock & Critical Threshold Monitoring</h3>
                  <p className="text-xs text-slate-400">Real-time alerts preventing hospital stockouts under concurrent demand</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                View All Batches <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-800/80">
              {lowStockProducts.map(p => {
                const available = p.stockQuantity - p.allocatedReserved;
                const isCritical = p.stockQuantity <= p.criticalThreshold;

                return (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-white truncate">{p.name}</span>
                        {isCritical ? (
                          <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30">
                            CRITICAL LOW
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                            REORDER
                          </span>
                        )}
                        {p.isColdChain && (
                          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded">
                            2-8°C
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                        <span>SKU: {p.sku}</span>
                        <span>&bull;</span>
                        <span>Location: {p.locationRack}</span>
                        <span>&bull;</span>
                        <span>Threshold: &le;{p.reorderLevel} units</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white">
                          {p.stockQuantity} in stock
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {p.allocatedReserved} reserved &bull; <span className="text-emerald-400 font-semibold">{available} avail</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenAdjust(p)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        Adjust / Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Orders Lifecycle Pipeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live Medical Order Pipeline</h3>
                  <p className="text-xs text-slate-400">Lifecycle tracking from physician requisition to cold-chain delivery</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                Orders Board <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => {
                const statusStyles: Record<string, { bg: string; text: string }> = {
                  PENDING_APPROVAL: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400' },
                  APPROVED: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400' },
                  ALLOCATED_PICKED: { bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400' },
                  DISPATCHED: { bg: 'bg-cyan-500/10 border-cyan-500/30 animate-pulse', text: 'text-cyan-400' },
                  DELIVERED: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
                  REJECTED: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400' }
                };

                const style = statusStyles[order.status] || { bg: 'bg-slate-800 border-slate-700', text: 'text-slate-300' };

                return (
                  <div
                    key={order.id}
                    className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">{order.orderNumber}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${style.bg} ${style.text}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        {order.priority === 'CRITICAL' && (
                          <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded">
                            STAT PRIORITY
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        {order.requisitionBy} &bull; <span className="text-slate-400">{order.department}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''} &bull; Total: ${order.totalAmount.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {order.deliveryTracking && (
                        <button
                          onClick={() => setSelectedOrderForTracking(order)}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                          Track Cold-Chain ({order.deliveryTracking.currentTempCelsius}°C)
                        </button>
                      )}
                      <button
                        onClick={() => onNavigate('orders')}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Cold Chain Telemetry Card & System Status */}
        <div className="space-y-6">
          {/* Active Cold Chain Highlight */}
          {dispatchedOrderWithTracking ? (
            <div className="bg-gradient-to-br from-slate-900 to-blue-950/40 border border-blue-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 animate-pulse" />
                  Active In-Transit Cold Chain
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                  2°C - 8°C OK
                </span>
              </div>

              <div className="text-xl font-bold text-white mb-1">
                {dispatchedOrderWithTracking.orderNumber}
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Fleet Unit: {dispatchedOrderWithTracking.deliveryTracking?.vehicleId}
              </p>

              {/* Real-time temp readout */}
              <div className="my-4 p-3 bg-slate-950/60 rounded-xl border border-blue-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Live Cargo Temp</span>
                  <span className="text-2xl font-black text-cyan-300 font-mono">
                    {dispatchedOrderWithTracking.deliveryTracking?.currentTempCelsius}°C
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">ETA</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {dispatchedOrderWithTracking.deliveryTracking?.etaMinutes} mins
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForTracking(dispatchedOrderWithTracking)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/50"
              >
                <Truck className="w-3.5 h-3.5" />
                Open Live GPS & Sensor Map
              </button>
            </div>
          ) : null}

          {/* Microservices & Infrastructure Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Infrastructure Health
              </h3>
              <button
                onClick={() => setIsDockerModalOpen(true)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono font-semibold"
              >
                Docker Compose &rarr;
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-slate-800/40 rounded-lg flex items-center justify-between border border-slate-700/40">
                <span className="text-slate-300">Golang Gin Engine</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Up (:8080)
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/40 rounded-lg flex items-center justify-between border border-slate-700/40">
                <span className="text-slate-300">PostgreSQL 16 Pool</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 25 Conn
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/40 rounded-lg flex items-center justify-between border border-slate-700/40">
                <span className="text-slate-300">Redis 7.2 LRU Cache</span>
                <span className="text-cyan-300 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" /> 84.7% Hit
                </span>
              </div>
              <div className="p-2.5 bg-slate-800/40 rounded-lg flex items-center justify-between border border-slate-700/40">
                <span className="text-slate-300">Distributed Lock (Mutex)</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Zero Oversell
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Stack: Next.js + Go + PG + Redis</span>
              <button
                onClick={() => onNavigate('redis')}
                className="text-cyan-400 hover:underline"
              >
                Redis Latency Metrics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
