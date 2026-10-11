import { useEffect, useMemo, type DependencyList } from "react";

/**
 * Create a three.js object (material, geometry, render target…) once per `deps` and dispose it
 * when it's replaced or the component unmounts. The returned object is meant to be mutated in
 * useFrame (uniforms, colours), which is how three.js objects are driven.
 */
export function useDisposable<T extends { dispose(): void }>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}
