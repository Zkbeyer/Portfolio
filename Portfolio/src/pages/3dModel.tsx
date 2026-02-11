import { Canvas } from "@react-three/fiber";
import {PerspectiveCamera } from "@react-three/drei";
import  { Suspense } from "react";
//import CrtMonitor from '../components/3dModels/CrtMonitor';
//import Terminal from '../components/3dModels/Terminal';
import Clouds from '../components/3dModels/Clouds';



function GlbModel() {
  return (
      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <PerspectiveCamera makeDefault position={[0, 0, -3]} fov={70} />
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        
        <Suspense fallback={null}> 
          <Clouds />
        </Suspense>
      </Canvas>
  );
}

export default GlbModel;