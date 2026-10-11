import { Monitor } from "./Monitor";
import { Lamp } from "./Lamp";
import { Books } from "./Books";
import { Plant } from "./Plant";
import { Mug } from "./Mug";

/** Everything on the desk and shelf. Positions come from layout.ts ANCHORS. */
export function Props() {
  return (
    <group>
      <Monitor />
      <Lamp />
      <Books />
      <Plant />
      <Mug />
    </group>
  );
}
