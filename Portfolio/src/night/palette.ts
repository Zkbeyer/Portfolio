// Night Shift palette — mid-century modern × Japandi restyle (PLAN.md → "Restyle").
// Warm neutrals + woods as the base, accents used sparingly (one per object).
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
  walnut: "#5E3F2B",
  walnutDark: "#3F2A1D",
  oak: "#C49A6C",
  oakLight: "#D8B98F",
  // accents
  mustard: "#D9A441",
  terracotta: "#C0623E",
  olive: "#7C7F45",
  sage: "#9DA88C",
  teal: "#2F5D62",
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
  frame: "#C49A6C",
  shelf: "#C49A6C",
  deskTop: "#5E3F2B",
  deskFront: "#3F2A1D",
  shadowPurple: "#3F2A1D",
  deep2: "#1A1530",
  deep3: "#16122A",
  // window view (restyled in R3)
  skyTop: "#0E0F2E",
  skyMid: "#2A1F4E",
  skyLow: "#5C3C6D",
  moon: "#F3E7C9",
  cityLight: "#F5B971",
} as const;
