// Night Shift palette — mid-century modern × Japandi restyle (PLAN.md → "Restyle").
// Warm neutrals + dark woods as the base; ONE accent colour, a reddish orange (Zack, 2026-10-12).
export const PALETTE = {
  // base neutrals
  plaster: "#CDBFAA",
  plasterShade: "#A89A86",
  linen: "#E8DFD0",
  cream: "#F3ECE0",
  greige: "#8C8275",
  charcoal: "#2E2B28",
  ink: "#24221F",
  // woods
  walnut: "#3E2618",
  walnutDark: "#2A190F",
  oak: "#7A5236", // "accent wood": darker than natural oak, per Zack
  oakLight: "#8C6440",
  // the accent: reddish orange (+ a deeper and a softer step of it)
  accent: "#D1492A",
  accentDeep: "#9E3220",
  accentSoft: "#E8774F",
  // supporting tones (used quietly: brass, plants, screens)
  brass: "#B8924A",
  mustard: "#D9A441",
  olive: "#7C7F45",
  sage: "#9DA88C",
  // light + screens
  lamp: "#FFC98A",
  screen: "#9CC3FF",
  led: "#8CFFB0",
  piRed: "#C4505E",
  paper: "#EFE6D6",
  // backdrop behind everything (matches the HTML hero while the 3D chunk loads)
  deep: "#16130F",

  // ── legacy keys, remapped to the new look until their props are restyled (R3/R5) ──
  wall: "#CDBFAA",
  wallShade: "#A89A86",
  frame: "#7A5236",
  shelf: "#7A5236",
  deskTop: "#3E2618",
  deskFront: "#2A190F",
  shadowPurple: "#2A190F",
  deep2: "#1A1530",
  deep3: "#16122A",
  // window view (R3): ink-blue night, dusty-rose horizon glow
  skyTop: "#0D1424",
  skyMid: "#1E2A44",
  skyLow: "#6B5266",
  moon: "#F3E7C9",
  cityLight: "#F5B971",
} as const;
