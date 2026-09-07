/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MediFlowProvider, useMediFlow } from './context/MediFlowContext';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { DashboardView } from './components/views/DashboardView';
import { InventoryView } from './components/views/InventoryView';
import { CatalogOrderView } from './components/views/CatalogOrderView';
import { OrdersDeliveryView } from './components/views/OrdersDeliveryView';
import { ConcurrencyLabView } from './components/views/ConcurrencyLabView';
import { RedisArchitectureView } from './components/views/RedisArchitectureView';
import { RbacApiExplorerView } from './components/views/RbacApiExplorerView';
import { JwtInspectorModal } from './components/modals/JwtInspectorModal';
import { DockerComposeModal } from './components/modals/DockerComposeModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';
import { DeliveryTrackingModal } from './components/modals/DeliveryTrackingModal';
import { CartRequisitionDrawer } from './components/modals/CartRequisitionDrawer';
import { NewProductModal } from './components/modals/NewProductModal';
import { ToastContainer } from './components/ToastContainer';
import { Product, Order } from './types';
import { Github, Database, Zap, Cpu, Box, ShieldCheck } from 'lucide-react';

const MediFlowMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);

  const {
    isJwtModalOpen,
    setIsJwtModalOpen,
    isDockerModalOpen,
    setIsDockerModalOpen,
    selectedOrderForTracking,
    setSelectedOrderForTracking,
    products,
    orders
  } = useMediFlow();

  const pendingOrdersCount = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'REJECTED').length;
  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel).length;

  const handleOpenAdjust = (product: Product) => {
    setProductToAdjust(product);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Application Header */}
      <Header onOpenCart={() => setIsCartOpen(true)} />

      {/* Primary Sub-Header Tab Navigation */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onSelectTab={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView 
                onNavigate={setActiveTab} 
                onOpenAdjust={handleOpenAdjust} 
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView 
                onOpenAdjust={handleOpenAdjust} 
                onOpenNewProduct={() => setIsNewProductModalOpen(true)} 
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogOrderView 
                onOpenCart={() => setIsCartOpen(true)} 
              />
            )}

            {activeTab === 'orders' && (
              <OrdersDeliveryView 
                onOpenTracking={(order) => setSelectedOrderForTracking(order)} 
              />
            )}

            {activeTab === 'concurrency' && (
              <ConcurrencyLabView />
            )}

            {activeTab === 'redis' && (
              <RedisArchitectureView />
            )}

            {(activeTab === 'rbac_api' || (activeTab as string) === 'rbac') && (
              <RbacApiExplorerView />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Modals & Drawers */}
      <JwtInspectorModal 
        isOpen={isJwtModalOpen} 
        onClose={() => setIsJwtModalOpen(false)} 
      />

      <DockerComposeModal 
        isOpen={isDockerModalOpen} 
        onClose={() => setIsDockerModalOpen(false)} 
      />

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setProductToAdjust(null);
        }}
        product={productToAdjust}
      />

      <DeliveryTrackingModal
        isOpen={!!selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
      />

      <NewProductModal
        isOpen={isNewProductModalOpen}
        onClose={() => setIsNewProductModalOpen(false)} 
      />

      <CartRequisitionDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderCreated={() => setActiveTab('orders')}
        onCheckoutSuccess={() => setActiveTab('orders')}
      />

      {/* Interactive Floating Notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">MediFlow</span>
            <span>&bull;</span>
            <span>Full-Stack Medical Inventory & Order Management Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Golang + Next.js
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-indigo-400" /> PostgreSQL 16
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Redis 7.2
            </span>
            <span className="flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-blue-400" /> Docker
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> JWT/RBAC
            </span>
            <a
              href="https://github.com/yourhandle/mediflow"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>github.com/yourhandle/mediflow</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <MediFlowProvider>
      <MediFlowMain />
    </MediFlowProvider>
  );
}
