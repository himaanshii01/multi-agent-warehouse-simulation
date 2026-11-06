/**
 * A* Pathfinding Algorithm with Manhattan Distance Heuristic
 * 
 * Used by autonomous warehouse robots for collision-free navigation
 * across the warehouse grid.
 */

import { GRID_WIDTH, GRID_HEIGHT, CELL_TYPES } from './WarehouseGridModel.js';

/**
 * Calculates Manhattan distance between two points (grid distance)
 */
export function manhattanDistance(p1, p2) {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

/**
 * Node helper class for A*
 */
class AStarNode {
  constructor(x, y, g = 0, h = 0, parent = null) {
    this.x = x;
    this.y = y;
    this.g = g; // Cost from start
    this.h = h; // Heuristic estimate to target
    this.f = g + h; // Total estimated cost
    this.parent = parent;
  }
}

/**
 * Finds optimal collision-free path from start to target using A*
 * 
 * @param {Array} grid - 2D grid matrix
 * @param {Object} start - {x, y}
 * @param {Object} target - {x, y}
 * @param {Object} options - { dynamicObstacles: Set/Array, maxIterations: 1000 }
 * @returns {Array|null} Array of {x, y} coordinates representing path from start+1 to target, or null if unreachable
 */
export function findPathAStar(grid, start, target, options = {}) {
  if (!start || !target) return null;
  if (start.x === target.x && start.y === target.y) return [];

  const { dynamicObstacles = [], maxIterations = 1500 } = options;

  // Build quick lookup for dynamic obstacles (e.g. other stationary robots or locked cells)
  const dynamicObstacleKeySet = new Set(
    dynamicObstacles.map(obs => `${obs.x},${obs.y}`)
  );

  // Key function for spatial hash
  const toKey = (x, y) => `${x},${y}`;
  const targetKey = toKey(target.x, target.y);

  const openList = [];
  const openSet = new Map();
  const closedSet = new Set();

  const startNode = new AStarNode(
    start.x,
    start.y,
    0,
    manhattanDistance(start, target),
    null
  );

  openList.push(startNode);
  openSet.set(toKey(start.x, start.y), startNode);

  // 4-directional movements (no diagonal cutting through shelf corners)
  const directions = [
    { dx: 0, dy: -1 }, // North
    { dx: 1, dy: 0 },  // East
    { dx: 0, dy: 1 },  // South
    { dx: -1, dy: 0 }  // West
  ];

  let iterations = 0;

  while (openList.length > 0) {
    iterations++;
    if (iterations > maxIterations) {
      break; // Safe exit against pathological loops
    }

    // Pop node with lowest f value
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift();
    const currKey = toKey(current.x, current.y);
    openSet.delete(currKey);
    closedSet.add(currKey);

    // Goal reached
    if (current.x === target.x && current.y === target.y) {
      const path = [];
      let temp = current;
      while (temp.parent) {
        path.unshift({ x: temp.x, y: temp.y });
        temp = temp.parent;
      }
      return path;
    }

    // Inspect neighbors
    for (const dir of directions) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const nKey = toKey(nx, ny);

      // Boundary check
      if (nx < 0 || nx >= GRID_WIDTH || ny < 0 || ny >= GRID_HEIGHT) {
        continue;
      }

      // Check if already visited
      if (closedSet.has(nKey)) {
        continue;
      }

      // Static obstacle check: shelves and obstacles cannot be traversed
      const cell = grid[ny][nx];
      // Note: If target itself is a pickup or delivery cell, it is traversable
      if (cell.type === CELL_TYPES.SHELF || cell.type === CELL_TYPES.OBSTACLE) {
        continue;
      }

      // Dynamic obstacle check: other robots or temporarily reserved cells
      // Allow destination even if dynamic obstacle is there (will wait at step before)
      if (dynamicObstacleKeySet.has(nKey) && nKey !== targetKey) {
        continue;
      }

      // Tentative g score (each step has unit cost 1)
      const tentativeG = current.g + 1;

      const existingNeighbor = openSet.get(nKey);
      if (!existingNeighbor) {
        const neighborNode = new AStarNode(
          nx,
          ny,
          tentativeG,
          manhattanDistance({ x: nx, y: ny }, target),
          current
        );
        openList.push(neighborNode);
        openSet.set(nKey, neighborNode);
      } else if (tentativeG < existingNeighbor.g) {
        existingNeighbor.g = tentativeG;
        existingNeighbor.f = tentativeG + existingNeighbor.h;
        existingNeighbor.parent = current;
      }
    }
  }

  // If strict path is blocked by a dynamic obstacle, try a fallback search ignoring dynamic obstacles
  // so the robot can at least approach the destination and wait
  if (dynamicObstacles.length > 0) {
    return findPathAStar(grid, start, target, { dynamicObstacles: [], maxIterations: 1000 });
  }

  return null; // No path found
}
