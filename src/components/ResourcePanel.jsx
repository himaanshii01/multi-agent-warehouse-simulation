import React from 'react';
import { Shield, Lock, Unlock, Users, Clock, Zap, ArrowRight } from 'lucide-react';

export default function ResourcePanel({ simulationEngine, simulationState }) {
  const resources = simulationState.resources || [];

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-[#131D30] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
            Shared Resource Mutex &amp; Arbitration
          </h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800 font-mono">
          {resources.filter(r => r.currentOwner).length} Active Locks
        </span>
      </div>

      {/* Grid of Shared Critical Resources */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {resources.map((res) => {
          const isLocked = Boolean(res.currentOwner);
          const ownerRobot = simulationState.robots.find(r => r.id === res.currentOwner);
          const queueLength = res.waitingQueue.length;

          return (
            <div
              key={res.id}
              className={`p-3.5 rounded-lg border transition-all ${
                queueLength > 0
                  ? 'bg-rose-950/20 border-rose-600/40'
                  : isLocked
                  ? 'bg-amber-950/20 border-amber-600/40'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {isLocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <h4 className="font-mono font-bold text-xs text-slate-200">
                    {res.name}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    [{res.x}, {res.y}]
                  </span>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold border ${
                  queueLength > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                  isLocked ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {queueLength > 0 ? `CONTESTED (${queueLength} in queue)` : isLocked ? 'LOCKED' : 'AVAILABLE'}
                </span>
              </div>

              {/* Current Owner Details */}
              <div className="flex items-center justify-between text-xs font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60">
                <span className="text-slate-400 text-[11px]">Current Grantee:</span>
                {ownerRobot ? (
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ownerRobot.color }} />
                    {ownerRobot.name} ({ownerRobot.id})
                    <span className="text-[10px] text-slate-400">held for {simulationState.currentTick - (res.lockedAtTick || 0)} ticks</span>
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">None (Passage Unrestricted)</span>
                )}
              </div>

              {/* Waiting Queue Table / List */}
              {queueLength > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] font-mono">
                  <div className="text-rose-400 font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Arbitration Priority Queue:
                  </div>
                  <div className="space-y-1">
                    {res.waitingQueue.map((item, idx) => (
                      <div
                        key={item.robotId}
                        className="flex items-center justify-between bg-slate-900/90 px-2 py-1 rounded border border-slate-800 text-[10px]"
                      >
                        <span className="text-slate-300">
                          #{idx + 1} {item.robotName} ({item.robotId})
                        </span>
                        <div className="flex items-center space-x-2 text-slate-400">
                          <span>Waited: {item.waitTicks} ticks</span>
                          <span className="text-amber-400 font-bold">Priority: {item.priorityScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
