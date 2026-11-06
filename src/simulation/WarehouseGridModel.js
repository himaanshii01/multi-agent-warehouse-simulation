/**
 * Warehouse Grid Model
 * Represents the 2D layout of the automated fulfillment facility:
 * - Empty corridors (navigable paths)
 * - Storage Shelves (racks holding products)
 * - Pickup Stations (inbound goods receiving)
 * - Delivery Docks (outbound shipping)
 * - Charging Pads (inductive charging spots)
 * - Structural Obstacles (support pillars, maintenance zones)
 * - Shared critical zones (narrow bottlenecks and high-traffic intersections)
 */

export const CELL_TYPES = {
  EMPTY: 'EMPTY',
  SHELF: 'SHELF',
  OBSTACLE: 'OBSTACLE',
  PICKUP: 'PICKUP',
  DELIVERY: 'DELIVERY',
  CHARGER: 'CHARGER'
};

export const GRID_WIDTH = 22;
export const GRID_HEIGHT = 15;

export const PRODUCT_CATALOG = [
  { id: 'PROD-01', name: 'Precision Micro-Sensors', category: 'Electronics', weight: 1.2, shelfLabel: 'Rack A1' },
  { id: 'PROD-02', name: 'Lithium Battery Cells', category: 'Energy', weight: 4.5, shelfLabel: 'Rack A2' },
  { id: 'PROD-03', name: 'Optical Camera Modules', category: 'Optics', weight: 0.8, shelfLabel: 'Rack B1' },
  { id: 'PROD-04', name: 'Hydraulic Actuators', category: 'Mechanics', weight: 8.0, shelfLabel: 'Rack B2' },
  { id: 'PROD-05', name: 'Robotic Servo Motors', category: 'Robotics', weight: 3.2, shelfLabel: 'Rack C1' },
  { id: 'PROD-06', name: 'Fiber Optic Transceivers', category: 'Networking', weight: 0.5, shelfLabel: 'Rack C2' },
  { id: 'PROD-07', name: 'Embedded AI Control Boards', category: 'Computing', weight: 1.1, shelfLabel: 'Rack D1' },
  { id: 'PROD-08', name: 'Pneumatic Gripper Assemblies', category: 'Industrial', weight: 5.4, shelfLabel: 'Rack D2' }
];

export function createInitialGrid() {
  const grid = [];

  for (let y = 0; y < GRID_HEIGHT; y++) {
    const row = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      row.push({
        x,
        y,
        type: CELL_TYPES.EMPTY,
        label: null,
        shelfId: null,
        resourceId: null,
        productId: null
      });
    }
    grid.push(row);
  }

  // 1. Delivery Docks along row 0 (Top side: Outbound shipping)
  const deliveryStations = [
    { x: 2, y: 0, label: 'DOCK-1' },
    { x: 6, y: 0, label: 'DOCK-2' },
    { x: 10, y: 0, label: 'DOCK-3' },
    { x: 14, y: 0, label: 'DOCK-4' }
  ];
  deliveryStations.forEach(ds => {
    grid[ds.y][ds.x] = {
      ...grid[ds.y][ds.x],
      type: CELL_TYPES.DELIVERY,
      label: ds.label
    };
  });

  // 2. Pickup Stations along row 14 (Bottom side: Inbound Receiving)
  const pickupStations = [
    { x: 2, y: 14, label: 'PICK-1' },
    { x: 6, y: 14, label: 'PICK-2' },
    { x: 10, y: 14, label: 'PICK-3' },
    { x: 14, y: 14, label: 'PICK-4' }
  ];
  pickupStations.forEach(ps => {
    grid[ps.y][ps.x] = {
      ...grid[ps.y][ps.x],
      type: CELL_TYPES.PICKUP,
      label: ps.label
    };
  });

  // 3. Charging Stations along right column (Col 21)
  const chargingStations = [
    { x: 21, y: 1, label: 'CHG-1' },
    { x: 21, y: 4, label: 'CHG-2' },
    { x: 21, y: 7, label: 'CHG-3' },
    { x: 21, y: 10, label: 'CHG-4' },
    { x: 21, y: 13, label: 'CHG-5' }
  ];
  chargingStations.forEach(cs => {
    grid[cs.y][cs.x] = {
      ...grid[cs.y][cs.x],
      type: CELL_TYPES.CHARGER,
      label: cs.label
    };
  });

  // 4. Structural Obstacles (Support Columns)
  const obstacles = [
    { x: 4, y: 2, label: 'COL-A' },
    { x: 12, y: 2, label: 'COL-B' },
    { x: 4, y: 12, label: 'COL-C' },
    { x: 12, y: 12, label: 'COL-D' },
    { x: 19, y: 4, label: 'ZONE-X' },
    { x: 19, y: 10, label: 'ZONE-Y' }
  ];
  obstacles.forEach(obs => {
    grid[obs.y][obs.x] = {
      ...grid[obs.y][obs.x],
      type: CELL_TYPES.OBSTACLE,
      label: obs.label
    };
  });

  // 5. Storage Shelves (Racks A, B, C, D)
  // Double-deep rack pairs:
  // Pod 1 (cols 3, 4) - rows 4 to 6 & 8 to 10
  // Pod 2 (cols 7, 8) - rows 4 to 6 & 8 to 10
  // Pod 3 (cols 11, 12) - rows 4 to 6 & 8 to 10
  // Pod 4 (cols 15, 16) - rows 4 to 6 & 8 to 10
  const rackConfigs = [
    { colStart: 3, colEnd: 4, rowStart: 4, rowEnd: 6, labelPrefix: 'RA1', prodId: 'PROD-01' },
    { colStart: 3, colEnd: 4, rowStart: 8, rowEnd: 10, labelPrefix: 'RA2', prodId: 'PROD-02' },
    { colStart: 7, colEnd: 8, rowStart: 4, rowEnd: 6, labelPrefix: 'RB1', prodId: 'PROD-03' },
    { colStart: 7, colEnd: 8, rowStart: 8, rowEnd: 10, labelPrefix: 'RB2', prodId: 'PROD-04' },
    { colStart: 11, colEnd: 12, rowStart: 4, rowEnd: 6, labelPrefix: 'RC1', prodId: 'PROD-05' },
    { colStart: 11, colEnd: 12, rowStart: 8, rowEnd: 10, labelPrefix: 'RC2', prodId: 'PROD-06' },
    { colStart: 15, colEnd: 16, rowStart: 4, rowEnd: 6, labelPrefix: 'RD1', prodId: 'PROD-07' },
    { colStart: 15, colEnd: 16, rowStart: 8, rowEnd: 10, labelPrefix: 'RD2', prodId: 'PROD-08' }
  ];

  rackConfigs.forEach(rc => {
    for (let c = rc.colStart; c <= rc.colEnd; c++) {
      for (let r = rc.rowStart; r <= rc.rowEnd; r++) {
        grid[r][c] = {
          ...grid[r][c],
          type: CELL_TYPES.SHELF,
          label: `${rc.labelPrefix}`,
          shelfId: `${rc.labelPrefix}-${c}-${r}`,
          productId: rc.prodId
        };
      }
    }
  });

  // 6. Shared Critical Resources (Bottlenecks, one-way bridges, key intersections)
  // Shared corridor C-1: (9, 7)
  // Shared corridor C-2: (13, 7)
  // Shared intersection INT-1: (5, 7)
  // Shared intersection INT-2: (17, 7)
  const sharedResources = [
    { x: 9, y: 7, resourceId: 'RES-CORRIDOR-1', name: 'Central Choke Corridor 1' },
    { x: 13, y: 7, resourceId: 'RES-CORRIDOR-2', name: 'East Access Corridor 2' },
    { x: 5, y: 7, resourceId: 'RES-INT-1', name: 'West Main Cross Intersection' },
    { x: 17, y: 7, resourceId: 'RES-INT-2', name: 'East Main Cross Intersection' }
  ];

  sharedResources.forEach(res => {
    grid[res.y][res.x].resourceId = res.resourceId;
    grid[res.y][res.x].resourceName = res.name;
  });

  return grid;
}

export function isCellTraversable(grid, x, y, options = {}) {
  const { ignoreRobots = false, robotPositions = [], selfId = null } = options;

  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
    return false;
  }

  const cell = grid[y][x];
  // Shelves and obstacles are permanently impassable
  if (cell.type === CELL_TYPES.SHELF || cell.type === CELL_TYPES.OBSTACLE) {
    return false;
  }

  // Check if another robot is currently located on this cell
  if (!ignoreRobots && robotPositions.length > 0) {
    const isOccupied = robotPositions.some(
      r => r.x === x && r.y === y && r.id !== selfId && !r.isFailed
    );
    if (isOccupied) return false;
  }

  return true;
}
