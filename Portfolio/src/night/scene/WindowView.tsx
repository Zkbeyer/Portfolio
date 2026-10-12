import { useMemo } from "react";
import { createPortal } from "@react-three/fiber";
import { Scene } from "three";
import { Sky } from "./window/Sky";
import { Hills } from "./window/Hills";
import { Plane } from "./window/Plane";
import { RainGlass } from "./window/RainGlass";

/**
 * Everything seen through the window — sky, moon, stars, layered hills with village lights and the occasional
 * plane — lives in its own scene and is only ever seen through the rain-streaked glass.
 */
export function WindowView() {
  const outside = useMemo(() => new Scene(), []);
  return (
    <>
      {createPortal(
        <>
          <Sky />
          <Hills />
          <Plane />
        </>,
        outside,
      )}
      <RainGlass outside={outside} />
    </>
  );
}
