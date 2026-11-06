/**
 * Multi-Agent Simulation Engine
 * 
 * Core coordinator linking Warehouse Grid, Autonomous Robot Agents,
 * Pathfinding, Dynamic Collision Arbitration, Shared Resource Negotiation,
 * Order Management, and Task Allocation (Centralized vs Decentralized).
 */

import { createInitialGrid, CELL_TYPES, GRID_WIDTH, GRID_HEIGHT } from './WarehouseGridModel.js';
import { RobotAgent } from './RobotAgent.js';
import { OrderManager, ORDER_STATUS } from './OrderManager.js';
import { CentralizedDispatcher } from './CentralizedDispatcher.js';
import { ContractNetProtocol } from './ContractNetProtocol.js';
import { ResourceManager } from './ResourceManager.js';
import { CollisionManager } from './CollisionManager.js';

export const ALLOCATION_STRATEGIES = {
  CENTRALIZED: 'CENTRALIZED',
  DECENTRALIZED: 'DECENTRALIZED'
};

const ROBOT_PALETTE = [
  { color: '#06B6D4', name: 'Alpha-01' },   // Cyan
  { color: '#10B981', name: 'Beta-02' },    // Emerald
  { color: '#8B5CF6', name: 'Gamma-03' },   // Violet
  { color: '#F59E0B', name: 'Delta-04' },   // Amber
  { color: '#EC4899', name: 'Epsilon-05' }, // Pink
  { color: '#3B82F6', name: 'Zeta-06' },    // Blue
  { color: '#14B8A6', name: 'Eta-07' },     // Teal
  { color: '#F97316', name: 'Theta-08' }    // Orange
];

export class SimulationEngine {
  constructor(listeners = {}) {
    this.listeners = listeners; // onUpdate callback
    this.currentTick = 0;
    this.isRunning = false;
    this.speedMultiplier = 1; // 1x, 2x, 5x
    this.timerId = null;

    // Active Strategy
    this.strategy = ALLOCATION_STRATEGIES.CENTRALIZED;

    // Core sub-systems
    this.grid = createInitialGrid();
    this.orderManager = new OrderManager();
    this.centralizedDispatcher = new CentralizedDispatcher();
    this.contractNetProtocol = new ContractNetProtocol();
    this.resourceManager = new ResourceManager();
    this.collisionManager = new CollisionManager();

    // Robot Fleet
    this.robots = [];
    this.initRobots(4);

    // Global Metrics
    this.communicationMessages = 0;
    this.totalThroughput = 0;
    this.reassignedTaskCount = 0; // Fault-tolerance robustness indicator
    this.events = [];

    // Historical timeseries for Recharts (sampled periodically)
    this.metricHistory = [];

    // Pre-populate with initial starter orders
    this.orderManager.createOrder({ priority: 'HIGH' });
    this.orderManager.createOrder({ priority: 'NORMAL' });
    this.orderManager.createOrder({ priority: 'CRITICAL' });

    this.logEvent('SYSTEM', `Simulation Engine initialized. Strategy: [${this.strategy}]. Fleet: ${this.robots.length} AMRs.`);
  }

  initRobots(count = 4) {
    this.robots = [];
    const chargers = this.getChargingStations();

    for (let i = 0; i < Math.min(count, chargers.length); i++) {
      const chg = chargers[i];
      const palette = ROBOT_PALETTE[i % ROBOT_PALETTE.length];
      const robot = new RobotAgent({
        id: `R-0${i + 1}`,
        name: palette.name,
        color: palette.color,
        x: chg.x,
        y: chg.y,
        homeChargerPos: { x: chg.x, y: chg.y },
        battery: 95 - (i * 5)
      });
      this.robots.push(robot);
    }
  }

  getChargingStations() {
    const chargers = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (this.grid[y][x].type === CELL_TYPES.CHARGER) {
          chargers.push({ x, y, label: this.grid[y][x].label });
        }
      }
    }
    return chargers;
  }

  setStrategy(newStrategy) {
    if (this.strategy === newStrategy) return;
    this.strategy = newStrategy;
    this.logEvent(
      'SYSTEM',
      `Task Allocation Strategy switched to: [${newStrategy === ALLOCATION_STRATEGIES.CENTRALIZED ? 'Centralized Dispatch' : 'Decentralized Contract Net Protocol'}].`
    );
    this.notifyUpdate();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.scheduleNextTick();
    this.logEvent('SYSTEM', 'Simulation started.');
    this.notifyUpdate();
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.logEvent('SYSTEM', 'Simulation paused.');
    this.notifyUpdate();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    if (this.isRunning) {
      if (this.timerId) clearTimeout(this.timerId);
      this.scheduleNextTick();
    }
  }

  scheduleNextTick() {
    const baseInterval = 360; // 360ms per tick at 1x
    const delay = Math.max(30, Math.round(baseInterval / this.speedMultiplier));
    this.timerId = setTimeout(() => {
      if (this.isRunning) {
        this.step();
        this.scheduleNextTick();
      }
    }, delay);
  }

  /**
   * Main Simulation Step Cycle
   * Architecture: Perception -> State Update -> Decision Making -> Action
   */
  step() {
    this.currentTick++;

    // 1. Task Allocation Phase
    if (this.strategy === ALLOCATION_STRATEGIES.CENTRALIZED) {
      this.centralizedDispatcher.dispatchOrders(this);
    } else {
      this.contractNetProtocol.processAuctions(this);
    }

    // 2. Agents Perception & Decision Making Phase
    this.robots.forEach(robot => {
      robot.perceive(this);
      robot.decide(this);
    });

    // 3. Dynamic Collision Arbitration Phase
    this.collisionManager.resolveMovements(this.robots, this.grid, this);

    // 4. Action Execution Phase
    this.robots.forEach(robot => {
      robot.step(this);
    });

    // 5. Automated Periodic Order Ingestion
    // Spawns a new order every 20-30 ticks if queue is below 6
    if (this.currentTick % 22 === 0 && this.orderManager.orders.filter(o => o.status !== ORDER_STATUS.COMPLETED).length < 6) {
      const newOrd = this.orderManager.createOrder({ createdAtTick: this.currentTick });
      this.logEvent('TASK', `New customer order [${newOrd.id}] (${newOrd.productName}) arrived in queue. Priority: ${newOrd.priority}.`);
    }

    // 6. Record Historical Time-Series (every 5 ticks)
    if (this.currentTick % 5 === 0) {
      this.recordMetrics();
    }

    this.notifyUpdate();
  }

  completeOrder(order, robot) {
    this.orderManager.markCompleted(order.id, this.currentTick);
    this.totalThroughput++;
    this.logEvent(
      'TASK',
      `Order [${order.id}] (${order.productName}) delivered to ${order.deliveryPos.name} by Robot ${robot.name}! Duration: ${this.currentTick - order.createdAtTick} ticks.`,
      { orderId: order.id, robotId: robot.id }
    );
  }

  reassignOrder(order, reason) {
    if (!order) return;
    order.status = ORDER_STATUS.PENDING;
    order.assignedRobotId = null;
    order.assignedAtTick = null;
    this.reassignedTaskCount++;
    this.logEvent(
      'TASK',
      `Order [${order.id}] reassigned back to backlog. Reason: ${reason}`,
      { orderId: order.id }
    );
  }

  /**
   * Fault Injection: Simulates robot hardware failure
   */
  triggerRobotFailure(robotId) {
    const robot = this.robots.find(r => r.id === robotId);
    if (!robot || robot.isFailed) return;

    robot.triggerFailure('Motor Drive Inverter Fault / Sensor Occlusion');
    this.resourceManager.purgeRobot(robotId, this.currentTick, this);

    // Reassign unfinished task if any
    if (robot.currentOrder) {
      this.reassignOrder(robot.currentOrder, `Assigned Robot ${robot.name} experienced critical fault`);
      robot.currentOrder = null;
      robot.carryingCargo = false;
    }

    this.logEvent(
      'FAILURE',
      `[FAULT INJECTION] Robot ${robot.name} has FAILED: ${robot.failureReason}. Task reassigned.`,
      { robotId }
    );
    this.notifyUpdate();
  }

  recoverRobot(robotId) {
    const robot = this.robots.find(r => r.id === robotId);
    if (!robot || !robot.isFailed) return;

    robot.recover();
    this.logEvent('SYSTEM', `Robot ${robot.name} recovered and back online.`, { robotId });
    this.notifyUpdate();
  }

  addRobot() {
    if (this.robots.length >= 8) return;
    const chargers = this.getChargingStations();
    const newIdx = this.robots.length;
    const chg = chargers[newIdx % chargers.length];
    const palette = ROBOT_PALETTE[newIdx % ROBOT_PALETTE.length];

    const robot = new RobotAgent({
      id: `R-0${newIdx + 1}`,
      name: palette.name,
      color: palette.color,
      x: chg.x,
      y: chg.y,
      homeChargerPos: { x: chg.x, y: chg.y },
      battery: 100
    });

    this.robots.push(robot);
    this.logEvent('SYSTEM', `Commissioned new Autonomous Robot ${robot.name} (${robot.id}) at dock (${chg.x},${chg.y}).`);
    this.notifyUpdate();
  }

  removeRobot(robotId) {
    if (this.robots.length <= 2) return;
    const robot = this.robots.find(r => r.id === robotId);
    if (!robot) return;

    if (robot.currentOrder) {
      this.reassignOrder(robot.currentOrder, `Robot ${robot.name} decommissioned`);
    }
    this.resourceManager.purgeRobot(robotId, this.currentTick, this);
    this.robots = this.robots.filter(r => r.id !== robotId);
    this.logEvent('SYSTEM', `Decommissioned Robot ${robot.name} from active fleet.`);
    this.notifyUpdate();
  }

  recordMetrics() {
    const completed = this.orderManager.completedOrders;
    const avgCompletionTime = completed.length > 0
      ? Math.round(completed.reduce((acc, o) => acc + (o.completionDuration || 0), 0) / completed.length)
      : 0;

    const totalDistance = this.robots.reduce((acc, r) => acc + r.distanceTravelled, 0);
    const totalCollisions = this.collisionManager.totalCollisionsAvoided;

    const totalWorkTicks = this.robots.reduce((acc, r) => acc + r.activeWorkTicks, 0);
    const totalIdleTicks = this.robots.reduce((acc, r) => acc + r.idleTicks, 0);
    const utilization = (totalWorkTicks + totalIdleTicks) > 0
      ? Math.round((totalWorkTicks / (totalWorkTicks + totalIdleTicks)) * 100)
      : 0;

    this.metricHistory.push({
      tick: this.currentTick,
      completedOrders: completed.length,
      throughput: this.totalThroughput,
      messages: this.communicationMessages,
      avgCompletionTime,
      totalDistance,
      collisionsAvoided: totalCollisions,
      utilization,
      strategy: this.strategy
    });

    if (this.metricHistory.length > 50) {
      this.metricHistory.shift();
    }
  }

  logEvent(category, message, details = {}) {
    const timestamp = new Date().toLocaleTimeString();
    const event = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tick: this.currentTick,
      timestamp,
      category,
      message,
      details
    };
    this.events.unshift(event);
    if (this.events.length > 150) {
      this.events.pop();
    }
  }

  reset() {
    this.pause();
    this.currentTick = 0;
    this.communicationMessages = 0;
    this.totalThroughput = 0;
    this.reassignedTaskCount = 0;
    this.events = [];
    this.metricHistory = [];

    this.grid = createInitialGrid();
    this.orderManager.reset();
    this.centralizedDispatcher.reset();
    this.contractNetProtocol.reset();
    this.resourceManager.reset();
    this.collisionManager.reset();
    this.initRobots(4);

    // Initial starter orders
    this.orderManager.createOrder({ priority: 'HIGH' });
    this.orderManager.createOrder({ priority: 'NORMAL' });
    this.orderManager.createOrder({ priority: 'CRITICAL' });

    this.logEvent('SYSTEM', `Simulation environment reset to initial state. Strategy: ${this.strategy}.`);
    this.notifyUpdate();
  }

  notifyUpdate() {
    if (this.listeners.onUpdate) {
      this.listeners.onUpdate();
    }
  }

  getSnapshot() {
    const completed = this.orderManager.completedOrders;
    const avgCompletionDuration = completed.length > 0
      ? (completed.reduce((acc, o) => acc + (o.completionDuration || 0), 0) / completed.length).toFixed(1)
      : '0.0';

    const totalWorkTicks = this.robots.reduce((acc, r) => acc + r.activeWorkTicks, 0);
    const totalIdleTicks = this.robots.reduce((acc, r) => acc + r.idleTicks, 0);
    const fleetUtilization = (totalWorkTicks + totalIdleTicks) > 0
      ? Math.round((totalWorkTicks / (totalWorkTicks + totalIdleTicks)) * 100)
      : 0;

    return {
      currentTick: this.currentTick,
      isRunning: this.isRunning,
      strategy: this.strategy,
      speedMultiplier: this.speedMultiplier,
      robots: this.robots,
      grid: this.grid,
      orders: this.orderManager.orders,
      completedOrders: this.orderManager.completedOrders,
      communicationMessages: this.communicationMessages,
      totalThroughput: this.totalThroughput,
      avgCompletionDuration,
      collisionsAvoided: this.collisionManager.totalCollisionsAvoided,
      reassignedTasks: this.reassignedTaskCount,
      fleetUtilization,
      resources: this.resourceManager.getAllResources(),
      auctionHistory: this.contractNetProtocol.auctionHistory,
      costMatrix: this.centralizedDispatcher.lastCostMatrix,
      events: this.events,
      metricHistory: this.metricHistory
    };
  }
}
