// World-space layout for the Night Shift room (metres, y up, back wall at z = WALL_Z).
// Props (P3) and camera shots both read from here so everything stays aligned.
export type Vec3 = [number, number, number];

export const WALL_Z = -1.6;
export const ROOM = { width: 8, height: 4, leftX: -4 } as const;

export const DESK = {
  topY: 0.74,
  width: 5.6,
  depth: 0.85,
  centerZ: -1.12,
} as const;

// Window opening in the back wall.
export const WINDOW = { x0: 0.6, x1: 2.6, y0: 1.2, y1: 2.7 } as const;
export const WINDOW_CENTER: Vec3 = [(WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, WALL_Z];

export const SHELF = { center: [-1.7, 1.95, -1.45] as Vec3, width: 2.0, depth: 0.28 } as const;

// Anchor points for props (P3 places meshes here).
export const ANCHORS = {
  lamp: [-1.75, DESK.topY, -1.2] as Vec3,
  lampHead: [-1.35, 1.5, -1.05] as Vec3,
  monitor: [0.05, DESK.topY, -1.3] as Vec3,
  monitorScreen: [0.05, 1.08, -1.26] as Vec3,
  pi: [-1.0, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  books: [-2.4, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  plant: [-0.85, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  mug: [0.95, DESK.topY, -0.95] as Vec3,
  notebook: [1.35, DESK.topY, -0.85] as Vec3,
  cassette: [2.05, DESK.topY, -1.2] as Vec3,
  telescope: [2.5, DESK.topY, -0.9] as Vec3,
} as const;
