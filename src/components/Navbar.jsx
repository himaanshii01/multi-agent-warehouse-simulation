import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Plus, 
  PlusCircle, 
  Radio, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Bot
} from 'lucide-react';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function Navbar({ 
  simulationEngine, 
  simulationState, 
  onOpenCustomOrderModal,
  onOpenBenchmarkModal
}) {
  const isRunning = simulationState.isRunning;
  const isCentralized = simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED;

  return (
    <header className="h-16 bg-[#0E1526]/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Simulation Primary Controls */}
      <div className="flex items-center space-x-3">
        {/* Play / Pause */}
        <button
          onClick={() => (isRunning ? simulationEngine.pause() : simulationEngine.start())}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ${
            isRunning
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 shadow-amber-500/10'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pause Sim' : 'Start Sim'}</span>
        </button>

        {/* Single Step button (when paused) */}
        {!isRunning && (
          <button
            onClick={() => simulationEngine.step()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            title="Advance exactly one simulation tick"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>
        )}

        {/* Reset */}
        <button
          onClick={() => simulationEngine.reset()}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          title="Reset Simulation to Initial State"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Speed Multiplier Pills */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 space-x-1">
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              onClick={() => simulationEngine.setSpeed(spd)}
              className={`px-2 py-1 text-xs font-mono font-medium rounded transition-all ${
                simulationState.speedMultiplier === spd
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Strategy Switch Dropdown / Button */}
        <div className="hidden lg:flex items-center ml-2 pl-3 border-l border-slate-800">
          <button
            onClick={() => {
              simulationEngine.setStrategy(
                isCentralized ? ALLOCATION_STRATEGIES.DECENTRALIZED : ALLOCATION_STRATEGIES.CENTRALIZED
              );
            }}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
              isCentralized
                ? 'bg-blue-950/70 border-blue-600/40 text-blue-300 hover:border-blue-500'
                : 'bg-emerald-950/70 border-emerald-600/40 text-emerald-300 hover:border-emerald-500'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Algorithm: {isCentralized ? 'Centralized Dispatch' : 'Contract Net Protocol'}</span>
          </button>
        </div>
      </div>

      {/* Right: Quick Action Buttons & Real-time Metrics */}
      <div className="flex items-center space-x-3">
        {/* Quick Benchmark Comparison Launcher */}
        <button
          onClick={onOpenBenchmarkModal}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-cyan-600/20 hover:from-purple-600/30 hover:to-cyan-600/30 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-medium transition-all shadow-sm"
          title="Run head-to-head scientific benchmark experiment"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Compare Strategies</span>
        </button>

        {/* Quick Add Order */}
        <button
          onClick={() => {
            const ord = simulationEngine.orderManager.createOrder({ createdAtTick: simulationEngine.currentTick });
            simulationEngine.logEvent('TASK', `Quick order generated [${ord.id}] (${ord.productName}). Priority: ${ord.priority}.`);
            simulationEngine.notifyUpdate();
          }}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Random Order</span>
        </button>

        {/* Quick Add Custom Order */}
        <button
          onClick={onOpenCustomOrderModal}
          className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Custom Order</span>
        </button>

        {/* Live Telemetry Chips */}
        <div className="hidden xl:flex items-center space-x-2 pl-2 border-l border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300" title="Total messages exchanged">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Msgs: <strong className="text-white">{simulationState.communicationMessages}</strong></span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300" title="Collisions avoided">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Avoided: <strong className="text-emerald-400">{simulationState.collisionsAvoided}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}
