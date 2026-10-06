/**
 * Autonomous Mobile Robot (AMR) A* Grid Path Planner
 * Features:
 * - 2D Navigation Grid with Obstacle Safety Margin Inflation
 * - Static Occupied / Restricted Zones (No-Go zones)
 * - Dynamic Obstacle Avoidance
 * - 8-Directional A* Search with Octile/Euclidean Heuristic
 * - Line-of-sight String-Pulling Path Smoothing
 * - Real-time Collision Detection for Manual Drive
 */

export const MAP_BOUNDS = {
  minX: 5,
  maxX: 95,
  minY: 5,
  maxY: 95
};

// Physical dimensions & Safety Clearance
export const ROBOT_RADIUS = 3.5;       // Robot footprint radius in map units
export const SAFETY_MARGIN = 3.5;       // Clearance buffer outside obstacles
export const TOTAL_CLEARANCE = ROBOT_RADIUS + SAFETY_MARGIN; // 7.0 units safe buffer

// Default Static Occupied / Restricted Zones (No-Go Areas)
export const STATIC_OCCUPIED_ZONES = [
  {
    id: 'zone-center-storage',
    type: 'occupied_zone',
    x: 36,
    y: 34,
    width: 28,
    height: 26,
    label: 'Occupied Storage Area'
  }
];

// Default Static Obstacles
export const STATIC_OBSTACLES = [
  { id: 1, x: 28, y: 55, width: 6, height: 6, radius: 3.5, label: 'Pallet Box' }
];

/**
 * Check if a single point (x, y) collides with any occupied zone, obstacle, or map boundary.
 */
export function isPointBlocked(x, y, obstacles = [], occupiedZones = STATIC_OCCUPIED_ZONES, clearance = TOTAL_CLEARANCE) {
  // 1. Map Boundary limits
  if (x < MAP_BOUNDS.minX + clearance || x > MAP_BOUNDS.maxX - clearance ||
      y < MAP_BOUNDS.minY + clearance || y > MAP_BOUNDS.maxY - clearance) {
    return true;
  }

  // 2. Occupied No-Go Zones
  for (const zone of occupiedZones) {
    const minX = zone.x - clearance;
    const maxX = zone.x + zone.width + clearance;
    const minY = zone.y - clearance;
    const maxY = zone.y + zone.height + clearance;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return true;
    }
  }

  // 3. Discrete Obstacles
  for (const obs of obstacles) {
    if (!obs || obs.active === false) continue;
    const obsW = obs.width || 6;
    const obsH = obs.height || 6;
    const minX = obs.x - obsW / 2 - clearance;
    const maxX = obs.x + obsW / 2 + clearance;
    const minY = obs.y - obsH / 2 - clearance;
    const maxY = obs.y + obsH / 2 + clearance;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      return true;
    }
  }

  return false;
}

/**
 * Verify if line segment between p1 and p2 is collision-free with safety clearance.
 */
export function hasLineOfSight(p1, p2, obstacles, occupiedZones, clearance = TOTAL_CLEARANCE) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return true;

  const steps = Math.ceil(dist / 1.5);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const sx = p1.x + dx * t;
    const sy = p1.y + dy * t;
    if (isPointBlocked(sx, sy, obstacles, occupiedZones, clearance)) {
      return false;
    }
  }
  return true;
}

/**
 * Find closest free point if start/dest is right on boundary.
 */
function findNearestFreePoint(pt, obstacles, occupiedZones, maxDist = 12) {
  if (!isPointBlocked(pt.x, pt.y, obstacles, occupiedZones, TOTAL_CLEARANCE)) {
    return pt;
  }
  for (let r = 1; r <= maxDist; r += 1.5) {
    for (let angle = 0; angle < 360; angle += 30) {
      const rad = (angle * Math.PI) / 180;
      const testX = pt.x + Math.cos(rad) * r;
      const testY = pt.y + Math.sin(rad) * r;
      if (!isPointBlocked(testX, testY, obstacles, occupiedZones, TOTAL_CLEARANCE)) {
        return { x: Number(testX.toFixed(1)), y: Number(testY.toFixed(1)) };
      }
    }
  }
  return pt;
}

class MinHeap {
  constructor() {
    this.nodes = [];
  }
  push(node) {
    this.nodes.push(node);
    this.nodes.sort((a, b) => a.f - b.f);
  }
  pop() {
    return this.nodes.shift();
  }
  isEmpty() {
    return this.nodes.length === 0;
  }
}

/**
 * Plan a collision-free path from start to dest using A* search.
 * Returns Array of points [{ x, y }, ...] or null if unreachable.
 */
export function planAStarPath(start, dest, obstacles = [], occupiedZones = STATIC_OCCUPIED_ZONES) {
  const safeStart = findNearestFreePoint(start, obstacles, occupiedZones);
  const safeDest = findNearestFreePoint(dest, obstacles, occupiedZones);

  // If destination is completely inside an obstacle
  if (isPointBlocked(safeDest.x, safeDest.y, obstacles, occupiedZones, ROBOT_RADIUS)) {
    return null;
  }

  // Line of sight shortcut
  if (hasLineOfSight(safeStart, safeDest, obstacles, occupiedZones, TOTAL_CLEARANCE)) {
    return [
      { x: Number(start.x.toFixed(1)), y: Number(start.y.toFixed(1)) },
      { x: Number(dest.x.toFixed(1)), y: Number(dest.y.toFixed(1)) }
    ];
  }

  // Grid step = 2.0 units
  const GRID_STEP = 2.0;
  const toGridKey = (x, y) => `${Math.round(x / GRID_STEP)},${Math.round(y / GRID_STEP)}`;

  const startGrid = {
    x: Math.round(safeStart.x / GRID_STEP) * GRID_STEP,
    y: Math.round(safeStart.y / GRID_STEP) * GRID_STEP
  };
  const goalGrid = {
    x: Math.round(safeDest.x / GRID_STEP) * GRID_STEP,
    y: Math.round(safeDest.y / GRID_STEP) * GRID_STEP
  };

  const openList = new MinHeap();
  const cameFrom = new Map();
  const gScore = new Map();
  const startKey = toGridKey(startGrid.x, startGrid.y);
  const goalKey = toGridKey(goalGrid.x, goalGrid.y);

  gScore.set(startKey, 0);
  const heuristic = (x, y) => Math.sqrt(Math.pow(goalGrid.x - x, 2) + Math.pow(goalGrid.y - y, 2));

  openList.push({
    x: startGrid.x,
    y: startGrid.y,
    f: heuristic(startGrid.x, startGrid.y)
  });

  const visited = new Set();
  let found = false;
  let iterations = 0;
  const MAX_ITERATIONS = 4500;

  const directions = [
    { dx: GRID_STEP, dy: 0, cost: GRID_STEP },
    { dx: -GRID_STEP, dy: 0, cost: GRID_STEP },
    { dx: 0, dy: GRID_STEP, cost: GRID_STEP },
    { dx: 0, dy: -GRID_STEP, cost: GRID_STEP },
    { dx: GRID_STEP, dy: GRID_STEP, cost: GRID_STEP * 1.414 },
    { dx: -GRID_STEP, dy: GRID_STEP, cost: GRID_STEP * 1.414 },
    { dx: GRID_STEP, dy: -GRID_STEP, cost: GRID_STEP * 1.414 },
    { dx: -GRID_STEP, dy: -GRID_STEP, cost: GRID_STEP * 1.414 }
  ];

  while (!openList.isEmpty() && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = openList.pop();
    const currKey = toGridKey(current.x, current.y);

    if (visited.has(currKey)) continue;
    visited.add(currKey);

    const distToGoal = Math.sqrt(Math.pow(goalGrid.x - current.x, 2) + Math.pow(goalGrid.y - current.y, 2));
    if (currKey === goalKey || distToGoal <= GRID_STEP * 1.2) {
      found = true;
      cameFrom.set(goalKey, currKey);
      break;
    }

    const currentG = gScore.get(currKey) ?? Infinity;

    for (const dir of directions) {
      const nextX = current.x + dir.dx;
      const nextY = current.y + dir.dy;
      const nextKey = toGridKey(nextX, nextY);

      if (visited.has(nextKey)) continue;

      // Obstacle collision check with full clearance margin
      if (isPointBlocked(nextX, nextY, obstacles, occupiedZones, TOTAL_CLEARANCE)) {
        continue;
      }

      const tentativeG = currentG + dir.cost;
      const existingG = gScore.get(nextKey) ?? Infinity;

      if (tentativeG < existingG) {
        cameFrom.set(nextKey, currKey);
        gScore.set(nextKey, tentativeG);
        openList.push({
          x: nextX,
          y: nextY,
          f: tentativeG + heuristic(nextX, nextY)
        });
      }
    }
  }

  if (!found) {
    return null;
  }

  // Reconstruct path
  const rawPath = [];
  let curr = goalKey;
  while (curr && curr !== startKey) {
    const [gx, gy] = curr.split(',').map(n => Number(n) * GRID_STEP);
    rawPath.unshift({ x: gx, y: gy });
    curr = cameFrom.get(curr);
  }
  rawPath.unshift({ x: startGrid.x, y: startGrid.y });

  // Anchor start and destination
  rawPath[0] = { x: Number(start.x.toFixed(1)), y: Number(start.y.toFixed(1)) };
  rawPath[rawPath.length - 1] = { x: Number(dest.x.toFixed(1)), y: Number(dest.y.toFixed(1)) };

  // Smooth path using line-of-sight string-pulling
  const smoothed = [rawPath[0]];
  let anchorIdx = 0;

  while (anchorIdx < rawPath.length - 1) {
    let furthestIdx = anchorIdx + 1;
    for (let testIdx = rawPath.length - 1; testIdx > anchorIdx + 1; testIdx--) {
      if (hasLineOfSight(rawPath[anchorIdx], rawPath[testIdx], obstacles, occupiedZones, TOTAL_CLEARANCE)) {
        furthestIdx = testIdx;
        break;
      }
    }
    smoothed.push(rawPath[furthestIdx]);
    anchorIdx = furthestIdx;
  }

  return smoothed.map(p => ({
    x: Number(p.x.toFixed(1)),
    y: Number(p.y.toFixed(1))
  }));
}
