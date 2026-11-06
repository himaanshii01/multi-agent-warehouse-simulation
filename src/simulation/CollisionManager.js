/**
 * Dynamic Multi-Agent Collision Manager
 * 
 * Prevents vertex collisions (two robots targeting same cell)
 * and edge/swap collisions (two robots swapping cells head-on).
 * Coordinates cooperative yielding and local path replanning.
 */

import { findPathAStar } from './Pathfinding.js';

export class CollisionManager {
  constructor() {
    this.totalCollisionsAvoided = 0;
    this.reservationMap = new Map(); // "x,y" => { robotId, priority }
  }

  reset() {
    this.totalCollisionsAvoided = 0;
    this.reservationMap.clear();
  }

  /**
   * Pre-flight arbitration phase run before agents move in each tick.
   * Evaluates proposed next moves for all active robots and resolves conflicts.
   * 
   * @param {Array} robots - List of RobotAgent instances
   * @param {Array} grid - 2D grid matrix
   * @param {Object} eventLogger - Event logger
   */
  resolveMovements(robots, grid, eventLogger = null) {
    this.reservationMap.clear();

    // Map current locations: "x,y" => robot
    const currentLocs = new Map();
    robots.forEach(r => {
      if (!r.isFailed) {
        currentLocs.set(`${r.x},${r.y}`, r);
      }
    });

    // 1. Gather all intended next steps
    // Robot proposes its next coordinate from path[0]
    const intents = [];
    robots.forEach(robot => {
      if (robot.isFailed || robot.path.length === 0 || robot.isWaitingResource) {
        return;
      }

      const nextPos = robot.path[0];
      intents.push({
        robot,
        from: { x: robot.x, y: robot.y },
        to: nextPos,
        priority: this.calculateRobotPriority(robot)
      });
    });

    // 2. Detect & Resolve Edge/Swap Collisions
    // Robot A moving to B's spot while Robot B moving to A's spot
    for (let i = 0; i < intents.length; i++) {
      for (let j = i + 1; j < intents.length; j++) {
        const a = intents[i];
        const b = intents[j];

        const isSwap =
          a.from.x === b.to.x &&
          a.from.y === b.to.y &&
          a.to.x === b.from.x &&
          a.to.y === b.from.y;

        if (isSwap) {
          this.totalCollisionsAvoided++;
          robotA_yields_or_replan(a, b, this, grid, eventLogger);
        }
      }
    }

    // 3. Detect & Resolve Vertex Collisions
    // Two or more robots targeting the same next cell
    const targetCellMap = new Map(); // "x,y" => array of intents
    intents.forEach(intent => {
      if (intent.yield) return; // already yielding from swap resolution
      const key = `${intent.to.x},${intent.to.y}`;
      if (!targetCellMap.has(key)) {
        targetCellMap.set(key, []);
      }
      targetCellMap.get(key).push(intent);
    });

    targetCellMap.forEach((competingIntents, key) => {
      if (competingIntents.length > 1) {
        // Sort by priority descending
        competingIntents.sort((a, b) => b.priority - a.priority);
        const winner = competingIntents[0];

        // Losers must yield or replan
        for (let i = 1; i < competingIntents.length; i++) {
          const loser = competingIntents[i];
          loser.yield = true;
          this.totalCollisionsAvoided++;
          loser.robot.collisionsAvoided += 1;
          loser.robot.isTemporarilyYielding = true;

          if (eventLogger) {
            eventLogger.log(
              'COLLISION',
              `Collision prevented at (${loser.to.x},${loser.to.y}): Robot ${loser.robot.name} yielded to higher priority Robot ${winner.robot.name}.`,
              { loserId: loser.robot.id, winnerId: winner.robot.id }
            );
          }

          // If loser has been waiting on the same spot for >= 2 ticks, trigger dynamic replanning
          loser.robot.blockedTicks = (loser.robot.blockedTicks || 0) + 1;
          if (loser.robot.blockedTicks >= 2 && loser.robot.targetPos) {
            const dynamicObstacles = robots
              .filter(r => r.id !== loser.robot.id)
              .map(r => ({ x: r.x, y: r.y }));
            
            const newPath = findPathAStar(grid, { x: loser.robot.x, y: loser.robot.y }, loser.robot.targetPos, {
              dynamicObstacles
            });

            if (newPath && newPath.length > 0) {
              loser.robot.path = newPath;
              loser.robot.blockedTicks = 0;
              if (eventLogger) {
                eventLogger.log(
                  'NAVIGATION',
                  `Robot ${loser.robot.name} recalculating alternative collision-free route (${newPath.length} steps).`,
                  { robotId: loser.robot.id }
                );
              }
            }
          }
        }
      }
    });

    // 4. Also check if next cell is currently occupied by a stationary robot (idle, charging, or waiting)
    intents.forEach(intent => {
      if (intent.yield) return;
      const occupant = currentLocs.get(`${intent.to.x},${intent.to.y}`);
      if (occupant && occupant.id !== intent.robot.id) {
        // Cell is currently occupied. If occupant is not moving away in this tick:
        const occupantMovingAway = intents.some(
          it => it.robot.id === occupant.id && !it.yield
        );

        if (!occupantMovingAway) {
          intent.yield = true;
          this.totalCollisionsAvoided++;
          intent.robot.collisionsAvoided += 1;
          intent.robot.isTemporarilyYielding = true;
          intent.robot.blockedTicks = (intent.robot.blockedTicks || 0) + 1;

          if (intent.robot.blockedTicks >= 2 && intent.robot.targetPos) {
            const dynamicObstacles = robots
              .filter(r => r.id !== intent.robot.id)
              .map(r => ({ x: r.x, y: r.y }));

            const newPath = findPathAStar(grid, { x: intent.robot.x, y: intent.robot.y }, intent.robot.targetPos, {
              dynamicObstacles
            });

            if (newPath && newPath.length > 0) {
              intent.robot.path = newPath;
              intent.robot.blockedTicks = 0;
            }
          }
        }
      }
    });

    // 5. Apply yield state to robot agents
    intents.forEach(intent => {
      intent.robot.isTemporarilyYielding = Boolean(intent.yield);
      if (!intent.yield) {
        intent.robot.blockedTicks = 0;
      }
    });
  }

  /**
   * Calculate dynamic priority for collision arbitration
   */
  calculateRobotPriority(robot) {
    let score = 0;
    // Loaded robot carrying delivery has high momentum / priority
    if (robot.status === 'MOVING_TO_DELIVERY' || robot.status === 'DELIVERING') {
      score += 50;
    } else if (robot.status === 'MOVING_TO_PICKUP') {
      score += 30;
    }

    if (robot.currentOrder?.priority === 'CRITICAL') score += 25;
    else if (robot.currentOrder?.priority === 'HIGH') score += 15;

    // Critically low battery robot heading to charger gets high priority
    if (robot.battery < 20 && robot.status === 'RETURNING_TO_CHARGER') {
      score += 45;
    }

    // Anti-starvation: time blocked
    score += (robot.blockedTicks || 0) * 5;

    // Tiebreaker: robot numeric ID
    const numId = parseInt(robot.id.replace(/\D/g, ''), 10) || 0;
    score += (10 - (numId % 10)) * 0.1;

    return score;
  }
}

function robotA_yields_or_replan(intentA, intentB, manager, grid, eventLogger) {
  const winner = intentA.priority >= intentB.priority ? intentA : intentB;
  const loser = winner === intentA ? intentB : intentA;

  loser.yield = true;
  loser.robot.collisionsAvoided += 1;
  loser.robot.isTemporarilyYielding = true;
  loser.robot.blockedTicks = (loser.robot.blockedTicks || 0) + 1;

  if (eventLogger) {
    eventLogger.log(
      'COLLISION',
      `Head-on swap conflict prevented between Robot ${intentA.robot.name} and ${intentB.robot.name}. Robot ${loser.robot.name} yielding right-of-way.`,
      { winnerId: winner.robot.id, loserId: loser.robot.id }
    );
  }
}
