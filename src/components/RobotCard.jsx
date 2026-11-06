import React from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Zap, 
  AlertOctagon, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Package, 
  Power,
  RotateCw
} from 'lucide-react';

export default function RobotCard({ 
  robot, 
  onTriggerFailure, 
  onRecover, 
  onRouteCharger,
  isSelected,
  onSelect 
}) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'IDLE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'BIDDING': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'MOVING_TO_PICKUP':
      case 'MOVING_TO_DELIVERY': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'PICKING_UP':
      case 'DELIVERING': return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'WAITING_RESOURCE': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'RETURNING_TO_CHARGER':
      case 'CHARGING': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const batteryColor = 
    robot.battery > 50 ? 'bg-emerald-500' : 
    robot.battery > 20 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div 
      onClick={onSelect}
      className={`rounded-xl bg-[#111827] border p-4 transition-all cursor-pointer relative overflow-hidden ${
        isSelected 
          ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10' 
          : 'border-slate-800 hover:border-slate-700 hover:bg-[#131D30]'
      }`}
    >
      {/* Top Header: ID, Name & Status Pill */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div 
            className="w-3.5 h-3.5 rounded-full ring-2 ring-slate-800 shrink-0" 
            style={{ backgroundColor: robot.color }} 
          />
          <div>
            <h3 className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
              {robot.name}
              <span className="text-[10px] text-slate-400 font-normal">({robot.id})</span>
            </h3>
          </div>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${getStatusColor(robot.status)}`}>
          {robot.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Battery Gauge */}
      <div className="mb-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono mb-1.5">
          <span className="flex items-center gap-1 text-slate-400">
            {robot.status === 'CHARGING' ? (
              <BatteryCharging className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-slate-400" />
            )}
            Battery Level
          </span>
          <span className={`font-bold ${robot.battery < 20 ? 'text-rose-400' : 'text-slate-200'}`}>
            {Math.round(robot.battery)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 rounded-full ${batteryColor}`}
            style={{ width: `${Math.max(3, robot.battery)}%` }}
          />
        </div>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-3">
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/50">
          <span className="text-slate-500 block text-[10px]">Position:</span>
          <span className="text-cyan-400 font-semibold">[{robot.x}, {robot.y}]</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/50">
          <span className="text-slate-500 block text-[10px]">Distance:</span>
          <span className="text-slate-200 font-semibold">{robot.distanceTravelled} cells</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/50">
          <span className="text-slate-500 block text-[10px]">Deliveries:</span>
          <span className="text-emerald-400 font-semibold">{robot.ordersCompleted} orders</span>
        </div>
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800/50">
          <span className="text-slate-500 block text-[10px]">Collisions Avoided:</span>
          <span className="text-amber-400 font-semibold">{robot.collisionsAvoided} times</span>
        </div>
      </div>

      {/* Active Assignment / Payload */}
      <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 mb-3 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono mb-1">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3 text-cyan-400" />
            Current Assignment
          </span>
          {robot.carryingCargo && (
            <span className="text-amber-400 font-semibold uppercase text-[9px] px-1 bg-amber-500/10 border border-amber-500/20 rounded">
              Loaded
            </span>
          )}
        </div>
        {robot.currentOrder ? (
          <div>
            <p className="font-semibold text-slate-200 truncate">
              {robot.currentOrder.id}: {robot.currentOrder.productName}
            </p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Destination: {robot.carryingCargo ? robot.currentOrder.deliveryPos.name : robot.currentOrder.pickupPos.name}
            </p>
          </div>
        ) : (
          <p className="text-slate-500 italic text-[11px]">No active assignment</p>
        )}
      </div>

      {/* Fault Injection & Recovery Controls */}
      <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/80">
        {robot.isFailed ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRecover(robot.id);
            }}
            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCw className="w-3 h-3" />
            <span>Recover AMR</span>
          </button>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTriggerFailure(robot.id);
              }}
              className="flex-1 py-1 px-2 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-400 text-[11px] font-medium flex items-center justify-center gap-1 transition-all"
              title="Simulate motor / hardware breakdown"
            >
              <AlertOctagon className="w-3 h-3" />
              <span>Simulate Failure</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRouteCharger(robot.id);
              }}
              disabled={robot.status === 'CHARGING' || robot.status === 'RETURNING_TO_CHARGER'}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 text-[11px] font-medium flex items-center gap-1 transition-all"
              title="Send to charging pad"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Charge</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
