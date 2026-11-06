import React from 'react';
import { 
  Bot, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  Activity, 
  Radio, 
  Play, 
  Pause, 
  Sparkles,
  ArrowUpRight,
  Clock,
  Layers
} from 'lucide-react';
import WarehouseCanvas from '../components/WarehouseCanvas';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function Overview({ 
  simulationEngine, 
  simulationState, 
  setActiveTab, 
  onOpenBenchmarkModal,
  onOpenCustomOrderModal 
}) {
  const isRunning = simulationState.isRunning;
  const isCentralized = simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED;

  const activeRobotsCount = simulationState.robots.filter(r => !r.isFailed).length;
  const idleRobotsCount = simulationState.robots.filter(r => r.status === 'IDLE').length;
  const workingRobotsCount = simulationState.robots.filter(r => r.status.includes('MOVING') || r.status.includes('PICKING') || r.status.includes('DELIVERING')).length;
  const chargingRobotsCount = simulationState.robots.filter(r => r.status === 'CHARGING' || r.status === 'RETURNING_TO_CHARGER').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & Mission Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#111C35] to-[#0A1224] rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-semibold">
                AI Foundations Project Simulation
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-semibold">
                Autonomous Multi-Agent AMRs
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Warehouse AI: Fleet Coordination System
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time multi-agent simulation evaluating <strong>Centralized Dispatch</strong> vs <strong>Decentralized Contract Net Protocol</strong> with A* collision-free routing, shared bottleneck arbitration, and fault resilience.
            </p>
          </div>

          {/* Quick Header CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBenchmarkModal}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Run Scientific Benchmark</span>
            </button>

            <button
              onClick={() => setActiveTab('simulation')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              <span>Live Command Center</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Active Robots */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Fleet Active</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {activeRobotsCount} <span className="text-xs text-slate-500 font-normal">/ {simulationState.robots.length}</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            {workingRobotsCount} Working &bull; {idleRobotsCount} Idle
          </div>
        </div>

        {/* Orders Delivered */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Delivered Orders</span>
            <Package className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {simulationState.completedOrders.length}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {simulationState.orders.filter(o => o.status !== 'COMPLETED').length} in pipeline
          </div>
        </div>

        {/* Avg Duration */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Avg Order Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {simulationState.avgCompletionDuration} <span className="text-xs text-slate-500 font-normal">ticks</span>
          </div>
          <div className="text-[11px] text-blue-400 font-mono mt-1">
            Turnaround metric
          </div>
        </div>

        {/* Communication Overhead */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Comm Messages</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {simulationState.communicationMessages}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {isCentralized ? '1 msg/dispatch' : 'CNP multi-cast'}
          </div>
        </div>

        {/* Collisions Avoided */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Collisions Avoided</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {simulationState.collisionsAvoided}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Vertex &amp; Swap yield
          </div>
        </div>

        {/* Fleet Utilization */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>Fleet Utilization</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {simulationState.fleetUtilization}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Active motion vs idle
          </div>
        </div>
      </div>

      {/* Main Split: Warehouse Live Mini-View & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Warehouse Canvas View */}
        <div className="lg:col-span-2 space-y-4">
          <WarehouseCanvas
            simulationEngine={simulationEngine}
            simulationState={simulationState}
            onSelectRobot={(id) => {
              setActiveTab('fleet');
            }}
          />
        </div>

        {/* Right 1 Col: Quick Control & Telemetry Feed */}
        <div className="space-y-4">
          {/* Quick Strategy Card */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 shadow-sm">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center justify-between">
              <span>Coordination Engine</span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                isCentralized ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}>
                {isCentralized ? 'CENTRALIZED' : 'DECENTRALIZED'}
              </span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {isCentralized
                ? 'Central Warehouse Master Controller computes minimum-cost matching across all idle robots. Optimal global cost with low message overhead.'
                : 'FIPA Contract Net Protocol: Task is announced via broadcast CFP. Each robot evaluates its own proposal bid based on battery and distance.'}
            </p>

            <button
              onClick={() => {
                simulationEngine.setStrategy(
                  isCentralized ? ALLOCATION_STRATEGIES.DECENTRALIZED : ALLOCATION_STRATEGIES.CENTRALIZED
                );
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold border border-slate-700 flex items-center justify-center gap-2 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Toggle Algorithm Mode</span>
            </button>
          </div>

          {/* Quick Fleet Status */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Fleet Diagnostics
              </h3>
              <button
                onClick={() => setActiveTab('fleet')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
              >
                View Fleet &rarr;
              </button>
            </div>

            <div className="space-y-2">
              {simulationState.robots.map((robot) => (
                <div
                  key={robot.id}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: robot.color }} />
                    <span className="font-semibold text-slate-200">{robot.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className={robot.battery < 20 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                      {Math.round(robot.battery)}%
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      robot.status === 'IDLE' ? 'text-emerald-400 bg-emerald-950/40' :
                      robot.status === 'FAILED' ? 'text-rose-400 bg-rose-950/40' :
                      'text-blue-400 bg-blue-950/40'
                    }`}>
                      {robot.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Event Feed */}
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Live Event Ticker
              </h3>
              <button
                onClick={() => setActiveTab('simulation')}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono"
              >
                Console &rarr;
              </button>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {simulationState.events.slice(0, 4).map((evt) => (
                <div key={evt.id} className="text-[11px] text-slate-300 truncate">
                  <span className="text-slate-500 font-mono">[{evt.timestamp}]</span>{' '}
                  <span className="text-cyan-400 font-semibold">{evt.category}:</span>{' '}
                  {evt.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
