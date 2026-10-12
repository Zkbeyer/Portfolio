// World-space layout for the Night Shift room (metres, y up, back wall at z = WALL_Z).
// Props (P3) and camera shots both read from here so everything stays aligned.
export type Vec3 = [number, number, number];

export const WALL_Z = -1.6;
export const ROOM = { width: 8, height: 4, leftX: -4 } as const;

// Round-3 layout (Zack, 2026-10-12): a compact walnut desk against the slat wall, a record console under a
// window on the right, a floor telescope by the window, shelf + sunset lamp + monstera on the left.
export const DESK = {
  topY: 0.74,
  centerX: -0.45,
  width: 1.8,
  depth: 0.75,
  centerZ: -1.18,
} as const;

// Window opening in the back wall (lower sill, over the record console).
export const WINDOW = { x0: 0.95, x1: 2.45, y0: 1.0, y1: 2.55 } as const;
export const WINDOW_CENTER: Vec3 = [(WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, WALL_Z];

/** Low walnut record console under the window: turntable, vinyl cubby, mushroom lamp. */
export const CONSOLE = { x0: 0.95, x1: 2.4, topY: 0.6, depth: 0.42, z: -1.37 } as const;

/** Walnut monitor riser spanning both screens. */
export const RISER = { x0: -1.0, x1: 0.38, height: 0.065, z: -1.38, depth: 0.27 } as const;

export const SHELF = { center: [-1.7, 1.85, -1.45] as Vec3, width: 1.3, depth: 0.28 } as const;

const CONSOLE_TOP = CONSOLE.topY;

// Anchor points for props.
export const ANCHORS = {
  lamp: [-1.18, DESK.topY, -1.36] as Vec3,
  lampHead: [-0.85, 1.48, -1.18] as Vec3,
  // dual monitors on a walnut riser: landscape main + portrait second (right, angled in)
  monitor: [-0.6, DESK.topY + 0.065, -1.38] as Vec3,
  monitorScreen: [-0.6, 1.145, -1.34] as Vec3,
  monitor2Screen: [0.1, 1.2, -1.3] as Vec3,
  /** Midpoint of both screens: camera shot, label and hit box for the "projects" hotspot. */
  monitorsCenter: [-0.27, 1.17, -1.34] as Vec3,
  pi: [-1.3, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  books: [-2.1, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  plant: [-1.12, SHELF.center[1] + 0.03, SHELF.center[2]] as Vec3,
  mug: [-1.08, DESK.topY, -0.92] as Vec3,
  notebook: [0.2, DESK.topY, -0.98] as Vec3,
  /** The turntable on the record console (the "lofi" audio toggle; id kept as "cassette"). */
  cassette: [1.42, CONSOLE_TOP, -1.36] as Vec3,
  /** Little vintage model plane on the window sill (the "work" hotspot; the real plane outside is an easter egg). */
  modelPlane: [1.62, WINDOW.y0, WALL_Z + 0.07] as Vec3,
  /** Floor-standing telescope by the window. */
  telescope: [2.6, 0, -1.15] as Vec3,
} as const;

// Restyle (P4.5): Japandi oak slat panel framing the monitors,
// and a wool rug under the desk.
export const SLATS = { x0: -1.42, x1: 0.52, y0: 0, y1: 2.9, pitch: 0.07, width: 0.042, depth: 0.03 } as const;
export const RUG = { center: [0.0, 0.004, -0.45] as Vec3, size: [3.0, 2.0] as [number, number] } as const;

// The world outside the window (P2). Everything here sits behind the back wall (z < WALL_Z).
export const OUTSIDE = {
  /** Sky backdrop plane: wide enough to survive parallax and the close "plane" shot. */
  sky: { center: [3, 2.75, -8] as Vec3, size: [12, 9] as [number, number] },
  moon: { position: [3.3, 3.55] as [number, number], radius: 0.19 },
  /** Ground line the skyline buildings start from (hidden below the sill). */
  ground: -1,
  plane: { z: -7, x0: -1.5, x1: 8.5, y0: 3.45, y1: 3.7 },
} as const;
