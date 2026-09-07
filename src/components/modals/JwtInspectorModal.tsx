import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { playSound } from '../../utils/soundEffects';
import { Shield, Key, Copy, Check, Lock, AlertCircle, X } from 'lucide-react';

interface JwtInspectorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const JwtInspectorModal: React.FC<JwtInspectorModalProps> = ({ isOpen, onClose }) => {
  const { isJwtModalOpen, setIsJwtModalOpen, jwtToken, decodedJwt, currentUser } = useMediFlow();
  const [copied, setCopied] = useState(false);

  const isVisible = isOpen !== undefined ? isOpen : isJwtModalOpen;
  if (!isVisible) return null;

  const handleClose = () => {
    if (onClose) onClose();
    setIsJwtModalOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jwtToken);
    playSound('CLICK');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tokenParts = jwtToken.split('.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                JWT Authentication & RBAC Inspector
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Tier {currentUser.tierLevel} Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live cryptographic token decoded from Golang authentication middleware
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* User info banner */}
          <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-10 h-10 rounded-full border border-slate-600 object-cover" 
              />
              <div>
                <p className="font-semibold text-white">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.roleTitle} &bull; {currentUser.department}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Shield className="w-3.5 h-3.5" />
                Role: {currentUser.role}
              </span>
            </div>
          </div>

          {/* Encoded Token string */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Raw Encoded Bearer Token
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-750 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Token'}
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs break-all border border-slate-800 text-slate-300 leading-relaxed select-all">
              <span className="text-rose-400">{tokenParts[0]}</span>
              <span className="text-slate-600">.</span>
              <span className="text-violet-400">{tokenParts[1]}</span>
              <span className="text-slate-600">.</span>
              <span className="text-cyan-400">{tokenParts[2]}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Header (Algorithm & Token Type)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span> Payload (RBAC Claims & Scopes)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> HMAC-SHA256 Signature
              </span>
            </div>
          </div>

          {/* Decoded Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Header: Alg & Typ</h3>
              </div>
              <pre className="text-xs font-mono text-rose-300 overflow-x-auto">
                {JSON.stringify(decodedJwt.header, null, 2)}
              </pre>
            </div>

            {/* Signature status */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">Signature Verification</h3>
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">Verified via Golang JWT middleware secret key:</p>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-300 font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HMACSHA256 (Valid & Untampered)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Protected with high-entropy 256-bit secret stored in Docker container secrets.
                </p>
              </div>
            </div>
          </div>

          {/* Decoded Payload */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                  Decoded Payload Claims (RBAC Claims)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Permissions: {currentUser.permissions.length} granted
              </span>
            </div>
            <pre className="text-xs font-mono text-violet-300 overflow-x-auto max-h-56">
              {JSON.stringify(decodedJwt.payload, null, 2)}
            </pre>
          </div>

          {/* Active Permissions Badges */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Active RBAC Permission Scopes for this Token
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.permissions.map((perm) => (
                <span 
                  key={perm}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-slate-800 text-indigo-300 border border-slate-700/80 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>Switch roles in the top bar to inspect other tier tokens</span>
          </div>
          <button
            onClick={() => setIsJwtModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
