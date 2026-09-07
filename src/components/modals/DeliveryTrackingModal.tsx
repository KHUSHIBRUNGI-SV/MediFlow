import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useMediFlow } from '../../context/MediFlowContext';
import { Order } from '../../types';
import { playSound } from '../../utils/soundEffects';
import { 
  Truck, 
  Thermometer, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  X, 
  Navigation,
  FileText,
  Zap,
  Snowflake
} from 'lucide-react';

interface DeliveryTrackingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  order?: Order | null;
}

export const DeliveryTrackingModal: React.FC<DeliveryTrackingModalProps> = ({ 
  isOpen, 
  onClose, 
  order: propOrder 
}) => {
  const { selectedOrderForTracking, setSelectedOrderForTracking, updateOrderStatus, hasPermission } = useMediFlow();
  const [boostedCooling, setBoostedCooling] = useState(false);

  const order = propOrder || selectedOrderForTracking;
  const isVisible = isOpen !== undefined ? isOpen : !!selectedOrderForTracking;

  if (!isVisible || !order || !order.deliveryTracking) return null;

  const tracking = order.deliveryTracking;

  const handleClose = () => {
    if (onClose) onClose();
    setSelectedOrderForTracking(null);
  };

  // Mock thermal readings timeline (last 6 hours)
  const thermalReadings = [
    { time: '07:30', temp: 3.5 },
    { time: '07:50', temp: 3.7 },
    { time: '08:10', temp: 3.9 },
    { time: '08:30', temp: 3.8 },
    { time: '08:45', temp: 3.7 },
    { time: 'Now', temp: boostedCooling ? +(tracking.currentTempCelsius - 0.5).toFixed(1) : tracking.currentTempCelsius }
  ];

  const handleDeliver = () => {
    updateOrderStatus(order.id, 'DELIVERED');
    playSound('SUCCESS');
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleToggleCooling = () => {
    setBoostedCooling(!boostedCooling);
    playSound('CLICK');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Live Cold-Chain Dispatch & Telemetry</h2>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold font-mono ${
                  order.status === 'DELIVERED' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 animate-pulse'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Order {order.orderNumber} &bull; Tracking #{tracking.trackingNumber}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Real-time stats banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* IoT Temperature Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              boostedCooling ? 'bg-cyan-950/40 border-cyan-400/50 shadow-md shadow-cyan-900/20' : 'bg-slate-800/60 border-blue-500/20'
            }`}>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span className="flex items-center gap-1 font-semibold text-blue-300">
                  <Thermometer className="w-4 h-4 text-blue-400" />
                  IoT Thermal Sensor
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  SAFE RANGE
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {thermalReadings[thermalReadings.length - 1].temp}°C
                </span>
                <span className="text-xs text-slate-400">
                  Target: {tracking.targetTempMin}°C &ndash; {tracking.targetTempMax}°C
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  0 Excursions Logged
                </div>
                <button
                  onClick={handleToggleCooling}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all flex items-center gap-1 ${
                    boostedCooling 
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm shadow-cyan-400/50'
                      : 'bg-slate-800 text-cyan-300 border-cyan-500/30 hover:bg-slate-700'
                  }`}
                  title="Simulate Peltier refrigeration thermoelectric booster"
                >
                  <Snowflake className="w-3 h-3" />
                  {boostedCooling ? 'Booster ON (-0.5°C)' : 'Cooling Boost'}
                </button>
              </div>
            </div>

            {/* Courier info */}
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1 font-semibold flex items-center gap-1">
                <Truck className="w-4 h-4 text-slate-400" />
                Transport Unit
              </div>
              <p className="text-white font-bold">{tracking.courierName}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{tracking.vehicleId}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                <span>Driver: {tracking.driverName}</span>
                <a href={`tel:${tracking.driverPhone}`} className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Call
                </a>
              </div>
            </div>

            {/* ETA & Destination */}
            <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
              <div className="text-xs text-slate-400 mb-1 font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                Estimated Arrival
              </div>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {order.status === 'DELIVERED' ? 'Delivered' : `${tracking.etaMinutes} mins`}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                {tracking.destinationHospital}
              </p>
            </div>
          </div>

          {/* Mini Thermal Sensor Chart */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                Continuous Thermal Sensor Telemetry (Active Cold Box)
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Interval: 15 min &bull; Sensor BLE #TC-8890
              </span>
            </div>
            <div className="h-28 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-800 relative">
              {/* Safe zone indicator lines */}
              <div className="absolute top-3 left-0 right-0 border-t border-dashed border-red-500/30 flex justify-end pr-2 text-[10px] text-red-400 font-mono">
                Upper Limit: 8.0°C
              </div>
              <div className="absolute bottom-6 left-0 right-0 border-t border-dashed border-blue-500/30 flex justify-end pr-2 text-[10px] text-blue-400 font-mono">
                Lower Limit: 2.0°C
              </div>

              {thermalReadings.map((pt, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 z-10">
                  <span className="text-[11px] font-mono font-bold text-cyan-300">
                    {pt.temp}°C
                  </span>
                  <div 
                    className="w-full max-w-[28px] bg-gradient-to-t from-cyan-600/40 to-cyan-400 rounded-t-sm transition-all"
                    style={{ height: `${(pt.temp / 8) * 60}px` }}
                  ></div>
                  <span className="text-[10px] font-mono text-slate-500">{pt.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Checkpoints Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              Route Waypoints & Custody Chain Verification
            </h3>
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {tracking.checkpoints.map((cp, idx) => (
                <div key={cp.id} className="relative flex items-start gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                    cp.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    {cp.completed ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs">{idx + 1}</span>}
                  </div>
                  <div className="flex-1 bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-white">{cp.status}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {cp.location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono text-slate-300 block">{cp.timestamp}</span>
                      {cp.temperatureReading && (
                        <span className="text-[11px] font-mono text-blue-400">
                          Reading: {cp.temperatureReading}°C
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cargo Manifest Items */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Manifest Cargo Payload
            </h3>
            <div className="divide-y divide-slate-800 text-xs font-mono">
              {order.items.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="text-white font-semibold">{item.name}</span>
                    <span className="text-slate-500 ml-2">[{item.sku}]</span>
                    {item.allocatedBatch && (
                      <span className="text-cyan-400 text-[11px] ml-2">Batch: {item.allocatedBatch}</span>
                    )}
                  </div>
                  <div className="text-slate-300">
                    Qty: <span className="text-emerald-400 font-bold">{item.quantity} units</span> &bull; ${ (item.unitPrice * item.quantity).toFixed(2) }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Cryptographic delivery verification enabled via QR handover
          </div>
          <div className="flex gap-2">
            {order.status === 'DISPATCHED' && hasPermission('orders:mark_delivered') && (
              <button
                onClick={handleDeliver}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm Final Delivery & Sign Receipt
              </button>
            )}
            <button
              onClick={() => setSelectedOrderForTracking(null)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
