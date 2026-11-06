/**
 * Shared Resource Negotiation Manager
 * 
 * Implements priority-based mutual exclusion and reservation negotiation
 * for shared bottleneck corridors, high-traffic intersections, pickup bays, and docks.
 */

export class ResourceManager {
  constructor() {
    this.resources = new Map();
    this.initDefaultResources();
  }

  initDefaultResources() {
    const definitions = [
      { id: 'RES-CORRIDOR-1', name: 'Central Choke Corridor 1', type: 'CORRIDOR', x: 9, y: 7 },
      { id: 'RES-CORRIDOR-2', name: 'East Access Corridor 2', type: 'CORRIDOR', x: 13, y: 7 },
      { id: 'RES-INT-1', name: 'West Main Cross Intersection', type: 'INTERSECTION', x: 5, y: 7 },
      { id: 'RES-INT-2', name: 'East Main Cross Intersection', type: 'INTERSECTION', x: 17, y: 7 },
      { id: 'RES-PICK-1', name: 'Inbound Bay 1', type: 'STATION', x: 2, y: 14 },
      { id: 'RES-PICK-2', name: 'Inbound Bay 2', type: 'STATION', x: 6, y: 14 },
      { id: 'RES-PICK-3', name: 'Inbound Bay 3', type: 'STATION', x: 10, y: 14 },
      { id: 'RES-PICK-4', name: 'Inbound Bay 4', type: 'STATION', x: 14, y: 14 },
      { id: 'RES-DOCK-1', name: 'Outbound Dock 1', type: 'STATION', x: 2, y: 0 },
      { id: 'RES-DOCK-2', name: 'Outbound Dock 2', type: 'STATION', x: 6, y: 0 },
      { id: 'RES-DOCK-3', name: 'Outbound Dock 3', type: 'STATION', x: 10, y: 0 },
      { id: 'RES-DOCK-4', name: 'Outbound Dock 4', type: 'STATION', x: 14, y: 0 },
    ];

    definitions.forEach(def => {
      this.resources.set(def.id, {
        id: def.id,
        name: def.name,
        type: def.type,
        x: def.x,
        y: def.y,
        currentOwner: null, // robotId
        lockedAtTick: null,
        waitingQueue: [] // array of { robotId, priorityScore, waitTicks, requestedAtTick }
      });
    });
  }

  getResource(resourceId) {
    return this.resources.get(resourceId);
  }

  findByCoord(x, y) {
    for (const res of this.resources.values()) {
      if (res.x === x && res.y === y) return res;
    }
    return null;
  }

  isGranted(resourceId, robotId) {
    const res = this.resources.get(resourceId);
    if (!res) return true; // If not managed, free to go
    return res.currentOwner === robotId;
  }

  /**
   * Request access to a shared resource
   */
  requestAccess(resourceId, robot, currentTick, eventLogger = null) {
    const res = this.resources.get(resourceId);
    if (!res) return true;

    // Already granted to this robot
    if (res.currentOwner === robot.id) {
      return true;
    }

    // Free resource -> grant immediately
    if (!res.currentOwner) {
      res.currentOwner = robot.id;
      res.lockedAtTick = currentTick;
      if (eventLogger) {
        eventLogger.log(
          'RESOURCE',
          `Resource [${res.name}] GRANTED immediately to Robot ${robot.name} (no conflict).`,
          { robotId: robot.id, resourceId }
        );
      }
      return true;
    }

    // Resource currently owned by someone else -> check queue
    const queueIdx = res.waitingQueue.findIndex(item => item.robotId === robot.id);
    if (queueIdx === -1) {
      // Calculate negotiation priority score:
      // Urgency: CRITICAL = 40, HIGH = 30, NORMAL = 20, LOW = 10
      const urgencyScore = robot.currentOrder?.priority === 'CRITICAL' ? 40 :
                           robot.currentOrder?.priority === 'HIGH' ? 30 :
                           robot.currentOrder?.priority === 'NORMAL' ? 20 : 10;
      // Battery penalty if critically low, they need priority to reach charger
      const batteryUrgency = robot.battery < 20 ? 30 : 0;
      const initialScore = urgencyScore + batteryUrgency;

      res.waitingQueue.push({
        robotId: robot.id,
        robotName: robot.name,
        priorityScore: initialScore,
        waitTicks: 0,
        requestedAtTick: currentTick
      });

      if (eventLogger) {
        eventLogger.log(
          'RESOURCE',
          `Robot ${robot.name} REQUESTED contested resource [${res.name}]. Added to wait queue (Priority: ${initialScore}). Currently held by ${res.currentOwner}.`,
          { robotId: robot.id, resourceId }
        );
      }
    } else {
      // Robot already in queue, increment wait time and dynamically bump priority score
      const item = res.waitingQueue[queueIdx];
      item.waitTicks += 1;
      item.priorityScore += 2; // Anti-starvation boost
    }

    return false;
  }

  /**
   * Release access when robot leaves the cell
   */
  releaseAccess(resourceId, robotId, currentTick, eventLogger = null) {
    const res = this.resources.get(resourceId);
    if (!res) return;

    if (res.currentOwner === robotId) {
      res.currentOwner = null;
      res.lockedAtTick = null;

      if (eventLogger) {
        eventLogger.log(
          'RESOURCE',
          `Robot ${robotId} RELEASED [${res.name}].`,
          { robotId, resourceId }
        );
      }

      // Check waiting queue and grant to highest priority bidder
      if (res.waitingQueue.length > 0) {
        // Sort by priorityScore descending
        res.waitingQueue.sort((a, b) => b.priorityScore - a.priorityScore);
        const winner = res.waitingQueue.shift();

        res.currentOwner = winner.robotId;
        res.lockedAtTick = currentTick;

        if (eventLogger) {
          eventLogger.log(
            'RESOURCE',
            `Resource [${res.name}] GRANTED to waiting Robot ${winner.robotName} after ${winner.waitTicks} wait ticks (Priority: ${winner.priorityScore}).`,
            { robotId: winner.robotId, resourceId }
          );
        }
      }
    } else {
      // Remove from queue if was waiting and abandoned
      res.waitingQueue = res.waitingQueue.filter(item => item.robotId !== robotId);
    }
  }

  /**
   * Clean up reservations if a robot fails or is removed
   */
  purgeRobot(robotId, currentTick, eventLogger = null) {
    for (const res of this.resources.values()) {
      if (res.currentOwner === robotId) {
        this.releaseAccess(res.id, robotId, currentTick, eventLogger);
      }
      res.waitingQueue = res.waitingQueue.filter(item => item.robotId !== robotId);
    }
  }

  getAllResources() {
    return Array.from(this.resources.values());
  }

  reset() {
    this.resources.clear();
    this.initDefaultResources();
  }
}
