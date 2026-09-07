import React, { useState } from 'react';
import { useMediFlow } from '../context/MediFlowContext';
import { UserRole } from '../types';
import { isSoundEnabled, setSoundEnabled, playSound } from '../utils/soundEffects';
import { 
  Activity, 
  Shield, 
  Key, 
  ShoppingCart, 
  Box, 
  Database, 
  Github, 
  ChevronDown, 
  Check, 
  Zap, 
  HeartHandshake,
  Volume2,
  VolumeX
} from 'lucide-react';

interface HeaderProps {
  onOpenCart: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const { 
    currentUser, 
    userProfiles, 
    switchRole, 
    setIsJwtModalOpen, 
    setIsDockerModalOpen, 
    cart, 
    redisTelemetry 
  } = useMediFlow();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [audioActive, setAudioActive] = useState(isSoundEnabled());

  const toggleAudio = () => {
    const next = !audioActive;
    setAudioActive(next);
    setSoundEnabled(next);
    if (next) playSound('BEEP');
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    INVENTORY_MANAGER: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    PROCUREMENT: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    LOGISTICS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top micro-bar for system status */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Golang REST API :8080 Healthy
          </span>
          <span className="hidden md:inline-block text-slate-600">|</span>
          <span className="hidden md:flex items-center gap-1.5 text-cyan-300">
            <Zap className="w-3 h-3 text-cyan-400" />
            Redis Cache: <strong className="text-white">{redisTelemetry.hitRatePercent}%</strong> Hit Ratio (3.2ms avg)
          </span>
          <span className="hidden lg:inline-block text-slate-600">|</span>
          <span className="hidden lg:flex items-center gap-1.5 text-slate-300">
            <Database className="w-3 h-3 text-indigo-400" />
            PostgreSQL 16 &bull; Mutex Row-Locks Active
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Docker Modal Button */}
          <button
            onClick={() => setIsDockerModalOpen(true)}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <Box className="w-3 h-3 text-cyan-400" />
            Docker Services (5)
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/yourhandle/mediflow"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
          >
            <Github className="w-3 h-3" />
            <span>github.com/yourhandle/mediflow</span>
          </a>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-900/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse-subtle" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                MediFlow
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v1.4 PROD
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Full-Stack Medical Inventory & Order Management Platform
            </p>
          </div>
        </div>

        {/* Right Action Controls: Role Switcher, JWT Token Pill, Cart */}
        <div className="flex items-center gap-2.5">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              audioActive 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-800/80 text-slate-500 border-slate-700'
            }`}
            title={audioActive ? 'Mute Interface Sound Effects' : 'Enable Medical Audio Feedback'}
          >
            {audioActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* JWT Inspector Trigger */}
          <button
            onClick={() => setIsJwtModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-medium transition-all"
            title="Inspect Live Decoded JWT Token and RBAC scopes"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>JWT / Tier {currentUser.tierLevel}</span>
          </button>

          {/* Cart Requisition Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Open Hospital Requisition Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-slate-950 animate-bounce">
                {cartTotalItems}
              </span>
            )}
          </button>

          {/* Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-600"
              />
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                  {currentUser.name}
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${roleColors[currentUser.role].bg} ${roleColors[currentUser.role].text} border ${roleColors[currentUser.role].border}`}>
                    Tier {currentUser.tierLevel}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {currentUser.roleTitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Switch 4-Tier RBAC Role
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Experience platform permission gates as different hospital staff
                  </p>
                </div>
                <div className="p-1.5 space-y-1">
                  {(Object.keys(userProfiles) as UserRole[]).map((roleKey) => {
                    const profile = userProfiles[roleKey];
                    const isSelected = currentUser.role === roleKey;
                    const style = roleColors[roleKey];

                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          switchRole(roleKey);
                          playSound('CLICK');
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full p-2 rounded-lg text-left flex items-start gap-2.5 transition-colors ${
                          isSelected ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50'
                        }`}
                      >
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-7 h-7 rounded-full object-cover mt-0.5 border border-slate-700"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold text-white truncate">
                              {profile.name}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${style.bg} ${style.text} border ${style.border}`}>
                              T{profile.tierLevel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{profile.roleTitle}</p>
                          <p className="text-[10px] text-slate-500 truncate">{profile.department}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
