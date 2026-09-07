import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { 
  Zap, 
  Database, 
  Server, 
  Cpu, 
  Trash2, 
  Play, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  HardDrive, 
  Box, 
  RefreshCw 
} from 'lucide-react';

export const RedisArchitectureView: React.FC = () => {
  const { redisTelemetry, simulateRedisQuery, flushRedisCache, setIsDockerModalOpen } = useMediFlow();
  const [testKey, setTestKey] = useState('mediflow:product:MED-REM-100:stock');
  const [lastQueryResult, setLastQueryResult] = useState<{ cached: boolean; latencyMs: number } | null>(null);

  const handleTestQuery = () => {
    const result = simulateRedisQuery(testKey);
    setLastQueryResult(result);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            Redis Caching & Full-Stack Architecture
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {redisTelemetry.hitRatePercent}% Read Reduction
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Integrated Redis 7.2 in-memory caching for frequently accessed medical catalog data, cutting PostgreSQL reads by {redisTelemetry.hitRatePercent}%
          </p>
        </div>

        <button
          onClick={() => setIsDockerModalOpen(true)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Box className="w-4 h-4 text-cyan-400" />
          View Docker Cluster Specs
        </button>
      </div>

      {/* Primary Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Measured Read Reduction */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">PostgreSQL Read Reduction</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {redisTelemetry.hitRatePercent}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {redisTelemetry.cacheHits.toLocaleString()} hits / {redisTelemetry.totalQueries.toLocaleString()} total queries
          </p>
        </div>

        {/* Redis Average Latency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Redis Cache Hit Latency</span>
            <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-cyan-300 mt-1">
            {redisTelemetry.avgRedisLatencyMs} ms
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sub-4ms in-memory cache retrieval
          </p>
        </div>

        {/* PostgreSQL Disk Query Latency */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Postgres Disk Query Latency</span>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-slate-200 mt-1">
            {redisTelemetry.avgPostgresLatencyMs} ms
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            <strong className="text-emerald-400 font-mono">16.1x faster</strong> when served via Redis
          </p>
        </div>

        {/* Cache Invalidation Stats */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Cache Invalidation Evictions</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white mt-1">
            {redisTelemetry.evictedKeysCount} Evictions
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Write-through & cache-aside invalidation
          </p>
        </div>
      </div>

      {/* Latency Comparison Benchmark Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          Latency Benchmark: In-Memory Redis vs PostgreSQL Storage Engine
        </h3>

        <div className="space-y-3 pt-2">
          {/* Redis Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Redis In-Memory Key Lookup
              </span>
              <span className="text-cyan-400 font-bold">3.2 ms (93.8% Latency Reduction)</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style={{ width: '6.2%' }}></div>
            </div>
          </div>

          {/* Postgres Bar */}
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                PostgreSQL 16 Indexed Table Read (Buffer Pool / SSD)
              </span>
              <span className="text-slate-400 font-bold">51.4 ms</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Query Tester */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Interactive Cache Query Tester
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Execute live simulated queries against the Golang caching layer
            </p>
          </div>

          <button
            onClick={flushRedisCache}
            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            FLUSHDB (Flush Cache)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testKey}
            onChange={(e) => setTestKey(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            placeholder="e.g. mediflow:product:MED-REM-100:stock"
          />
          <button
            onClick={handleTestQuery}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 justify-center shadow-md shadow-cyan-950/40"
          >
            <Play className="w-3.5 h-3.5" />
            Execute GET
          </button>
        </div>

        {lastQueryResult && (
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              {lastQueryResult.cached ? (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                  HIT: Cache Hit (Redis In-Memory)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                  MISS: Cache Miss (PostgreSQL Read & Re-cached)
                </span>
              )}
              <span className="text-slate-400">Target: {testKey}</span>
            </div>
            <span className="text-cyan-300 font-bold">Response: {lastQueryResult.latencyMs} ms</span>
          </div>
        )}
      </div>

      {/* Active Redis Keys Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            In-Memory Redis Key Registry ({redisTelemetry.entries.length} Active Keys)
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Policy: volatile-lru &bull; MaxMemory: 512MB
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="p-3">Key Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">TTL</th>
                <th className="p-3">Hits</th>
                <th className="p-3">Size</th>
                <th className="p-3">Last Accessed</th>
                <th className="p-3">Cached Value Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {redisTelemetry.entries.map((entry) => (
                <tr key={entry.key} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-cyan-300 font-bold">{entry.key}</td>
                  <td className="p-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {entry.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{entry.ttl}s</td>
                  <td className="p-3 text-emerald-400 font-bold">{entry.hits}</td>
                  <td className="p-3 text-slate-400">{entry.sizeBytes} B</td>
                  <td className="p-3 text-slate-400">{entry.lastAccessed}</td>
                  <td className="p-3 text-slate-400 truncate max-w-xs text-[11px]">{entry.valueSnippet}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
