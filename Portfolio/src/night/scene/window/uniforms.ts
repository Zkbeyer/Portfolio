import type { ShaderMaterial } from "three";

/** Set a shader uniform from useFrame (keeps three.js mutation out of React's render-data rules). */
export function setUniform(material: ShaderMaterial, name: string, value: unknown) {
  material.uniforms[name].value = value;
}
