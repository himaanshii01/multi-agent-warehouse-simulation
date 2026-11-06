import React, { useState } from 'react';
import RobotCard from '../components/RobotCard';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Battery, 
  ShieldCheck, 
  Navigation, 
  AlertOctagon, 
  RotateCw,
  Activity,
  CheckCircle,
  Filter
} from 'lucide-react';

export default function RobotFleet({ 
  simulationEngine, 
  simulationState, 
  selectedRobotId, 
  setSelectedRobotId 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');

  const robots = simulationState.robots;

  const filteredRobots = robots.filter((r) => {
    if (statusFilter === 'IDLE') return r.status === 'IDLE';
    if (statusFilter === 'WORKING') return r.status.includes('MOVING') || r.status.includes('PICKING') || r.status.includes('DELIVERING');
    if (statusFilter === 'CHARGING') return r.status === 'CHARGING' || r.status === 'RETURNING_TO_CHARGER';
    if (statusFilter === 'FAILED') return r.isFailed;
    return true;
  });

  const selectedRobot = robots.find(r => r.id === selectedRobotId) || robots[0];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Fleet Telemetry Summary & Controls */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              Autonomous AMR Fleet Diagnostics
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Real-time telemetry, battery health, autonomous perception loop, and individual hardware fault injection for robustness analysis.
          </p>
        </div>

        {/* Fleet Sizing Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => simulationEngine.addRobot()}
            disabled={robots.length >= 8}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs font-mono transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Commission Robot</span>
          </button>

          {selectedRobot && robots.length > 2 && (
            <button
              onClick={() => simulationEngine.removeRobot(selectedRobot.id)}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-700 text-slate-300 hover:text-rose-300 text-xs font-mono transition-all"
              title="Decommission selected robot from fleet"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Decommission</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between bg-[#0E1526] px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter by State:
          </span>
          {['ALL', 'IDLE', 'WORKING', 'CHARGING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-[11px]">
          Total Fleet: <strong className="text-cyan-400">{robots.length} Units</strong> &bull; Showing: <strong className="text-white">{filteredRobots.length}</strong>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredRobots.map((robot) => (
          <RobotCard
            key={robot.id}
            robot={robot}
            isSelected={selectedRobot?.id === robot.id}
            onSelect={() => setSelectedRobotId(robot.id)}
            onTriggerFailure={(id) => simulationEngine.triggerRobotFailure(id)}
            onRecover={(id) => simulationEngine.recoverRobot(id)}
            onRouteCharger={(id) => {
              const r = simulationEngine.robots.find(item => item.id === id);
              if (r) r.routeToNearestCharger(simulationEngine);
              simulationEngine.notifyUpdate();
            }}
          />
        ))}
      </div>

      {/* Deep Telemetry Inspector for Selected Robot */}
      {selectedRobot && (
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded-full ring-4 ring-slate-800"
                style={{ backgroundColor: selectedRobot.color }}
              />
              <div>
                <h3 className="font-mono font-bold text-base text-white">
                  Telemetry Inspector: {selectedRobot.name} ({selectedRobot.id})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Autonomous State Machine: <strong className="text-cyan-400">{selectedRobot.status}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {selectedRobot.isFailed ? (
                <button
                  onClick={() => simulationEngine.recoverRobot(selectedRobot.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Restore AMR to Service</span>
                </button>
              ) : (
                <button
                  onClick={() => simulationEngine.triggerRobotFailure(selectedRobot.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-1.5"
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Simulate Motor Breakdown</span>
                </button>
              )}
            </div>
          </div>

          {/* Diagnostic Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">Spatial Coordinates:</span>
              <span className="text-cyan-400 text-sm font-bold">
                X: {selectedRobot.x}, Y: {selectedRobot.y}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Charger Dock: ({selectedRobot.homeChargerPos.x}, {selectedRobot.homeChargerPos.y})
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">A* Route Queue:</span>
              <span className="text-slate-200 text-sm font-bold">
                {selectedRobot.path.length} waypoints remaining
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Target: {selectedRobot.targetPos ? `(${selectedRobot.targetPos.x},${selectedRobot.targetPos.y})` : 'None'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">Lifetime Odometer:</span>
              <span className="text-emerald-400 text-sm font-bold">
                {selectedRobot.distanceTravelled} grid steps
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Deliveries: {selectedRobot.ordersCompleted} orders
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px] mb-1">Collision Safety:</span>
              <span className="text-amber-400 text-sm font-bold">
                {selectedRobot.collisionsAvoided} yields
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Wait Ticks: {selectedRobot.waitTicks}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
