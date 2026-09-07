import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { DOCKER_CONTAINERS } from '../../data/mockData';
import { playSound } from '../../utils/soundEffects';
import { Box, Cpu, HardDrive, Terminal, X, Copy, Check, Server, RefreshCw } from 'lucide-react';

interface DockerComposeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const DockerComposeModal: React.FC<DockerComposeModalProps> = ({ isOpen, onClose }) => {
  const { isDockerModalOpen, setIsDockerModalOpen } = useMediFlow();
  const [activeTab, setActiveTab] = useState<'containers' | 'compose' | 'logs'>('containers');
  const [selectedContainer, setSelectedContainer] = useState(DOCKER_CONTAINERS[1]); // Golang API
  const [copied, setCopied] = useState(false);

  const isVisible = isOpen !== undefined ? isOpen : isDockerModalOpen;
  if (!isVisible) return null;

  const handleClose = () => {
    if (onClose) onClose();
    setIsDockerModalOpen(false);
  };

  const dockerComposeContent = `version: '3.9'

services:
  # Next.js 14 Frontend Client
  web:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: mediflow-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8080/api/v1
      - NODE_ENV=production
    depends_on:
      api:
        condition: service_healthy

  # Golang 1.22 High-Performance REST API Microservice
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mediflow-api-gateway
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - GIN_MODE=release
      - DATABASE_URL=postgres://mediflow_admin:secret@postgres:5432/mediflow_db?sslmode=disable
      - REDIS_URL=redis:6379
      - JWT_SECRET=\${JWT_SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/api/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  # PostgreSQL 16 Relational Engine (ACID transactions, SELECT ... FOR UPDATE row locks)
  postgres:
    image: postgres:16.2-alpine
    container_name: mediflow-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: mediflow_admin
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: mediflow_db
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mediflow_admin -d mediflow_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis 7.2 In-Memory Cache (Sub-4ms reads, atomic DECRBY overselling protection)
  redis:
    image: redis:7.2.4-alpine
    container_name: mediflow-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy volatile-lru
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(dockerComposeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Docker Container Cluster & Architecture
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  5/5 Services UP
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Reproducible containerized infrastructure: Next.js, Golang API, PostgreSQL 16, Redis 7.2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveTab('containers')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'containers'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Active Containers ({DOCKER_CONTAINERS.length})
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'compose'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Live Container Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'containers' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    Total Cluster CPU
                  </div>
                  <div className="text-xl font-bold text-white">4.9%</div>
                  <div className="text-[11px] text-emerald-400">Within optimal 15% threshold</div>
                </div>
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                    Total RAM Allocated
                  </div>
                  <div className="text-xl font-bold text-white">503 MB / 5.0 GB</div>
                  <div className="text-[11px] text-slate-400">Lean Alpine container footings</div>
                </div>
                <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl">
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    Docker Engine Status
                  </div>
                  <div className="text-xl font-bold text-emerald-400">Healthy</div>
                  <div className="text-[11px] text-slate-400">Docker v26.0 (Compose v2.27)</div>
                </div>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/50">
                {DOCKER_CONTAINERS.map(c => (
                  <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-white text-sm">{c.name}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {c.service}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{c.image}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">PORTS</span>
                        {c.ports}
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">CPU / MEM</span>
                        {c.cpuUsage} &bull; {c.memUsage.split('/')[0]}
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">HEALTH</span>
                        <span className="text-emerald-400 font-semibold">{c.health}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'compose' && (
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400 font-mono">
                  Production-grade multi-container definition with healthchecks & volume persistence
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Compose YAML'}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-[500px]">
                {dockerComposeContent}
              </pre>
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="text-xs text-slate-400">Select Container:</label>
                <select
                  value={selectedContainer.id}
                  onChange={(e) => {
                    const found = DOCKER_CONTAINERS.find(c => c.id === e.target.value);
                    if (found) setSelectedContainer(found);
                  }}
                  className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-3 py-1 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {DOCKER_CONTAINERS.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.service})</option>
                  ))}
                </select>
                <span className="text-xs font-mono text-emerald-400 ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Streaming Stdout
                </span>
              </div>
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-[440px] overflow-y-auto">
                <div className="text-slate-500">// Container: {selectedContainer.name} ({selectedContainer.image})</div>
                <div className="text-slate-500">// Uptime: {selectedContainer.uptime}</div>
                <div className="border-b border-slate-800 my-2"></div>
                {selectedContainer.logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-600 select-none">{idx + 1}</span>
                    <span className={log.includes('WARNING') ? 'text-amber-400' : log.includes('Listening') || log.includes('ready') ? 'text-emerald-400' : 'text-slate-300'}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Docker CLI commands: <code className="text-cyan-400">docker compose up -d --build</code>
          </span>
          <button
            onClick={() => setIsDockerModalOpen(false)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
