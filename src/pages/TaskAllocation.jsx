import React, { useState } from 'react';
import { 
  GitFork, 
  Cpu, 
  Radio, 
  Gavel, 
  Award, 
  MessageSquare, 
  CheckCircle, 
  ShieldAlert, 
  BarChart, 
  Sparkles,
  Info
} from 'lucide-react';
import BiddingPanel from '../components/BiddingPanel';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function TaskAllocation({ simulationEngine, simulationState, onOpenBenchmarkModal }) {
  const [activeView, setActiveView] = useState('LIVE'); // LIVE, MATRIX, COMPARISON

  const isCentralized = simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED;
  const costMatrix = simulationState.costMatrix || [];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner with Active Mode Switcher */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <GitFork className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              Task Allocation &amp; Multi-Agent Coordination Laboratory
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Directly test and observe the operational differences between <strong>Mode A (Centralized Master Dispatch)</strong> and <strong>Mode B (Decentralized Contract Net Protocol)</strong>.
          </p>
        </div>

        {/* Big Strategy Switch Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBenchmarkModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-semibold text-xs font-mono transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Side-by-Side Benchmark</span>
          </button>

          <button
            onClick={() => {
              simulationEngine.setStrategy(
                isCentralized ? ALLOCATION_STRATEGIES.DECENTRALIZED : ALLOCATION_STRATEGIES.CENTRALIZED
              );
            }}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
              isCentralized
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
            }`}
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Switch to {isCentralized ? 'Contract Net Protocol' : 'Centralized Dispatch'}</span>
          </button>
        </div>
      </div>

      {/* Mode Status Pill */}
      <div className={`p-4 rounded-xl border flex items-center justify-between font-mono text-xs ${
        isCentralized
          ? 'bg-blue-950/30 border-blue-600/40 text-blue-200'
          : 'bg-emerald-950/30 border-emerald-600/40 text-emerald-200'
      }`}>
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 rounded-full bg-current animate-ping" />
          <span>
            CURRENTLY ACTIVE: <strong>{isCentralized ? 'MODE A &bull; CENTRALIZED DISPATCH' : 'MODE B &bull; DECENTRALIZED AUCTION (CONTRACT NET)'}</strong>
          </span>
        </div>
        <span className="text-[11px] opacity-80">
          {isCentralized ? 'Message Complexity: O(1) per task' : 'Message Complexity: O(N) per task'}
        </span>
      </div>

      {/* Main Content Area */}
      {isCentralized ? (
        /* MODE A: CENTRALIZED DISPATCH DETAILS */
        <div className="space-y-6">
          <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-mono font-bold text-white text-base flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  Central Master Controller &bull; Global Cost Function
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Cost(R, O) = 1.0 &times; Dist(R, Pickup) + 0.4 &times; Dist(Pickup, Dock) + 0.2 &times; (100 - Battery%) - PriorityBonus
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                {costMatrix.length} Robot-Order Evaluated Pairs
              </span>
            </div>

            {/* Cost Matrix Table */}
            {costMatrix.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No active orders requiring dispatch at this tick. Order queue is clear or all AMRs are currently busy.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                      <th className="py-2.5">Candidate Robot</th>
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Dist to Pickup</th>
                      <th className="py-2.5">Dist to Dock</th>
                      <th className="py-2.5">Battery</th>
                      <th className="py-2.5 text-right">Computed Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {costMatrix.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2.5 text-slate-200 font-semibold">{item.robot.name} ({item.robot.id})</td>
                        <td className="py-2.5 text-cyan-400">{item.order.id}</td>
                        <td className="py-2.5 text-slate-300">{item.distToPickup} cells</td>
                        <td className="py-2.5 text-slate-300">{item.distDelivery} cells</td>
                        <td className="py-2.5 text-slate-300">{item.battery}%</td>
                        <td className="py-2.5 text-right font-bold text-blue-300">
                          {item.totalCost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MODE B: DECENTRALIZED AUCTION (CONTRACT NET) DETAILS */
        <div className="space-y-6">
          <BiddingPanel
            simulationEngine={simulationEngine}
            simulationState={simulationState}
          />
        </div>
      )}

      {/* Academic Architecture Comparison Matrix */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-xl">
        <h3 className="font-mono font-bold text-white text-base mb-4 flex items-center gap-2">
          <BarChart className="w-4 h-4 text-cyan-400" />
          Comparative AI Architecture Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#0E1526] text-slate-400 border-b border-slate-800 text-[11px] uppercase">
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4 text-blue-400">Mode A: Centralized Dispatch</th>
                <th className="py-3 px-4 text-emerald-400">Mode B: Contract Net Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Decision Authority</td>
                <td className="py-3 px-4">Single omniscient warehouse master server</td>
                <td className="py-3 px-4">Autonomous distributed robot agents</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Message Overhead</td>
                <td className="py-3 px-4 text-emerald-400">Very Low: 1 message per dispatch</td>
                <td className="py-3 px-4 text-rose-400">High: O(N) CFP + Bids + Award + Acks</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Single Point of Failure (SPOF)</td>
                <td className="py-3 px-4 text-rose-400">Yes: Central server failure stops entire system</td>
                <td className="py-3 px-4 text-emerald-400">No: Fault-tolerant, surviving peers continue</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Local Perception Respect</td>
                <td className="py-3 px-4">Relies on telemetry reports</td>
                <td className="py-3 px-4">Robots evaluate private state &amp; battery internally</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">Scalability Horizon</td>
                <td className="py-3 px-4">Limited by master controller CPU &amp; state matrix</td>
                <td className="py-3 px-4">Highly scalable via sub-auctions &amp; multicast zones</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
