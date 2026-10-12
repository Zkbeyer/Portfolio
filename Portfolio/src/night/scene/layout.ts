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

// Anchor points for props. Books/cassette/telescope were pulled inward in P3 so they stay in the base shot.
export const ANCHORS = {
  lamp: [-1.75, DESK.topY, -1.2] as Vec3,
  lampHead: [-1.35, 1.5, -1.05] as Vec3,
  monitor: [0.05, DESK.topY, -1.3] as Vec3,
  monitorScreen: [0.05, 1.08, -1.26] as Vec3,
  pi: [-1.0, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  books: [-1.95, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  plant: [-0.85, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  mug: [0.95, DESK.topY, -0.95] as Vec3,
  notebook: [1.35, DESK.topY, -0.85] as Vec3,
  cassette: [1.9, DESK.topY, -1.35] as Vec3,
  telescope: [2.2, DESK.topY, -1.0] as Vec3,
} as const;

// Restyle (P4.5): Japandi oak slat panel framing the monitors,
// a paper lantern pendant, and a wool rug under the desk.
export const SLATS = { x0: -0.72, x1: 0.5, y0: 0, y1: 2.9, pitch: 0.07, width: 0.042, depth: 0.03 } as const;
export const LANTERN = { position: [-0.15, 2.58, -1.12] as Vec3, radius: 0.21, cordTop: 4 } as const;
export const RUG = { center: [0.1, 0.004, -0.55] as Vec3, size: [3.6, 2.2] as [number, number] } as const;

// The world outside the window (P2). Everything here sits behind the back wall (z < WALL_Z).
export const OUTSIDE = {
  /** Sky backdrop plane: wide enough to survive parallax and the close "plane" shot. */
  sky: { center: [3, 2.75, -8] as Vec3, size: [12, 9] as [number, number] },
  moon: { position: [3.2, 3.95] as [number, number], radius: 0.19 },
  /** Ground line the skyline buildings start from (hidden below the sill). */
  ground: -1,
  plane: { z: -7, x0: -1.5, x1: 8.5, y0: 3.45, y1: 3.7 },
} as const;
