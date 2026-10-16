/**
 * Brightness of each group of lights, 0–1, written every frame by <LightDriver> and read by
 * <Dimmable> wrappers. Two things move it: the intro (lamps flicker on one by one once the room has
 * rendered) and the light switch (desk + floor lamps fade off / flicker back on).
 */
export type LightGroup = "desk" | "floor" | "accent" | "screens" | "ambient";
export const LEVELS: Record<LightGroup, number> = { desk: 0, floor: 0, accent: 0, screens: 0, ambient: 0.35 };
