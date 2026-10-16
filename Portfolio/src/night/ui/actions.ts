import { toggleLights } from "../scene/lights";
import { playSfx } from "../audio/engine";

/** Flip the room lights, with the switch click (when sound is on). Used by the lamps, the nav button and L. */
export function flipLights() {
  toggleLights();
  playSfx("switch");
}
