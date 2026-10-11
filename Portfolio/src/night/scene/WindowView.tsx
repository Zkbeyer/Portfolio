import { Sky } from "./window/Sky";
import { Skyline } from "./window/Skyline";

/** Everything seen through the window: sky, moon, stars and the city skyline. */
export function WindowView() {
  return (
    <group>
      <Sky />
      <Skyline />
    </group>
  );
}
