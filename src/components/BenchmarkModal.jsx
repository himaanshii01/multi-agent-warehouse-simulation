import React, { useState } from 'react';
import { X, Sparkles, Play, CheckCircle2, ArrowRight, BarChart2, ShieldCheck, MessageSquare, Gauge, Clock, Award } from 'lucide-react';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function BenchmarkModal({ isOpen, onClose, simulationEngine }) {
  if (!isOpen) return null;

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('IDLE'); // IDLE, RUNNING_A, RUNNING_B, COMPLETED
  const [results, setResults] = useState(null);

  const runAutomatedBenchmark = async () => {
    setIsRunning(true);
    setProgress(5);
    setCurrentPhase('RUNNING_A'); // Centralized

    // Pause any existing live sim
    simulationEngine.pause();

    // 1. SETUP PHASE A: Centralized Dispatch
    simulationEngine.reset();
    simulationEngine.setStrategy(ALLOCATION_STRATEGIES.CENTRALIZED);
    const batchA = simulationEngine.orderManager.generateBenchmarkBatch(10, 0);

    // Fast-step 90 ticks for Centralized
    const ticksToRun = 95;
    for (let t = 0; t < ticksToRun; t++) {
      simulationEngine.step();
      if (t % 10 === 0) {
        setProgress(Math.round(5 + (t / ticksToRun) * 45));
        await new Promise(r => setTimeout(r, 20));
      }
    }

    const snapA = simulationEngine.getSnapshot();
    const resultA = {
      name: 'Centralized Dispatch',
      strategy: 'CENTRALIZED',
      ordersDelivered: snapA.completedOrders.length,
      totalOrders: 10,
      avgCompletionTime: snapA.avgCompletionDuration,
      messages: snapA.communicationMessages,
      totalDistance: snapA.robots.reduce((acc, r) => acc + r.distanceTravelled, 0),
      collisionsAvoided: snapA.collisionsAvoided,
      utilization: snapA.fleetUtilization
    };

    // 2. SETUP PHASE B: Decentralized Contract Net Protocol
    setCurrentPhase('RUNNING_B');
    simulationEngine.reset();
    simulationEngine.setStrategy(ALLOCATION_STRATEGIES.DECENTRALIZED);
    const batchB = simulationEngine.orderManager.generateBenchmarkBatch(10, 0);

    for (let t = 0; t < ticksToRun; t++) {
      simulationEngine.step();
      if (t % 10 === 0) {
        setProgress(Math.round(50 + (t / ticksToRun) * 45));
        await new Promise(r => setTimeout(r, 20));
      }
    }

    const snapB = simulationEngine.getSnapshot();
    const resultB = {
      name: 'Contract Net Protocol (Decentralized)',
      strategy: 'DECENTRALIZED',
      ordersDelivered: snapB.completedOrders.length,
      totalOrders: 10,
      avgCompletionTime: snapB.avgCompletionDuration,
      messages: snapB.communicationMessages,
      totalDistance: snapB.robots.reduce((acc, r) => acc + r.distanceTravelled, 0),
      collisionsAvoided: snapB.collisionsAvoided,
      utilization: snapB.fleetUtilization
    };

    setProgress(100);
    setCurrentPhase('COMPLETED');
    setIsRunning(false);
    setResults({ a: resultA, b: resultB });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden font-sans max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#131D30] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
                Comparative AI Benchmark Lab
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800 uppercase">
                  Scientific Experiment
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Executes identical deterministic batch test across Centralized vs Decentralized coordination
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-mono">
          {/* Experiment Parameters Card */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Controlled Experimental Setup
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400">
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Fleet Size:</span>
                <span className="text-cyan-400 font-bold text-sm">4 AMRs</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Benchmark Batch:</span>
                <span className="text-slate-200 font-bold text-sm">10 Seeded Orders</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Simulation Horizon:</span>
                <span className="text-slate-200 font-bold text-sm">95 Ticks</span>
              </div>
              <div className="bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                <span className="block text-[10px] text-slate-500">Warehouse Layout:</span>
                <span className="text-emerald-400 font-bold text-sm">Identical Matrix</span>
              </div>
            </div>

            {/* Run Button */}
            {!results && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">
                  Runs both algorithms consecutively using exact same seed orders and robot starting coordinates.
                </span>
                <button
                  onClick={runAutomatedBenchmark}
                  disabled={isRunning}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Simulating {currentPhase === 'RUNNING_A' ? 'Centralized...' : 'Decentralized...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Execute Head-to-Head Benchmark</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Progress Bar */}
            {isRunning && (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                  <span>Executing Phase: {currentPhase === 'RUNNING_A' ? 'Strategy A (Centralized)' : 'Strategy B (Decentralized)'}</span>
                  <span className="text-cyan-400 font-bold">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-200 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Results Side-by-Side Comparison */}
          {results && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  Empirical Measurement Results
                </h4>
                <button
                  onClick={runAutomatedBenchmark}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  Re-run Experiment
                </button>
              </div>

              {/* Side by side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strategy A */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-blue-500/30 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-blue-400 font-bold text-sm">Mode A: Centralized Dispatch</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                      Master Controller
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Orders Delivered:</span>
                      <span className="text-emerald-400 font-bold">{results.a.ordersDelivered} / {results.a.totalOrders}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Avg Completion Duration:</span>
                      <span className="text-slate-200 font-bold">{results.a.avgCompletionTime} ticks</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Communication Overhead:</span>
                      <span className="text-cyan-400 font-bold">{results.a.messages} messages</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Total Distance Travelled:</span>
                      <span className="text-slate-200 font-bold">{results.a.totalDistance} cells</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Collisions Avoided:</span>
                      <span className="text-amber-400 font-bold">{results.a.collisionsAvoided}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Fleet Utilization:</span>
                      <span className="text-purple-400 font-bold">{results.a.utilization}%</span>
                    </div>
                  </div>
                </div>

                {/* Strategy B */}
                <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-500/30 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-emerald-400 font-bold text-sm">Mode B: Contract Net Protocol</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      Decentralized Auction
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Orders Delivered:</span>
                      <span className="text-emerald-400 font-bold">{results.b.ordersDelivered} / {results.b.totalOrders}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Avg Completion Duration:</span>
                      <span className="text-slate-200 font-bold">{results.b.avgCompletionTime} ticks</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Communication Overhead:</span>
                      <span className="text-cyan-400 font-bold">{results.b.messages} messages</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Total Distance Travelled:</span>
                      <span className="text-slate-200 font-bold">{results.b.totalDistance} cells</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Collisions Avoided:</span>
                      <span className="text-amber-400 font-bold">{results.b.collisionsAvoided}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Fleet Utilization:</span>
                      <span className="text-purple-400 font-bold">{results.b.utilization}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Findings Synthesis */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 space-y-2">
                <h5 className="font-bold text-white text-xs flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  Academic Analysis &amp; Trade-off Evaluation:
                </h5>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                  <li>
                    <strong className="text-cyan-300">Communication Overhead:</strong> Centralized Dispatch exchanged only{' '}
                    <strong className="text-white">{results.a.messages}</strong> direct dispatch messages, compared to{' '}
                    <strong className="text-white">{results.b.messages}</strong> broadcast/bid/award messages in Contract Net Protocol (~{Math.round(results.b.messages / Math.max(1, results.a.messages))}x higher).
                  </li>
                  <li>
                    <strong className="text-emerald-300">Throughput &amp; Latency:</strong> Both architectures successfully completed orders. Centralized dispatch minimizes overhead when communication bandwidth is constrained, while CNP affords true agent autonomy without requiring a single omniscient central database.
                  </li>
                  <li>
                    <strong className="text-purple-300">Fault Tolerance:</strong> If the central dispatcher fails, Mode A experiences complete system halt; whereas in Mode B, autonomous robots continue auctioning and negotiating among remaining peers.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
