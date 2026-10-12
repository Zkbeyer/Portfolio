import { useEffect, useRef, useState } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Group, Mesh, Vector3 } from "three";
import { WALL_Z, WINDOW } from "../layout";
import { HotspotLabel } from "../Hotspot";
import { activateHotspot, clearHovered, getHovered, setHovered, useHotspotActive } from "../hotspots";
import { planeState } from "./planeState";

const MARGIN = 0.04;
const noRaycast = () => null;
const ray = new Vector3();

/**
 * The plane lives in the outside-world portal (seen through the rain-glass render target), so its
 * hotspot is a separate proxy in the main scene that follows `planeState`. It only accepts the
 * pointer while the plane is actually visible through the window opening, never through the wall.
 */
export function PlaneHotspot() {
  const group = useRef<Group>(null);
  const proxy = useRef<Mesh>(null);
  const [inWindow, setInWindow] = useState(false);
  const inWindowRef = useRef(false);
  const active = useHotspotActive("plane");

  useEffect(() => () => clearHovered("plane"), []);

  useFrame(({ camera }) => {
    const g = group.current;
    const m = proxy.current;
    if (!g || !m) return;
    let visible = false;
    if (planeState.visible) {
      g.position.copy(planeState.position);
      // Where does the camera → plane ray cross the back wall? Inside the opening = visible.
      ray.copy(planeState.position).sub(camera.position);
      const t = (WALL_Z - camera.position.z) / ray.z;
      const x = camera.position.x + ray.x * t;
      const y = camera.position.y + ray.y * t;
      visible =
        t > 0 && x > WINDOW.x0 + MARGIN && x < WINDOW.x1 - MARGIN && y > WINDOW.y0 + MARGIN && y < WINDOW.y1 - MARGIN;
    }
    m.raycast = visible ? Mesh.prototype.raycast : noRaycast;
    if (visible !== inWindowRef.current) {
      inWindowRef.current = visible;
      setInWindow(visible);
      if (!visible && getHovered() === "plane") setHovered(null);
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered("plane");
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    activateHotspot("plane");
  };

  return (
    <group ref={group}>
      <mesh ref={proxy} onPointerOver={over} onPointerOut={() => clearHovered("plane")} onClick={click}>
        <sphereGeometry args={[0.45, 10, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {inWindow && <HotspotLabel id="plane" position={[0, -0.35, 0]} active={active} />}
    </group>
  );
}
