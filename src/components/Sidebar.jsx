import React from 'react';
import { 
  LayoutDashboard, 
  PlayCircle, 
  Bot, 
  Package, 
  GitFork, 
  BarChart3, 
  BookOpen,
  Cpu,
  Wifi,
  Radio
} from 'lucide-react';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function Sidebar({ activeTab, setActiveTab, simulationState, onToggleStrategy }) {
  const navItems = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'simulation', label: 'Live Simulation', icon: PlayCircle },
    { id: 'fleet', label: 'Robot Fleet', icon: Bot },
    { id: 'orders', label: 'Order Management', icon: Package },
    { id: 'allocation', label: 'Task Allocation', icon: GitFork },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'explanation', label: 'AI System Guide', icon: BookOpen },
  ];

  const isCentralized = simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED;

  return (
    <aside className="w-64 bg-[#0D1322] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
                WAREHOUSE <span className="text-cyan-400">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">
                Multi-Agent Coordination Lab
              </p>
            </div>
          </div>

          {/* Strategy Indicator Badge */}
          <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                Coordination Mode
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {isCentralized ? 'Mode A' : 'Mode B'}
              </span>
            </div>
            <button
              onClick={onToggleStrategy}
              className={`w-full py-1.5 px-2 rounded font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isCentralized
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30'
                  : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30'
              }`}
              title="Click to toggle coordination algorithm"
            >
              <span>{isCentralized ? 'Centralized Dispatch' : 'Contract Net Protocol'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'simulation' && simulationState.isRunning && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Telemetry */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-2 font-mono">
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-emerald-400" /> System Uptime
          </span>
          <span className="text-slate-200">{simulationState.currentTick} ticks</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 font-mono">
          <span>Active AMRs</span>
          <span className="text-cyan-400 font-semibold">{simulationState.robots.length} Units</span>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center font-mono">
          AI Foundations Project &bull; v1.0
        </div>
      </div>
    </aside>
  );
}
