import { Vector3 } from "three";

/**
 * Live state of the plane outside the window, for other modules (the "day job" hotspot in P4
 * follows the plane while it's visible). Mutated every frame; read it, don't copy it into React state.
 */
export const planeState = { visible: false, progress: 0, position: new Vector3() };
