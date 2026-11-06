/**
 * Strategy A: Centralized Dispatch Controller
 * 
 * Architecture:
 * Single central master controller maintains global state knowledge of all robots
 * and pending fulfillment orders. Calculates global cost function and executes
 * minimum-cost matching.
 * 
 * Communication Overhead:
 * Low: Only 1 direct assignment command transmitted from Master to Robot.
 */

import { manhattanDistance } from './Pathfinding.js';
import { ORDER_STATUS } from './OrderManager.js';

export class CentralizedDispatcher {
  constructor() {
    this.totalDispatchMessages = 0;
    this.lastCostMatrix = [];
  }

  reset() {
    this.totalDispatchMessages = 0;
    this.lastCostMatrix = [];
  }

  /**
   * Main dispatch cycle executed by the central controller
   * 
   * @param {Object} simEngine - Active simulation instance
   */
  dispatchOrders(simEngine) {
    const pendingOrders = simEngine.orderManager.orders.filter(
      o => o.status === ORDER_STATUS.PENDING
    );
    if (pendingOrders.length === 0) return;

    // Filter eligible robots: must be IDLE, not failed, battery >= 25%
    const availableRobots = simEngine.robots.filter(
      r => r.status === 'IDLE' && !r.isFailed && r.battery >= 25 && !r.currentOrder
    );
    if (availableRobots.length === 0) return;

    // 1. Sort pending orders by priority first (CRITICAL > HIGH > NORMAL > LOW)
    const priorityWeights = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };
    pendingOrders.sort(
      (a, b) => (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
    );

    const costMatrix = [];

    // 2. Calculate Assignment Cost Matrix
    // For each (Robot, Order) pair:
    // Cost = w1 * Dist(Robot, Pickup) + w2 * Dist(Pickup, Dock) + w3 * (100 - Battery) - PriorityBonus
    for (const order of pendingOrders) {
      for (const robot of availableRobots) {
        const distToPickup = manhattanDistance({ x: robot.x, y: robot.y }, order.pickupPos);
        const distDelivery = manhattanDistance(order.pickupPos, order.deliveryPos);

        const wDist = 1.0;
        const wDelivery = 0.4;
        const wBattery = 0.2; // Penalize lower battery
        const batteryPenalty = ((100 - robot.battery) / 100) * (wBattery * 30);
        const priorityBonus = (priorityWeights[order.priority] || 2) * 5;

        const totalCost = Math.max(
          1,
          Math.round((wDist * distToPickup + wDelivery * distDelivery + batteryPenalty - priorityBonus) * 10) / 10
        );

        costMatrix.push({
          robot,
          order,
          distToPickup,
          distDelivery,
          battery: Math.round(robot.battery),
          totalCost
        });
      }
    }

    this.lastCostMatrix = costMatrix;

    // 3. Minimum-Cost Greedy Assignment
    costMatrix.sort((a, b) => a.totalCost - b.totalCost);

    const assignedRobotIds = new Set();
    const assignedOrderIds = new Set();

    for (const match of costMatrix) {
      if (assignedRobotIds.has(match.robot.id) || assignedOrderIds.has(match.order.id)) {
        continue;
      }

      // Assign task to robot
      assignedRobotIds.add(match.robot.id);
      assignedOrderIds.add(match.order.id);

      match.order.status = ORDER_STATUS.ASSIGNED;
      match.order.assignedRobotId = match.robot.id;
      match.order.assignedAtTick = simEngine.currentTick;
      match.order.allocationMode = 'CENTRALIZED';

      match.robot.assignOrder(match.order, simEngine);

      // Communication overhead: 1 message (Direct command dispatch)
      this.totalDispatchMessages += 1;
      simEngine.communicationMessages += 1;

      simEngine.logEvent(
        'TASK',
        `[CENTRALIZED DISPATCH] Master Controller assigned Order [${match.order.id}] (${match.order.productName}) to Robot ${match.robot.name} (Calculated Cost: ${match.totalCost}).`,
        {
          robotId: match.robot.id,
          orderId: match.order.id,
          cost: match.totalCost,
          distToPickup: match.distToPickup
        }
      );
    }
  }
}
