import React, { useState } from 'react';
import WarehouseCanvas from '../components/WarehouseCanvas';
import EventLog from '../components/EventLog';
import BiddingPanel from '../components/BiddingPanel';
import ResourcePanel from '../components/ResourcePanel';
import OrderPanel from '../components/OrderPanel';
import { 
  Terminal, 
  Gavel, 
  Shield, 
  Package, 
  Plus, 
  Bot, 
  AlertTriangle, 
  Maximize2,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function LiveSimulation({ 
  simulationEngine, 
  simulationState, 
  onOpenCustomOrderModal,
  onOpenBenchmarkModal,
  selectedRobotId,
  setSelectedRobotId 
}) {
  const [activeSideTab, setActiveSideTab] = useState('events'); // events, bidding, resources, orders

  const isCentralized = simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED;

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4 max-w-[1700px] mx-auto overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] border border-slate-800 px-4 py-2.5 rounded-xl shadow-md">
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-slate-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            TELEMETRY FEED
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">
            Tick: <strong className="text-white">#{simulationState.currentTick}</strong>
          </span>
          <span className="text-slate-400">
            Active Fleet: <strong className="text-cyan-400">{simulationState.robots.length} AMRs</strong>
          </span>
          <span className="text-slate-400">
            Strategy: <strong className={isCentralized ? 'text-blue-400' : 'text-emerald-400'}>
              {isCentralized ? 'Mode A (Centralized)' : 'Mode B (Contract Net)'}
            </strong>
          </span>
        </div>

        {/* Quick Simulation Intervention Buttons */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {/* Add AMR */}
          <button
            onClick={() => simulationEngine.addRobot()}
            disabled={simulationState.robots.length >= 8}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-40"
            title="Commission an additional autonomous AMR into the fleet"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ Add Robot</span>
          </button>

          {/* Quick Fault Trigger */}
          <button
            onClick={() => {
              const activeRobot = simulationState.robots.find(r => !r.isFailed && r.status !== 'CHARGING');
              if (activeRobot) {
                simulationEngine.triggerRobotFailure(activeRobot.id);
              }
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 transition-colors"
            title="Simulate motor lock failure on an active robot to test task reallocation"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Inject Fault</span>
          </button>

          {/* Benchmark comparison trigger */}
          <button
            onClick={onOpenBenchmarkModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare AI</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport (Canvas + Telemetry Panels) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left: 7 or 8 cols - Interactive Warehouse Canvas */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-0 h-full">
          <WarehouseCanvas
            simulationEngine={simulationEngine}
            simulationState={simulationState}
            onSelectRobot={(id) => setSelectedRobotId(id)}
            selectedRobotId={selectedRobotId}
          />
        </div>

        {/* Right: 5 or 4 cols - Industrial Diagnostic Tabs */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-[#111827] rounded-xl border border-slate-800 shadow-xl overflow-hidden min-h-0 h-full">
          {/* Tab Selector Header */}
          <div className="bg-[#0E1526] border-b border-slate-800 p-2 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-1 overflow-x-auto">
              <button
                onClick={() => setActiveSideTab('events')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeSideTab === 'events'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Event Log</span>
              </button>

              <button
                onClick={() => setActiveSideTab('bidding')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeSideTab === 'bidding'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>CNP Bids</span>
              </button>

              <button
                onClick={() => setActiveSideTab('resources')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeSideTab === 'resources'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Resources</span>
              </button>

              <button
                onClick={() => setActiveSideTab('orders')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeSideTab === 'orders'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Orders</span>
              </button>
            </div>
          </div>

          {/* Active Panel Viewport */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {activeSideTab === 'events' && (
              <EventLog
                simulationEngine={simulationEngine}
                simulationState={simulationState}
              />
            )}
            {activeSideTab === 'bidding' && (
              <BiddingPanel
                simulationEngine={simulationEngine}
                simulationState={simulationState}
              />
            )}
            {activeSideTab === 'resources' && (
              <ResourcePanel
                simulationEngine={simulationEngine}
                simulationState={simulationState}
              />
            )}
            {activeSideTab === 'orders' && (
              <OrderPanel
                simulationEngine={simulationEngine}
                simulationState={simulationState}
                onOpenCustomModal={onOpenCustomOrderModal}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
