/**
 * Order & Task Management Module
 * 
 * Manages customer order generation, priority queues, lifecycle statuses,
 * and deterministic scenario seeding for scientific benchmarking.
 */

import { PRODUCT_CATALOG } from './WarehouseGridModel.js';

export const ORDER_PRIORITIES = {
  LOW: { label: 'Low', weight: 1, color: 'text-slate-400', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  NORMAL: { label: 'Normal', weight: 2, color: 'text-blue-400', badge: 'bg-blue-950/60 text-blue-300 border-blue-800' },
  HIGH: { label: 'High', weight: 3, color: 'text-amber-400', badge: 'bg-amber-950/60 text-amber-300 border-amber-800' },
  CRITICAL: { label: 'Critical', weight: 4, color: 'text-rose-400', badge: 'bg-rose-950/60 text-rose-300 border-rose-800' }
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ANNOUNCED: 'ANNOUNCED',
  BIDDING: 'BIDDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export class OrderManager {
  constructor() {
    this.orders = [];
    this.completedOrders = [];
    this.nextOrderNumber = 101;
  }

  reset() {
    this.orders = [];
    this.completedOrders = [];
    this.nextOrderNumber = 101;
  }

  /**
   * Generates a realistic warehouse fulfillment order
   */
  createOrder(customData = {}) {
    const randomProduct = PRODUCT_CATALOG[Math.floor(Math.random() * PRODUCT_CATALOG.length)];
    const id = customData.id || `ORD-${this.nextOrderNumber++}`;

    // Available pickup bays (Inbound receiving row 14)
    const pickupBays = [
      { x: 2, y: 14, name: 'PICK-1' },
      { x: 6, y: 14, name: 'PICK-2' },
      { x: 10, y: 14, name: 'PICK-3' },
      { x: 14, y: 14, name: 'PICK-4' }
    ];

    // Available delivery docks (Outbound shipping row 0)
    const deliveryDocks = [
      { x: 2, y: 0, name: 'DOCK-1' },
      { x: 6, y: 0, name: 'DOCK-2' },
      { x: 10, y: 0, name: 'DOCK-3' },
      { x: 14, y: 0, name: 'DOCK-4' }
    ];

    const pickup = customData.pickupPos || pickupBays[Math.floor(Math.random() * pickupBays.length)];
    const delivery = customData.deliveryPos || deliveryDocks[Math.floor(Math.random() * deliveryDocks.length)];

    const priorities = ['LOW', 'NORMAL', 'NORMAL', 'HIGH', 'CRITICAL'];
    const priority = customData.priority || priorities[Math.floor(Math.random() * priorities.length)];

    const order = {
      id,
      productName: customData.productName || randomProduct.name,
      category: customData.category || randomProduct.category,
      sku: customData.sku || randomProduct.id,
      weight: customData.weight || randomProduct.weight,
      pickupPos: { x: pickup.x, y: pickup.y, name: pickup.name || 'Pickup Bay' },
      deliveryPos: { x: delivery.x, y: delivery.y, name: delivery.name || 'Outbound Dock' },
      priority,
      status: ORDER_STATUS.PENDING,
      assignedRobotId: null,
      createdAtTick: customData.createdAtTick || 0,
      assignedAtTick: null,
      completedAtTick: null,
      completionDuration: null,
      allocationMode: null, // CENTRALIZED or DECENTRALIZED
      bidData: null // Stores auction proposals if decentralized
    };

    this.orders.push(order);
    return order;
  }

  /**
   * Generates a standardized batch of orders for fair benchmark comparison
   */
  generateBenchmarkBatch(count = 12, startTick = 0) {
    this.reset();
    const batch = [];
    const fixedSeeds = [
      { prod: 0, pick: 0, dock: 0, priority: 'HIGH' },
      { prod: 1, pick: 1, dock: 2, priority: 'NORMAL' },
      { prod: 2, pick: 2, dock: 1, priority: 'CRITICAL' },
      { prod: 3, pick: 3, dock: 3, priority: 'LOW' },
      { prod: 4, pick: 0, dock: 2, priority: 'NORMAL' },
      { prod: 5, pick: 1, dock: 0, priority: 'HIGH' },
      { prod: 6, pick: 2, dock: 3, priority: 'NORMAL' },
      { prod: 7, pick: 3, dock: 1, priority: 'CRITICAL' },
      { prod: 1, pick: 0, dock: 1, priority: 'LOW' },
      { prod: 3, pick: 2, dock: 0, priority: 'HIGH' },
      { prod: 5, pick: 1, dock: 3, priority: 'NORMAL' },
      { prod: 7, pick: 3, dock: 2, priority: 'NORMAL' }
    ];

    const pickupBays = [
      { x: 2, y: 14, name: 'PICK-1' },
      { x: 6, y: 14, name: 'PICK-2' },
      { x: 10, y: 14, name: 'PICK-3' },
      { x: 14, y: 14, name: 'PICK-4' }
    ];

    const deliveryDocks = [
      { x: 2, y: 0, name: 'DOCK-1' },
      { x: 6, y: 0, name: 'DOCK-2' },
      { x: 10, y: 0, name: 'DOCK-3' },
      { x: 14, y: 0, name: 'DOCK-4' }
    ];

    for (let i = 0; i < Math.min(count, fixedSeeds.length); i++) {
      const s = fixedSeeds[i];
      const prod = PRODUCT_CATALOG[s.prod];
      const ord = this.createOrder({
        id: `BENCH-${101 + i}`,
        productName: prod.name,
        category: prod.category,
        sku: prod.id,
        weight: prod.weight,
        pickupPos: pickupBays[s.pick],
        deliveryPos: deliveryDocks[s.dock],
        priority: s.priority,
        createdAtTick: startTick
      });
      batch.push(ord);
    }
    return batch;
  }

  getPendingOrders() {
    return this.orders.filter(
      o => o.status === ORDER_STATUS.PENDING || o.status === ORDER_STATUS.ANNOUNCED
    );
  }

  getActiveOrders() {
    return this.orders.filter(
      o => o.status === ORDER_STATUS.ASSIGNED || o.status === ORDER_STATUS.IN_PROGRESS
    );
  }

  markCompleted(orderId, currentTick) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = ORDER_STATUS.COMPLETED;
      order.completedAtTick = currentTick;
      order.completionDuration = currentTick - (order.createdAtTick || 0);
      this.completedOrders.push({ ...order });
    }
    return order;
  }
}
