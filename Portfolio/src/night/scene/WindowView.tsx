import { Sky } from "./window/Sky";
import { Skyline } from "./window/Skyline";
import { Plane } from "./window/Plane";

/** Everything seen through the window: sky, moon, stars, the city skyline and the occasional plane. */
export function WindowView() {
  return (
    <group>
      <Sky />
      <Skyline />
      <Plane />
    </group>
  );
}
