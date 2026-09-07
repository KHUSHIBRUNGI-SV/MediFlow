import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  ShoppingBag, 
  Truck, 
  Cpu, 
  Database, 
  ShieldCheck 
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'inventory'
  | 'catalog'
  | 'orders'
  | 'concurrency'
  | 'redis'
  | 'rbac_api';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onSelectTab?: (tab: ActiveTab) => void;
  pendingOrdersCount?: number;
  lowStockCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  setActiveTab,
  onSelectTab,
  pendingOrdersCount = 0,
  lowStockCount = 0
}) => {
  const handleSelect = (tab: ActiveTab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'System Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Inventory & Batches',
      icon: Layers,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'catalog' as ActiveTab,
      label: 'Catalog & Requisitions',
      icon: ShoppingBag,
      badge: null
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Orders & Cold-Chain',
      icon: Truck,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} Active` : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'concurrency' as ActiveTab,
      label: 'Concurrency & Locks Lab',
      icon: Cpu,
      badge: 'Live Test',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'redis' as ActiveTab,
      label: 'Redis & Architecture',
      icon: Database,
      badge: '84.7% Cache',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'rbac_api' as ActiveTab,
      label: 'RBAC & API Explorer',
      icon: ShieldCheck,
      badge: 'REST/JWT',
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
    }
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 sticky top-[69px] z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-bold border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
