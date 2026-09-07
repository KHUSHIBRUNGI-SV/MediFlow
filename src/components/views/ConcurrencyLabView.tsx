import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useMediFlow } from '../../context/MediFlowContext';
import { playSound } from '../../utils/soundEffects';
import { 
  Cpu, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Play, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  Database, 
  CheckCircle2, 
  XCircle,
  FileCode,
  Activity,
  Layers
} from 'lucide-react';

export const ConcurrencyLabView: React.FC = () => {
  const { products, runConcurrencyStressTest, lastSimulationResult } = useMediFlow();

  // Select scarce medication
  const [selectedProductId, setSelectedProductId] = useState<string>(products[2]?.id || products[0]?.id); // Norepinephrine (8 units)
  const [concurrentWards, setConcurrentWards] = useState<number>(15);
  const [unitsPerWard, setUnitsPerWard] = useState<number>(2);
  const [activeStrategy, setActiveStrategy] = useState<'MEDIFLOW_ATOMIC_LOCK' | 'NAIVE_RACE_CONDITION'>('MEDIFLOW_ATOMIC_LOCK');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];
  const totalDemand = concurrentWards * unitsPerWard;

  const handleRunTest = (strategyToRun: 'MEDIFLOW_ATOMIC_LOCK' | 'NAIVE_RACE_CONDITION') => {
    setIsRunning(true);
    setActiveStrategy(strategyToRun);
    playSound(strategyToRun === 'MEDIFLOW_ATOMIC_LOCK' ? 'LOCK' : 'ALERT');

    setTimeout(() => {
      runConcurrencyStressTest(selectedProduct.id, unitsPerWard, concurrentWards, strategyToRun);
      setIsRunning(false);
      if (strategyToRun === 'MEDIFLOW_ATOMIC_LOCK') {
        playSound('SUCCESS');
        confetti({
          particleCount: 60,
          spread: 65,
          origin: { y: 0.6 }
        });
      } else {
        playSound('ALERT');
      }
    }, 450);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            Concurrency & Overselling Prevention Engine
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Golang Mutex + Redis DECRBY + Postgres Locks
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate dozens of hospital wards simultaneously ordering scarce medication under high load
          </p>
        </div>
      </div>

      {/* Simulator Control Board */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Drug Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Critical Medicine (Scarce Inventory)
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} &mdash; {p.stockQuantity} units available ({p.sku})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 font-mono mt-1">
              Current Available Stock: <strong className="text-white">{selectedProduct.stockQuantity} units</strong>
            </p>
          </div>

          {/* Concurrent Wards Slider/Stepper */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
              <span>Simultaneous Requesting Wards:</span>
              <span className="font-mono text-cyan-300 font-bold">{concurrentWards} Wards</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={concurrentWards}
              onChange={(e) => setConcurrentWards(parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>5 Wards (Light)</span>
              <span>15 Wards (Heavy)</span>
              <span>30 Wards (Spike)</span>
            </div>
          </div>

          {/* Units Per Ward */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Units Requested Per Requisition
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={unitsPerWard}
                onChange={(e) => setUnitsPerWard(parseInt(e.target.value) || 1)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center text-white focus:outline-none focus:border-cyan-500"
              />
              <div className="text-xs text-slate-400 font-mono">
                Total Demand: <strong className="text-amber-400 font-bold">{totalDemand} units</strong>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {totalDemand > selectedProduct.stockQuantity 
                ? `⚠️ Demand (${totalDemand}) exceeds stock (${selectedProduct.stockQuantity}). Overselling risk high!` 
                : 'Demand within stock limits.'}
            </p>
          </div>
        </div>

        {/* Dual Strategy Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
          {/* Strategy A: Naive Race Condition */}
          <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Strategy A: Unprotected Race Condition
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Non-atomic reads: Wards read stale snapshot concurrently before writing.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Fails under load
              </span>
            </div>

            <button
              onClick={() => handleRunTest('NAIVE_RACE_CONDITION')}
              disabled={isRunning}
              className="w-full py-2 bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-rose-400" />
              Simulate Naive Race Condition
            </button>
          </div>

          {/* Strategy B: MediFlow Mutex Lock */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Strategy B: MediFlow Atomic Engine
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Golang sync.Mutex + Redis DECRBY + Postgres SELECT ... FOR UPDATE.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Consistent
              </span>
            </div>

            <button
              onClick={() => handleRunTest('MEDIFLOW_ATOMIC_LOCK')}
              disabled={isRunning}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Play className="w-3.5 h-3.5" />
              Run MediFlow Protected Test
            </button>
          </div>
        </div>
      </div>

      {/* Test Results Section */}
      {lastSimulationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Result Outcome Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Simulated Strategy
              </span>
              <span className="text-sm font-bold font-mono text-white mt-1 block truncate">
                {lastSimulationResult.strategy === 'MEDIFLOW_ATOMIC_LOCK' ? 'MediFlow Atomic Lock' : 'Naive Race Condition'}
              </span>
              <span className={`text-[10px] font-mono font-bold mt-1 inline-block ${
                lastSimulationResult.strategy === 'MEDIFLOW_ATOMIC_LOCK' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {lastSimulationResult.strategy === 'MEDIFLOW_ATOMIC_LOCK' ? 'Protected: Zero Oversell' : 'Critical Hazard'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Concurrent Demands
              </span>
              <span className="text-2xl font-bold font-mono text-white mt-1 block">
                {lastSimulationResult.concurrentRequestsCount} Wards
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {lastSimulationResult.successfulOrdersCount} Fulfilled &bull; {lastSimulationResult.rejectedOrdersCount} Blocked
              </span>
            </div>

            <div className={`bg-slate-900/90 border rounded-xl p-4 ${
              lastSimulationResult.oversoldUnits > 0 ? 'border-rose-500/40 bg-rose-950/20' : 'border-emerald-500/30'
            }`}>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Phantom Oversold Units
              </span>
              <span className={`text-2xl font-bold font-mono mt-1 block ${
                lastSimulationResult.oversoldUnits > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {lastSimulationResult.oversoldUnits} units
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {lastSimulationResult.oversoldUnits > 0 ? 'Danger: Negative Stock!' : 'Exact 0 oversold guarantee'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Engine Execution Duration
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-300 mt-1 block">
                {lastSimulationResult.executionDurationMs} ms
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Golang goroutine pool latency
              </span>
            </div>
          </div>

          {/* Interactive Goroutine Worker Node Matrix Visualizer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Simulated Golang Goroutine Worker Pool ({lastSimulationResult.logs.length} Concurrent Threads)
              </h3>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Lock Acquired & Fulfilled
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  {lastSimulationResult.strategy === 'MEDIFLOW_ATOMIC_LOCK' ? 'Atomic Rejection (Safe)' : 'Race Condition Oversold'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5 pt-2">
              {lastSimulationResult.logs.map((log) => {
                const isSuccess = log.status === 'FULFILLED';
                return (
                  <div
                    key={log.requestId}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all flex flex-col justify-between ${
                      isSuccess
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-950/30'
                        : lastSimulationResult.strategy === 'MEDIFLOW_ATOMIC_LOCK'
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold text-slate-300 truncate">
                        {log.wardName.split(' ')[0]}
                      </span>
                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        isSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isSuccess ? 'PASS' : 'BLOCK'}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Req: {log.requestedUnits}u
                    </div>
                    <div className="text-[9px] text-slate-500 truncate mt-1">
                      Stock: {log.stockAfter}u
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Audit Trail Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                Atomic Transaction Audit Log ({lastSimulationResult.logs.length} Operations)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Initial Stock: {lastSimulationResult.initialStock} &rarr; Final: {lastSimulationResult.finalStockReported}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Hospital Ward</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Remaining</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Lock Mechanism Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
                  {lastSimulationResult.logs.map((log) => (
                    <tr key={log.requestId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-slate-300">{log.requestId}</td>
                      <td className="p-3 text-white font-semibold font-sans">{log.ward}</td>
                      <td className="p-3 text-slate-300">{log.unitsRequested}</td>
                      <td className="p-3">
                        {log.status === 'SUCCESS' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> FULFILLED
                          </span>
                        )}
                        {log.status === 'REJECTED_OUT_OF_STOCK' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> 409 OUT OF STOCK
                          </span>
                        )}
                        {log.status === 'OVERSOLD_ERROR' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> OVERSOLD CORRUPTION
                          </span>
                        )}
                      </td>
                      <td className={`p-3 font-bold ${log.remainingStockAfter < 0 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}`}>
                        {log.remainingStockAfter}
                      </td>
                      <td className="p-3 text-cyan-300">{log.latencyMs}ms</td>
                      <td className="p-3 text-slate-400 text-[11px] truncate max-w-xs">{log.isolationNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Technical Architecture Deep Dive */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">How MediFlow Prevents Overselling in Production</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-cyan-300 block font-mono">1. Golang sync.Mutex</span>
            <p className="text-slate-400 leading-relaxed">
              In-process SKU-keyed mutex lock inside the Golang API service ensures goroutines attempting to purchase the same product ID enter a FIFO serialized queue.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-indigo-300 block font-mono">2. Redis Atomic DECRBY</span>
            <p className="text-slate-400 leading-relaxed">
              Multi-instance deployments utilize Redis single-threaded atomicity (`DECRBY`). If decrement yields &lt; 0, the transaction immediately rolls back in 1.4ms.
            </p>
          </div>
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-xs font-bold text-emerald-300 block font-mono">3. PostgreSQL Row Lock</span>
            <p className="text-slate-400 leading-relaxed">
              Final reservation executes within a database transaction with `SELECT stock FROM inventory WHERE sku = $1 FOR UPDATE`, maintaining strict ACID durability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
