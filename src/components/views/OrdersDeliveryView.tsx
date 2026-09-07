import React, { useState } from 'react';
import { useMediFlow } from '../../context/MediFlowContext';
import { Order, OrderStatus } from '../../types';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  ShieldCheck, 
  MapPin, 
  UserCheck, 
  Box, 
  AlertTriangle, 
  ChevronRight,
  Filter
} from 'lucide-react';

interface OrdersDeliveryViewProps {
  onOpenTracking: (order: Order) => void;
}

export const OrdersDeliveryView: React.FC<OrdersDeliveryViewProps> = ({ onOpenTracking }) => {
  const { orders, updateOrderStatus, currentUser, hasPermission } = useMediFlow();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'ALL') return true;
    return order.status === statusFilter;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return { label: 'Pending Approval', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      case 'APPROVED':
        return { label: 'Approved (Ready to Pick)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
      case 'ALLOCATED_PICKED':
        return { label: 'Allocated & Packed', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
      case 'DISPATCHED':
        return { label: 'In Transit (Cold-Chain Active)', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse' };
      case 'DELIVERED':
        return { label: 'Delivered & Custody Verified', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'REJECTED':
        return { label: 'Rejected', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
      default:
        return { label: status, bg: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            Order Lifecycle & Cold-Chain Dispatch
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {orders.length} Total Orders
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Requisition approvals, batch allocation, IoT thermal telemetry, and multi-tier chain of custody
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_APPROVAL', label: 'Pending' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'ALLOCATED_PICKED', label: 'Packed' },
            { id: 'DISPATCHED', label: 'In Transit' },
            { id: 'DELIVERED', label: 'Delivered' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Orders in this Status</p>
            <p className="text-xs text-slate-500 mt-1">Select another filter tab or create a new order.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4 transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-white">{order.orderNumber}</span>
                    <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    {order.priority === 'CRITICAL' && (
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase">
                        CRITICAL STAT
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 font-mono">
                    Created: {order.createdAt}
                  </div>
                </div>

                {/* Body info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Requisitioning Ward & Physician
                    </span>
                    <p className="font-semibold text-white mt-0.5">{order.requisitionBy}</p>
                    <p className="text-slate-400 mt-0.5">{order.department}</p>
                    {order.notes && (
                      <p className="text-slate-500 italic mt-1 text-[11px]">
                        &ldquo;{order.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Cargo Items & Batches
                    </span>
                    <div className="mt-1 space-y-1 font-mono">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-slate-300 flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="text-cyan-400">{item.allocatedBatch || 'Batch Pending'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Order Financials & Lifecycle
                    </span>
                    <div className="text-lg font-bold font-mono text-white">
                      ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    {order.approvedBy && (
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {order.approvedBy}
                      </div>
                    )}
                    {order.deliveryTracking && (
                      <div className="text-[11px] text-blue-400 flex items-center gap-1 font-mono">
                        <Thermometer className="w-3.5 h-3.5" /> Temp: {order.deliveryTracking.currentTempCelsius}°C &bull; ETA {order.deliveryTracking.etaMinutes}m
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer / Lifecycle Transition Controls */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Role Permissions Gate: Act as Pharmacist, Admin, or Dispatcher to advance status</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Actions based on pipeline stage */}
                    {order.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'APPROVED')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Approve Requisition
                      </button>
                    )}

                    {order.status === 'APPROVED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ALLOCATED_PICKED')}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Box className="w-3.5 h-3.5" />
                        Allocate Batches & Pack
                      </button>
                    )}

                    {order.status === 'ALLOCATED_PICKED' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DISPATCHED')}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Dispatch Refrigerated Fleet
                      </button>
                    )}

                    {order.deliveryTracking && (
                      <button
                        onClick={() => onOpenTracking(order)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                        Live Cold-Chain Telemetry ({order.deliveryTracking.currentTempCelsius}°C)
                      </button>
                    )}

                    {order.status === 'DISPATCHED' && hasPermission('orders:mark_delivered') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sign & Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
