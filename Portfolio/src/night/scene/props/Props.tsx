import { Monitor } from "./Monitor";
import { Lamp } from "./Lamp";
import { Books } from "./Books";
import { Plant } from "./Plant";
import { Mug } from "./Mug";
import { Pi } from "./Pi";
import { Notebook } from "./Notebook";
import { Cassette } from "./Cassette";
import { Telescope } from "./Telescope";

/** Everything on the desk and shelf. Positions come from layout.ts ANCHORS. */
export function Props() {
  return (
    <group>
      <Monitor />
      <Lamp />
      <Books />
      <Plant />
      <Mug />
      <Pi />
      <Notebook />
      <Cassette />
      <Telescope />
    </group>
  );
}
