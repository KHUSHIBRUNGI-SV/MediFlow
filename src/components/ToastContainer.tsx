import React from 'react';
import { useMediFlow } from '../context/MediFlowContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useMediFlow();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          SUCCESS: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          WARNING: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          ERROR: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          INFO: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        };

        const borderColors = {
          SUCCESS: 'border-emerald-500/30 bg-slate-900/95 shadow-emerald-950/40',
          WARNING: 'border-amber-500/30 bg-slate-900/95 shadow-amber-950/40',
          ERROR: 'border-rose-500/40 bg-slate-900/95 shadow-rose-950/40',
          INFO: 'border-cyan-500/30 bg-slate-900/95 shadow-cyan-950/40'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border ${borderColors[toast.type]} shadow-xl flex items-start gap-3 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-white tracking-wide">{toast.title}</h4>
                <span className="text-[10px] text-slate-500 font-mono">{toast.timestamp}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
