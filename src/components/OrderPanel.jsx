import React, { useState } from 'react';
import { Package, Plus, CheckCircle2, Clock, Truck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { ORDER_PRIORITIES } from '../simulation/OrderManager';

export default function OrderPanel({ 
  simulationEngine, 
  simulationState, 
  onOpenCustomModal 
}) {
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED

  const allOrders = simulationState.orders;
  const completedOrders = simulationState.completedOrders;

  const filteredOrders = allOrders.filter(ord => {
    if (filter === 'ACTIVE') return ord.status !== 'COMPLETED';
    if (filter === 'COMPLETED') return ord.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="bg-[#111827] rounded-xl border border-slate-800 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#131D30]">
        <div className="flex items-center space-x-2">
          <Package className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-sm text-white font-mono uppercase tracking-wider">
            Order Fulfillment Pipeline
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {allOrders.filter(o => o.status !== 'COMPLETED').length} Active
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              simulationEngine.orderManager.createOrder({ createdAtTick: simulationEngine.currentTick });
              simulationEngine.notifyUpdate();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>+ Random</span>
          </button>
          <button
            onClick={onOpenCustomModal}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
          >
            <span>Custom Order</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-slate-800 bg-[#0E1526] flex items-center space-x-2 text-xs font-mono">
        {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2.5 py-1 rounded transition-all ${
              filter === tab
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-slate-500 text-[11px]">
          Total Delivered: <strong className="text-emerald-400">{completedOrders.length}</strong>
        </span>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-mono">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
            No orders in current view
          </div>
        ) : (
          filteredOrders.map((order) => {
            const priorityInfo = ORDER_PRIORITIES[order.priority] || ORDER_PRIORITIES.NORMAL;
            const assignedRobot = simulationState.robots.find(r => r.id === order.assignedRobotId);

            return (
              <div
                key={order.id}
                className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
              >
                {/* Order Top Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-300">
                      {order.id}
                    </span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${priorityInfo.badge}`}>
                      {order.priority}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                    order.status === 'BIDDING' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Product Name */}
                <div className="font-medium text-slate-200 mb-2">
                  {order.productName}
                  <span className="text-[10px] text-slate-500 font-mono ml-2">SKU: {order.sku}</span>
                </div>

                {/* Logistics Route */}
                <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950/60 p-2 rounded border border-slate-800/50 mb-2">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{order.pickupPos.name} ({order.pickupPos.x},{order.pickupPos.y})</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <div className="flex items-center space-x-1 text-cyan-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{order.deliveryPos.name} ({order.deliveryPos.x},{order.deliveryPos.y})</span>
                  </div>
                </div>

                {/* Bottom Row: Assigned Robot & Duration */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <div>
                    {assignedRobot ? (
                      <span className="text-slate-300 flex items-center gap-1">
                        Assigned: 
                        <strong className="text-white" style={{ color: assignedRobot.color }}>
                          {assignedRobot.name}
                        </strong>
                        {order.allocationMode && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {order.allocationMode === 'CENTRALIZED' ? 'Dispatch' : 'CNP Bid'}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-400/80 italic">Awaiting allocation...</span>
                    )}
                  </div>

                  <div>
                    {order.status === 'COMPLETED' ? (
                      <span className="text-emerald-400 font-semibold">
                        Completed in {order.completionDuration} ticks
                      </span>
                    ) : (
                      <span>Created tick #{order.createdAtTick}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
