import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { API_ENDPOINTS } from '../../data/mockData';
import { ApiEndpointSpec, UserRole } from '../../types';
import { 
  ShieldCheck, 
  Terminal, 
  Key, 
  Check, 
  X, 
  Copy, 
  Play, 
  Lock, 
  Send, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const RbacApiExplorerView: React.FC = () => {
  const { currentUser, userProfiles, switchRole, jwtToken, hasPermission, setIsJwtModalOpen } = useMediFlow();
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointSpec>(API_ENDPOINTS[0]);
  const [apiExecutionResult, setApiExecutionResult] = useState<{
    status: number;
    statusText: string;
    body: object;
    latencyMs: number;
    authorized: boolean;
  } | null>(null);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // RBAC Matrix permissions to display
  const matrixPermissions = [
    { key: 'catalog:search', label: 'Catalog Browsing & Search', desc: 'Query catalog items with Redis caching' },
    { key: 'orders:create', label: 'Create Requisition Orders', desc: 'Place hospital ward orders with atomic reservation' },
    { key: 'orders:approve', label: 'Approve Clinical Orders', desc: 'Authorize medicine release for wards' },
    { key: 'orders:allocate', label: 'Batch Allocation & Picking', desc: 'Assign physical serialization lots' },
    { key: 'orders:dispatch', label: 'Dispatch Cold-Chain Fleet', desc: 'Hand over to courier and start IoT tracking' },
    { key: 'orders:mark_delivered', label: 'Confirm Final Delivery', desc: 'Custody sign-off & physical stock decrement' },
    { key: 'inventory:adjust', label: 'Adjust Stock & Evict Cache', desc: 'Modify inventory levels and trigger cache invalidation' },
    { key: 'batch:manage', label: 'Register New Batches / Lots', desc: 'Add new manufacturing & expiry dates' },
    { key: 'concurrency:test', label: 'Execute Concurrency Labs', desc: 'Simulate high-load race conditions' },
    { key: 'redis:flush', label: 'Redis FLUSHDB Cache Admin', desc: 'Flush in-memory Redis cluster store' }
  ];

  const handleExecuteApi = () => {
    const isAuthorized = 
      selectedEndpoint.requiredRole === 'ANY' ||
      currentUser.role === selectedEndpoint.requiredRole ||
      currentUser.role === 'ADMIN';

    const latency = +(2.4 + Math.random() * 6.2).toFixed(1);

    if (isAuthorized) {
      setApiExecutionResult({
        status: selectedEndpoint.statusCode,
        statusText: selectedEndpoint.statusCode === 201 ? 'Created' : 'OK',
        body: selectedEndpoint.sampleResponseBody,
        latencyMs: latency,
        authorized: true
      });
    } else {
      setApiExecutionResult({
        status: 403,
        statusText: 'Forbidden',
        body: {
          error: 'Forbidden',
          statusCode: 403,
          message: `Access denied. Role '${currentUser.role}' does not possess required role '${selectedEndpoint.requiredRole}'.`,
          requiredPermission: selectedEndpoint.requiredRole,
          activeTokenTier: currentUser.tierLevel
        },
        latencyMs: latency,
        authorized: false
      });
    }
  };

  const curlCommand = `curl -X ${selectedEndpoint.method} "https://api.mediflow.internal${selectedEndpoint.path}" \\
  -H "Authorization: Bearer ${jwtToken.substring(0, 32)}..." \\
  -H "Content-Type: application/json"${
    selectedEndpoint.sampleRequestBody ? ` \\\n  -d '${JSON.stringify(selectedEndpoint.sampleRequestBody)}'` : ''
  }`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            JWT RBAC Matrix & RESTful API Explorer
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-violet-500/10 text-violet-400 border border-violet-500/20">
              4 Permission Tiers
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Access Control matrix across the full order lifecycle with live Swagger API runner
          </p>
        </div>

        <button
          onClick={() => setIsJwtModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-950/50 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Key className="w-4 h-4" />
          Inspect Current Decoded JWT
        </button>
      </div>

      {/* 4-Tier RBAC Matrix Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Four-Tier Role-Based Access Control (RBAC) Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Current active role column is highlighted. Click any role header to test permissions dynamically.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/90 border-b border-slate-800">
              <tr>
                <th className="p-3 text-[10px] uppercase text-slate-400 tracking-wider w-1/3">
                  Capability / Operational Scope
                </th>
                {(['ADMIN', 'INVENTORY_MANAGER', 'PROCUREMENT', 'LOGISTICS'] as UserRole[]).map((roleKey) => {
                  const prof = userProfiles[roleKey];
                  const isCurrent = currentUser.role === roleKey;

                  return (
                    <th
                      key={roleKey}
                      onClick={() => switchRole(roleKey)}
                      className={`p-3 text-center cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-indigo-950/50 border-x border-indigo-500/40'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="font-bold text-white font-sans text-xs">
                        {prof.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Tier {prof.tierLevel} &bull; {prof.role}
                      </div>
                      {isCurrent && (
                        <span className="inline-block mt-1 text-[9px] px-2 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Now
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {matrixPermissions.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-sans">
                    <div className="font-semibold text-white text-xs">{perm.label}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{perm.desc}</div>
                  </td>

                  {(['ADMIN', 'INVENTORY_MANAGER', 'PROCUREMENT', 'LOGISTICS'] as UserRole[]).map((roleKey) => {
                    const prof = userProfiles[roleKey];
                    const isCurrent = currentUser.role === roleKey;
                    const isGranted = prof.permissions.includes('system:all') || prof.permissions.includes(perm.key);

                    return (
                      <td
                        key={roleKey}
                        className={`p-3 text-center ${
                          isCurrent ? 'bg-indigo-950/30 border-x border-indigo-500/20' : ''
                        }`}
                      >
                        {isGranted ? (
                          <span className="inline-flex p-1 rounded-full bg-emerald-500/10 text-emerald-400">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-full bg-slate-800/60 text-slate-600">
                            <X className="w-4 h-4" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REST API Explorer (Swagger / Postman Style) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              RESTful Microservice API Explorer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive endpoints protected by Golang JWT authentication middleware
            </p>
          </div>
        </div>

        {/* Endpoints Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {API_ENDPOINTS.map((ep) => {
            const isSelected = selectedEndpoint.id === ep.id;
            const methodColors = {
              GET: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
              POST: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              PATCH: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
              DELETE: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            };

            return (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep);
                  setApiExecutionResult(null);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">
                    {ep.requiredRole}
                  </span>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-200 truncate">
                  {ep.path}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Endpoint Runner Panel */}
        <div className="p-4 sm:p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                  selectedEndpoint.method === 'GET' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                  selectedEndpoint.method === 'POST' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                  'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {selectedEndpoint.method}
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {selectedEndpoint.path}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedEndpoint.summary}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyCurl}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCurl ? 'Copied' : 'cURL'}
              </button>
              <button
                onClick={handleExecuteApi}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-950/50 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Send Request
              </button>
            </div>
          </div>

          {/* Request Headers & Payload info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                Request Headers (Injected with Bearer JWT)
              </span>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 space-y-1 overflow-x-auto">
                <div><span className="text-slate-500">Authorization:</span> Bearer {jwtToken.substring(0, 24)}...</div>
                <div><span className="text-slate-500">Content-Type:</span> application/json</div>
                <div><span className="text-slate-500">X-Hospital-Tenant:</span> mediflow-st-jude-trauma</div>
              </div>
            </div>

            {selectedEndpoint.sampleRequestBody && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-1">
                  JSON Request Body
                </span>
                <pre className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-cyan-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedEndpoint.sampleRequestBody, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Execution Response */}
          {apiExecutionResult && (
            <div className="pt-2 border-t border-slate-800 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded font-bold ${
                    apiExecutionResult.authorized
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {apiExecutionResult.status} {apiExecutionResult.statusText}
                  </span>
                  <span className="text-slate-400">Time: {apiExecutionResult.latencyMs}ms</span>
                </div>
                <span className="text-slate-500">HTTP/1.1</span>
              </div>

              <pre className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto max-h-60 leading-relaxed ${
                apiExecutionResult.authorized
                  ? 'bg-slate-900 border-slate-800 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
              }`}>
                {JSON.stringify(apiExecutionResult.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
