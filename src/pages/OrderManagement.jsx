import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  Filter, 
  ArrowRight, 
  Truck, 
  Tag, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ORDER_PRIORITIES, ORDER_STATUS } from '../simulation/OrderManager';
import { PRODUCT_CATALOG } from '../simulation/WarehouseGridModel';

export default function OrderManagement({ 
  simulationEngine, 
  simulationState, 
  onOpenCustomOrderModal 
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const orders = simulationState.orders;
  const completedOrders = simulationState.completedOrders;

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && o.priority !== priorityFilter) return false;
    return true;
  });

  const handleChangePriority = (orderId, newPriority) => {
    const ord = simulationEngine.orderManager.orders.find(o => o.id === orderId);
    if (ord && ord.status !== ORDER_STATUS.COMPLETED) {
      ord.priority = newPriority;
      simulationEngine.logEvent(
        'TASK',
        `Operator updated priority of Order [${ord.id}] to [${newPriority}].`
      );
      simulationEngine.notifyUpdate();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <Package className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-mono text-white tracking-wide">
              Warehouse Order &amp; Fulfillment Dispatch
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Manage incoming SKU fulfillment requests, prioritize urgent deliveries, and trace order progress from inbound receiving to outbound shipping docks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const newOrd = simulationEngine.orderManager.createOrder({
                createdAtTick: simulationEngine.currentTick
              });
              simulationEngine.logEvent('TASK', `New random order [${newOrd.id}] (${newOrd.productName}) enqueued.`);
              simulationEngine.notifyUpdate();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs font-mono transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Random Order</span>
          </button>

          <button
            onClick={onOpenCustomOrderModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs font-mono border border-slate-700 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Add Custom Order</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0E1526] px-4 py-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {/* Status filters */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {['ALL', 'PENDING', 'BIDDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 text-[11px]">Priority:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'NORMAL', 'LOW'].map((prio) => (
            <button
              key={prio}
              onClick={() => setPriorityFilter(prio)}
              className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                priorityFilter === prio
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {prio}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#0D1426] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Logistics Route</th>
                <th className="py-3 px-4">Priority (Editable)</th>
                <th className="py-3 px-4">Assigned Robot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Turnaround</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                    No orders match selected filter criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const priorityInfo = ORDER_PRIORITIES[order.priority] || ORDER_PRIORITIES.NORMAL;
                  const assignedRobot = simulationState.robots.find(r => r.id === order.assignedRobotId);

                  return (
                    <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                      {/* Order ID */}
                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {order.id}
                      </td>

                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">
                          {order.productName}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          SKU: {order.sku} &bull; {order.weight}kg
                        </div>
                      </td>

                      {/* Logistics Route */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <span className="text-emerald-400 font-semibold">{order.pickupPos.name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-600" />
                          <span className="text-cyan-400 font-semibold">{order.deliveryPos.name}</span>
                        </div>
                      </td>

                      {/* Priority selector */}
                      <td className="py-3 px-4">
                        {order.status === 'COMPLETED' ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityInfo.badge}`}>
                            {order.priority}
                          </span>
                        ) : (
                          <select
                            value={order.priority}
                            onChange={(e) => handleChangePriority(order.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-cyan-500"
                          >
                            <option value="CRITICAL">CRITICAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="NORMAL">NORMAL</option>
                            <option value="LOW">LOW</option>
                          </select>
                        )}
                      </td>

                      {/* Assigned AMR */}
                      <td className="py-3 px-4">
                        {assignedRobot ? (
                          <span className="flex items-center space-x-1.5 font-semibold">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: assignedRobot.color }} />
                            <span className="text-white">{assignedRobot.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                          order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          order.status === 'IN_PROGRESS' || order.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          order.status === 'BIDDING' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Turnaround / Duration */}
                      <td className="py-3 px-4 text-right text-slate-400">
                        {order.status === 'COMPLETED' ? (
                          <span className="text-emerald-400 font-bold">
                            {order.completionDuration} ticks
                          </span>
                        ) : (
                          <span>Created #T{order.createdAtTick}</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
