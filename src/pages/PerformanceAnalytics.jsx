import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Activity, 
  AlertOctagon, 
  RotateCw,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { ALLOCATION_STRATEGIES } from '../simulation/SimulationEngine';

export default function PerformanceAnalytics({ 
  simulationEngine, 
  simulationState, 
  onOpenBenchmarkModal 
}) {
  const isCentralized = simulationState.strategy === ALLOCATION_STRATEGIES.CENTRALIZED;
  const history = simulationState.metricHistory || [];

  // Current real measured values from simulation
  const completedOrders = simulationState.completedOrders;
  const totalMessages = simulationState.communicationMessages;
  const collisionsAvoided = simulationState.collisionsAvoided;
  const avgCompletionTime = parseFloat(simulationState.avgCompletionDuration) || 0;
  const fleetUtilization = simulationState.fleetUtilization;
  const totalDistance = simulationState.robots.reduce((acc, r) => acc + r.distanceTravelled, 0);
  const reassignedTasks = simulationState.reassignedTasks;

  // Real data for comparison bar charts
  const comparisonBarData = [
    {
      metric: 'Comm Msgs',
      current: totalMessages,
      unit: 'msgs'
    },
    {
      metric: 'Avg Turnaround',
      current: avgCompletionTime,
      unit: 'ticks'
    },
    {
      metric: 'Utilization',
      current: fleetUtilization,
      unit: '%'
    },
    {
      metric: 'Avoided Collisions',
      current: collisionsAvoided,
      unit: 'events'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Banner */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              Empirical Performance Analytics &amp; Comparative Benchmarks
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Continuously tracked telemetry measuring <strong>Throughput</strong>, <strong>Turnaround Latency</strong>, <strong>Communication Overhead</strong>, <strong>Collision Prevention</strong>, and <strong>Failure Robustness</strong>.
          </p>
        </div>

        <button
          onClick={onOpenBenchmarkModal}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs font-mono transition-all shadow-lg shadow-purple-500/20 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>Run Controlled Benchmark</span>
        </button>
      </div>

      {/* Real Live Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Throughput</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {completedOrders.length}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Delivered orders</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Avg Completion Time</span>
          <div className="text-2xl font-bold font-mono text-white">
            {avgCompletionTime} <span className="text-xs text-slate-500">ticks</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Order latency</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Message Overhead</span>
          <div className="text-2xl font-bold font-mono text-purple-400">
            {totalMessages}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Network packets</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Total Distance</span>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {totalDistance} <span className="text-xs text-slate-500">cells</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">AMR travel sum</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Collisions Avoided</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {collisionsAvoided}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Dynamic safety yield</span>
        </div>

        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-mono text-slate-400 block mb-1">Task Robustness</span>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {reassignedTasks}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Fault reallocations</span>
        </div>
      </div>

      {/* Real Timeseries Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders Completed & Distance Over Time */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Cumulative Throughput &amp; Fleet Distance (Time-Series)
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Live Measured
            </span>
          </div>

          <div className="h-64">
            {history.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="tick" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area type="monotone" dataKey="completedOrders" name="Orders Delivered" stroke="#10B981" fillOpacity={1} fill="url(#colorThroughput)" />
                  <Area type="monotone" dataKey="totalDistance" name="Distance (Cells)" stroke="#06B6D4" fillOpacity={1} fill="url(#colorDistance)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-mono text-slate-500">
                Run simulation for a few ticks to accumulate timeseries curves...
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Message Overhead & Fleet Utilization */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              Communication Overhead &amp; Utilization %
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Active Strategy: {isCentralized ? 'Centralized' : 'Decentralized'}
            </span>
          </div>

          <div className="h-64">
            {history.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="tick" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="messages" name="Comm Messages" stroke="#A855F7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="utilization" name="Fleet Utilization (%)" stroke="#38BDF8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-mono text-slate-500">
                Awaiting telemetry samples...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Failure Robustness Testing Section */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <h3 className="font-mono font-bold text-white text-sm uppercase tracking-wider">
              Robustness &amp; Fault Tolerance Experimentation
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800">
            {simulationState.robots.filter(r => r.isFailed).length} Failed Units Currently
          </span>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-4">
          Academic testing objective: Evaluate how both coordination models respond when an AMR suffers an abrupt hardware malfunction during order fulfillment. In centralized mode, the master controller reclaims the order for the next cycle. In decentralized mode, surviving peer agents re-negotiate via Contract Net Protocol.
        </p>

        {/* Robot Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {simulationState.robots.map((robot) => (
            <div
              key={robot.id}
              className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                robot.isFailed ? 'bg-rose-950/30 border-rose-600/40' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <span className="font-bold text-slate-200 block">{robot.name}</span>
                <span className={`text-[10px] ${robot.isFailed ? 'text-rose-400 font-semibold' : 'text-slate-500'}`}>
                  {robot.isFailed ? 'FAULT ACTIVE' : 'HEALTHY'}
                </span>
              </div>

              {robot.isFailed ? (
                <button
                  onClick={() => simulationEngine.recoverRobot(robot.id)}
                  className="px-2 py-1 rounded bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold hover:bg-emerald-600/30"
                >
                  Recover
                </button>
              ) : (
                <button
                  onClick={() => simulationEngine.triggerRobotFailure(robot.id)}
                  className="px-2 py-1 rounded bg-rose-600/10 border border-rose-500/30 text-rose-400 text-[10px] hover:bg-rose-600/20"
                >
                  Fail Robot
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400 font-mono">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-200 font-semibold">Simulated Environment Notice: </span>
          All metrics above are dynamically recorded from the active JavaScript discrete simulation loop inside your browser, using Manhattan distance metrics, deterministic A* path reservations, and simulated message counting.
        </div>
      </div>
    </div>
  );
}
