import React, { useState } from 'react';
import { X, Package, ShieldAlert, ArrowRight, Check } from 'lucide-react';
import { PRODUCT_CATALOG } from '../simulation/WarehouseGridModel';

export default function CustomOrderModal({ isOpen, onClose, simulationEngine }) {
  if (!isOpen) return null;

  const [productId, setProductId] = useState(PRODUCT_CATALOG[0].id);
  const [priority, setPriority] = useState('NORMAL');
  const [pickupBayIdx, setPickupBayIdx] = useState(0);
  const [dockIdx, setDockIdx] = useState(0);

  const pickupBays = [
    { x: 2, y: 14, name: 'PICK-1 (West Inbound)' },
    { x: 6, y: 14, name: 'PICK-2 (Mid-West Inbound)' },
    { x: 10, y: 14, name: 'PICK-3 (Mid-East Inbound)' },
    { x: 14, y: 14, name: 'PICK-4 (East Inbound)' }
  ];

  const deliveryDocks = [
    { x: 2, y: 0, name: 'DOCK-1 (Express Shipping)' },
    { x: 6, y: 0, name: 'DOCK-2 (Regional Freight)' },
    { x: 10, y: 0, name: 'DOCK-3 (Intermodal Rail)' },
    { x: 14, y: 0, name: 'DOCK-4 (Air Cargo Bay)' }
  ];

  const selectedProduct = PRODUCT_CATALOG.find(p => p.id === productId) || PRODUCT_CATALOG[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOrd = simulationEngine.orderManager.createOrder({
      productName: selectedProduct.name,
      category: selectedProduct.category,
      sku: selectedProduct.id,
      weight: selectedProduct.weight,
      priority,
      pickupPos: pickupBays[pickupBayIdx],
      deliveryPos: deliveryDocks[dockIdx],
      createdAtTick: simulationEngine.currentTick
    });

    simulationEngine.logEvent(
      'TASK',
      `Custom customer order [${newOrd.id}] (${newOrd.productName}) injected by operator. Priority: ${newOrd.priority}.`
    );
    simulationEngine.notifyUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-[#131D30] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base font-mono">
                Dispatch Custom Warehouse Order
              </h3>
              <p className="text-xs text-slate-400">
                Specify product payload, priority weighting, and logistics route
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-mono">
          {/* Product Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Select Product SKU:
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {PRODUCT_CATALOG.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} &bull; {p.name} ({p.category} - {p.weight}kg)
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Fulfillment Priority:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map((prio) => (
                <button
                  type="button"
                  key={prio}
                  onClick={() => setPriority(prio)}
                  className={`py-2 px-2 rounded-lg border text-center font-bold transition-all ${
                    priority === prio
                      ? prio === 'CRITICAL'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                        : prio === 'HIGH'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : prio === 'NORMAL'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-700 border-slate-500 text-slate-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          {/* Route: Pickup & Delivery */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-emerald-400 font-semibold mb-1">
                Inbound Pickup Bay:
              </label>
              <select
                value={pickupBayIdx}
                onChange={(e) => setPickupBayIdx(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-[11px]"
              >
                {pickupBays.map((b, idx) => (
                  <option key={idx} value={idx}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-cyan-400 font-semibold mb-1">
                Outbound Shipping Dock:
              </label>
              <select
                value={dockIdx}
                onChange={(e) => setDockIdx(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-[11px]"
              >
                {deliveryDocks.map((d, idx) => (
                  <option key={idx} value={idx}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              Enqueue Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
