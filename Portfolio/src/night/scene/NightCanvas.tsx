import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { PALETTE } from "../palette";
import { BASE_SHOT } from "./focus";
import { CameraRig } from "./CameraRig";
import { Room } from "./Room";
import { WindowView } from "./WindowView";
import { Lighting } from "./Lighting";
import { Post } from "./Post";

/** The single real-time 3D room behind the hero. Lazy-loaded so three.js never blocks first paint. */
export default function NightCanvas() {
  const coarse = useMemo(() => typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches, []);

  return (
    <Canvas
      className="night-canvas"
      dpr={coarse ? 1 : [1, 1.75]}
      shadows={false}
      flat // renderer tone mapping off; ToneMapping runs in the post chain (Post.tsx)
      camera={{ fov: 42, near: 0.05, far: 40, position: BASE_SHOT.position }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={[PALETTE.deep]} />
      <Suspense fallback={null}>
        <CameraRig />
        <Lighting />
        <Room />
        <WindowView />
        <Post multisampling={coarse ? 0 : 4} />
      </Suspense>
    </Canvas>
  );
}
