/**
 * Autonomous Multi-Agent Robot Model
 * 
 * Implements the core BDI (Belief-Desire-Intention) agent loop:
 * Perception -> State Update -> Decision Making -> Action
 */

import { manhattanDistance, findPathAStar } from './Pathfinding.js';
import { CELL_TYPES } from './WarehouseGridModel.js';

export class RobotAgent {
  constructor(config) {
    this.id = config.id || 'R-01';
    this.name = config.name || `Robot ${this.id}`;
    this.color = config.color || '#06B6D4'; // Cyan default
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.homeChargerPos = config.homeChargerPos || { x: config.x, y: config.y };

    // Telemetry & State
    this.battery = config.battery !== undefined ? config.battery : 100;
    this.status = 'IDLE'; // IDLE, BIDDING, MOVING_TO_PICKUP, PICKING_UP, MOVING_TO_DELIVERY, DELIVERING, RETURNING_TO_CHARGER, CHARGING, WAITING_RESOURCE, FAILED
    this.speed = 1; // 1 step per tick
    this.currentOrder = null;
    this.carryingCargo = false;
    this.path = [];
    this.targetPos = null;

    // Metrics tracking
    this.distanceTravelled = 0;
    this.ordersCompleted = 0;
    this.collisionsAvoided = 0;
    this.activeWorkTicks = 0;
    this.idleTicks = 0;
    this.waitTicks = 0;
    this.blockedTicks = 0;

    // Flags
    this.isFailed = false;
    this.failureReason = null;
    this.isTemporarilyYielding = false;
    this.isWaitingResource = false;
    this.reservedResourceId = null;
    this.actionProgress = 0; // For multi-tick pickup / delivery operations
    this.biddingHistory = []; // { orderId, bidValue, factors, won, timestamp }
  }

  /**
   * PERCEPTION:
   * Senses local environment, battery status, surrounding obstacles,
   * active orders, and shared resources.
   */
  perceive(simEngine) {
    const beliefs = {
      position: { x: this.x, y: this.y },
      battery: this.battery,
      isLowBattery: this.battery < 20,
      isCriticallyLow: this.battery < 10,
      currentStatus: this.status,
      nearbyRobots: simEngine.robots
        .filter(r => r.id !== this.id && !r.isFailed)
        .map(r => ({ id: r.id, x: r.x, y: r.y, status: r.status })),
      availableChargers: simEngine.getChargingStations(),
      isFailed: this.isFailed
    };
    return beliefs;
  }

  /**
   * DECISION MAKING (Task Evaluation / Bidding in Decentralized Mode)
   * 
   * Calculates bid cost:
   * Bid = w1 * Dist(robot, pickup) + w2 * Dist(pickup, delivery)
   *       - w3 * BatteryLevel + w4 * CurrentWorkload
   * Lower bid = more suitable candidate
   */
  calculateBid(order) {
    if (this.isFailed || this.battery < 25) {
      return {
        bidValue: Infinity,
        valid: false,
        reason: this.isFailed ? 'Robot failed' : 'Battery too low (<25%)',
        robotId: this.id,
        robotName: this.name
      };
    }

    const distToPickup = manhattanDistance({ x: this.x, y: this.y }, order.pickupPos);
    const distDelivery = manhattanDistance(order.pickupPos, order.deliveryPos);

    // Weights
    const wDist = 1.0;
    const wDeliver = 0.5;
    const wBattery = 0.15; // Higher battery reduces bid cost
    const wWorkload = this.status === 'IDLE' ? 0 : 25; // Busy penalty

    // Urgent orders prioritize closer robots
    const priorityMultiplier = order.priority === 'CRITICAL' ? 0.7 :
                               order.priority === 'HIGH' ? 0.85 : 1.0;

    const rawCost = (wDist * distToPickup) + (wDeliver * distDelivery) + wWorkload;
    const batteryBonus = (this.battery / 100) * (wBattery * 20);
    const finalBid = Math.max(1, Math.round((rawCost - batteryBonus) * priorityMultiplier * 10) / 10);

    return {
      bidValue: finalBid,
      valid: true,
      robotId: this.id,
      robotName: this.name,
      distToPickup,
      distDelivery,
      battery: Math.round(this.battery),
      workload: this.status,
      orderId: order.id
    };
  }

  /**
   * DECISION MAKING & STATE MACHINE:
   * Decide next objective based on current beliefs
   */
  decide(simEngine) {
    if (this.isFailed) {
      this.status = 'FAILED';
      return;
    }

    // 1. High Priority Battery Check
    if (this.battery < 18 && this.status !== 'CHARGING' && this.status !== 'RETURNING_TO_CHARGER') {
      // If robot has an order it hasn't picked up yet, release it back to pool
      if (this.currentOrder && !this.carryingCargo) {
        simEngine.reassignOrder(this.currentOrder, `Robot ${this.name} battery low (${Math.round(this.battery)}%)`);
        this.currentOrder = null;
      }

      // If already carrying cargo, robot must first deliver cargo before routing to charger
      if (!this.carryingCargo) {
        this.routeToNearestCharger(simEngine);
        return;
      }
    }

    // 2. Battery recharged -> return to IDLE
    if (this.status === 'CHARGING') {
      if (this.battery >= 98) {
        this.status = 'IDLE';
        simEngine.logEvent(
          'BATTERY',
          `Robot ${this.name} fully recharged (100%). Ready for dispatch.`,
          { robotId: this.id }
        );
      }
      return;
    }

    // 3. Normal State Progression
    if (this.status === 'IDLE') {
      this.idleTicks++;
      // If battery is somewhat low and idle, return to charger to top up
      if (this.battery < 45 && !this.currentOrder) {
        this.routeToNearestCharger(simEngine);
      }
    } else {
      this.activeWorkTicks++;
    }
  }

  /**
   * ACTION EXECUTION (Step Loop)
   */
  step(simEngine) {
    if (this.isFailed) {
      return;
    }

    // 1. Charging state: replenish battery
    if (this.status === 'CHARGING') {
      this.battery = Math.min(100, this.battery + 1.2); // ~1.2% per tick
      return;
    }

    // 2. Action states with hold duration (Pickup or Delivery operations)
    if (this.status === 'PICKING_UP') {
      this.actionProgress++;
      if (this.actionProgress >= 2) {
        // Cargo loaded
        this.carryingCargo = true;
        this.actionProgress = 0;
        this.status = 'MOVING_TO_DELIVERY';
        this.targetPos = this.currentOrder.deliveryPos;
        this.planPath(simEngine, this.targetPos);

        simEngine.logEvent(
          'TASK',
          `Robot ${this.name} loaded [${this.currentOrder.productName}] at (${this.x},${this.y}). En route to Dock.`,
          { robotId: this.id, orderId: this.currentOrder.id }
        );
      }
      return;
    }

    if (this.status === 'DELIVERING') {
      this.actionProgress++;
      if (this.actionProgress >= 2) {
        // Delivery completed
        this.carryingCargo = false;
        this.actionProgress = 0;
        const finishedOrder = this.currentOrder;
        this.currentOrder = null;
        this.targetPos = null;
        this.ordersCompleted++;
        this.status = 'IDLE';

        simEngine.completeOrder(finishedOrder, this);

        // Release any held resource at the delivery dock
        if (this.reservedResourceId) {
          simEngine.resourceManager.releaseAccess(this.reservedResourceId, this.id, simEngine.currentTick, simEngine);
          this.reservedResourceId = null;
        }
      }
      return;
    }

    // 3. Resource and Collision yield checks
    if (this.isTemporarilyYielding) {
      this.waitTicks++;
      return; // Yield this tick to avoid collision
    }

    // Check if next step requires shared resource lock
    if (this.path.length > 0) {
      const nextCell = this.path[0];
      const targetCellInfo = simEngine.grid[nextCell.y][nextCell.x];
      if (targetCellInfo.resourceId) {
        const granted = simEngine.resourceManager.requestAccess(
          targetCellInfo.resourceId,
          this,
          simEngine.currentTick,
          simEngine
        );
        if (!granted) {
          this.isWaitingResource = true;
          this.waitTicks++;
          return; // Wait until resource is granted
        } else {
          this.isWaitingResource = false;
          this.reservedResourceId = targetCellInfo.resourceId;
        }
      } else if (this.reservedResourceId) {
        // Robot has moved past the shared resource cell, release it
        simEngine.resourceManager.releaseAccess(this.reservedResourceId, this.id, simEngine.currentTick, simEngine);
        this.reservedResourceId = null;
      }
    }

    // 4. Movement along calculated path
    if (this.path.length > 0) {
      const nextStep = this.path.shift();
      this.x = nextStep.x;
      this.y = nextStep.y;
      this.distanceTravelled += 1;

      // Battery drain (0.12% per move step, loaded is slightly higher 0.16%)
      const drain = this.carryingCargo ? 0.16 : 0.12;
      this.battery = Math.max(0, this.battery - drain);

      // Check arrival at current target
      if (this.targetPos && this.x === this.targetPos.x && this.y === this.targetPos.y) {
        this.handleArrival(simEngine);
      }
    } else if (this.targetPos && (this.x !== this.targetPos.x || this.y !== this.targetPos.y)) {
      // If path was exhausted or interrupted, replan
      this.planPath(simEngine, this.targetPos);
    }
  }

  handleArrival(simEngine) {
    if (this.status === 'MOVING_TO_PICKUP') {
      this.status = 'PICKING_UP';
      this.actionProgress = 0;
      simEngine.logEvent(
        'TASK',
        `Robot ${this.name} arrived at Pickup Station (${this.x},${this.y}). Loading item...`,
        { robotId: this.id, orderId: this.currentOrder?.id }
      );
    } else if (this.status === 'MOVING_TO_DELIVERY') {
      this.status = 'DELIVERING';
      this.actionProgress = 0;
      simEngine.logEvent(
        'TASK',
        `Robot ${this.name} arrived at Delivery Dock (${this.x},${this.y}). Unloading shipment...`,
        { robotId: this.id, orderId: this.currentOrder?.id }
      );
    } else if (this.status === 'RETURNING_TO_CHARGER') {
      this.status = 'CHARGING';
      this.targetPos = null;
      simEngine.logEvent(
        'BATTERY',
        `Robot ${this.name} docked at Charging Pad (${this.x},${this.y}). Fast charging initiated.`,
        { robotId: this.id }
      );
    }
  }

  planPath(simEngine, target) {
    if (!target) return;
    const dynamicObstacles = simEngine.robots
      .filter(r => r.id !== this.id && !r.isFailed)
      .map(r => ({ x: r.x, y: r.y }));

    const calculatedPath = findPathAStar(
      simEngine.grid,
      { x: this.x, y: this.y },
      target,
      { dynamicObstacles }
    );

    if (calculatedPath) {
      this.path = calculatedPath;
    } else {
      // Fallback search ignoring other robots
      this.path = findPathAStar(
        simEngine.grid,
        { x: this.x, y: this.y },
        target,
        { dynamicObstacles: [] }
      ) || [];
    }
  }

  assignOrder(order, simEngine) {
    this.currentOrder = order;
    this.status = 'MOVING_TO_PICKUP';
    this.targetPos = order.pickupPos;
    this.planPath(simEngine, this.targetPos);
  }

  routeToNearestCharger(simEngine) {
    const chargers = simEngine.getChargingStations();
    if (chargers.length === 0) return;

    // Pick closest unoccupied charger
    const occupiedChargers = new Set(
      simEngine.robots
        .filter(r => r.id !== this.id && (r.status === 'CHARGING' || r.status === 'RETURNING_TO_CHARGER'))
        .map(r => `${r.targetPos?.x || r.x},${r.targetPos?.y || r.y}`)
    );

    let bestCharger = null;
    let minDistance = Infinity;

    chargers.forEach(chg => {
      const isOccupied = occupiedChargers.has(`${chg.x},${chg.y}`);
      const dist = manhattanDistance({ x: this.x, y: this.y }, chg);
      const effectiveDist = isOccupied ? dist + 50 : dist;

      if (effectiveDist < minDistance) {
        minDistance = effectiveDist;
        bestCharger = chg;
      }
    });

    if (!bestCharger) bestCharger = chargers[0];

    this.status = 'RETURNING_TO_CHARGER';
    this.targetPos = { x: bestCharger.x, y: bestCharger.y };
    this.planPath(simEngine, this.targetPos);

    simEngine.logEvent(
      'BATTERY',
      `Robot ${this.name} battery low (${Math.round(this.battery)}%). Routing to Charger (${bestCharger.x},${bestCharger.y}).`,
      { robotId: this.id }
    );
  }

  triggerFailure(reason = 'Simulated Hardware/Motor Lock Fault') {
    this.isFailed = true;
    this.failureReason = reason;
    this.status = 'FAILED';
    this.path = [];
  }

  recover() {
    this.isFailed = false;
    this.failureReason = null;
    this.status = 'IDLE';
  }
}
