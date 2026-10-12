# Night Shift — build plan

Branch: `redesign/night-shift` (never merge to `main` without Zack's OK).
App: the existing Vite + React + React Three Fiber project in `Portfolio/`.
Approved mockup: canvas artboard "1 — Night Shift (lofi) · full page".

## Concept
A cozy lofi desk at 2am, rain on the window. The hero is ONE real-time 3D room.
Every object is navigation:

| Object | Goes to | Behaviour |
|---|---|---|
| Monitor | Projects ("on the monitor" playlist) | screen shows animated code; hover glow |
| Raspberry Pi (red case, shelf) | Homelab | LED: steady green with activity flicker (decorative; no live status) |
| Plane crossing the window | Work ("the day job") | blinking nav lights, crosses every ~20s |
| Telescope | About ("through the telescope") | tilts slightly toward cursor |
| Notebook | Resume PDF | pages flutter on hover |
| Cassette player | Audio toggle | reels spin while playing |

Intro copy is shown as anime-style subtitles at the bottom of the hero.
Below the hero, normal HTML sections (fast, accessible, indexable):
1. **track 01 — the day job**: notebook spread (Garmin left page, DataAnnotation + "next stop" right page).
2. **track 02 — on the monitor**: projects as a playlist; selecting a track swaps the detail panel.
3. **track 03 — the little red box on the shelf**: homelab, Pi illustration, static "status: running" sticky note.
4. **track 04 — through the telescope**: about, taped polaroid, night window.
5. **now playing** footer: contact links + audio state.

## Restyle notes, round 2 (Zack, 2026-10-12) — these override the section below where they differ
- **No big/ceiling light.** Only small lamps. The room should feel dark, lit by accent lighting.
- **One accent colour: reddish orange** (`accent #D1492A`, `accentDeep #9E3220`, `accentSoft #E8774F`). Other colours stay neutral.
- **Darker accent wood** (walnut `#3E2618`, "oak" `#7A5236`).
- **Accent lighting**: desk lamp (key), a **sunset projector lamp** throwing a disc on the wall, lava lamp, vintage mushroom lamp, orange LED bias glow behind the monitors, candle.
- **Decor leans vintage/fun.** Zack does not like the framed print, the sunburst clock or the vase of stems — don't bring them back.
- Pinterest: Zack offered his "Apartment Inspiration" board; needs him to log in to Pinterest in the Claude app's browser (or share a public link) before a run can look at it.

## Restyle — mid-century modern × Japandi (Zack, 2026-10-12)
Zack's direction: more mid-century modern × Japandi (his aesthetic), a more aesthetic room and view,
neutral colours with fun accents, a dual-monitor setup, and more decor on the desk. It's still 2am, rain on the glass,
same hotspots and interactions; only the look changes. This **supersedes the palette below** (kept for history) and
applies to the HTML sections too (P6 builds on the new tokens).

Direction (from Japandi/MCM palette guides; Pinterest itself can't be fetched from here):
- **Base neutrals**: warm oat/linen plaster walls, cream, greige, charcoal in small doses. One warm undertone throughout.
- **Woods**: walnut (desk, riser, frames) + light oak (slat panel, shelf, window grid). Matte finishes, no gloss.
- **Fun accents (sparingly)**: mustard, terracotta/burnt orange, olive/sage, deep teal. One accent per object.
- **Shapes**: MCM tapered splayed legs, rounded rectangles, sunburst clock, globe/mushroom lamp; Japandi vertical slats,
  shoji-style window grid, paper lantern, ceramics, dried stems, bonsai, linen/wool textures.
- **Light**: warm lamp + paper lantern pools, cool moonlight from the window, monitor fill. Night, but cozy, not purple.
- **View**: ink-blue night sky with a soft dusty-rose horizon glow, layered mountain/hill silhouettes with sparse warm
  town lights (replaces the purple city skyline), moon, plane, rain on glass.

Tokens (`src/night/palette.ts`): plaster `#CDBFAA`, plasterShade `#A89A86`, linen `#E8DFD0`, cream `#F3ECE0`,
greige `#8C8275`, charcoal `#2E2B28`, ink `#24221F`, walnut `#5E3F2B`, walnutDark `#3F2A1D`, oak `#C49A6C`,
oakLight `#D8B98F`, mustard `#D9A441`, terracotta `#C0623E`, olive `#7C7F45`, sage `#9DA88C`, teal `#2F5D62`,
lamp `#FFC98A`, screen `#9CC3FF`, led `#8CFFB0`, skyTop `#0D1424`, skyMid `#1E2A44`, skyLow `#6B5266`, moon `#F3E7C9`.

## Visual system (original — superseded by the restyle above)
- Palette: wall `#251E40`, deep `#191430`/`#1A1530`/`#16122A`, cream `#F4E9D8`, lamp amber `#FFC77A`,
  screen blue `#7FA8FF`, Pi red `#C4505E`, LED green `#8CFFB0`, paper `#EFE6D6`, ink `#2B2238`.
- Type: Zen Maru Gothic (UI/body), Kalam (handwritten notes/labels). Self-hosted via @fontsource.
- Post-processing: selective Bloom on emissives, Vignette, subtle Noise (film grain). No chromatic aberration.

## 3D scene architecture (`src/night/scene/`)
- `NightCanvas.tsx` — Canvas, dpr clamp [1, 1.75] (mobile 1), shadows off (fake with AO/contact shadows), Suspense.
- `CameraRig.tsx` — base framing (desk facing window), mouse parallax, `focusOn(objectId)` eases camera then scrolls to section.
- `Room.tsx` — procedural shell: back wall with window cut-out, side wall, floor, desk, shelf. Rounded boxes (drei `RoundedBox`), MeshStandardMaterial, palette tokens.
- `WindowView.tsx` — sky shader (gradient + stars + moon glow), parallax city skyline layers with lit windows, `Plane.tsx` flyby.
- `RainGlass.tsx` — custom shader on the glass: droplets + running streaks that refract the sky (classic "rain on glass" technique, procedural, no textures).
- `props/` — `Monitor`, `Lamp` (spotlight + emissive shade), `Pi`, `Books`, `Plant`, `Mug` (+ steam shader), `Notebook`, `Cassette`, `Telescope`.
- `Hotspot.tsx` — wraps a prop: hover outline (drei `<Outlines>`), handwritten label via drei `<Html>`, click → `focusOn`.
- `lighting.tsx` — warm lamp key, cool window fill, monitor fill; `Environment` from `@pmndrs/assets/hdri/night` at low intensity.
- `Post.tsx` — EffectComposer setup.

Asset strategy: everything procedural (geometry + shaders) so the look is cohesive and the payload is tiny.
Optional upgrade: swap selected props for Kenney "Furniture Kit" (CC0) models if Zack downloads it into
`Portfolio/public/models/kenney-furniture/` — each prop component must accept an optional GLTF path.

## Audio (`src/night/audio/`)
- Off by default; cassette or footer toggle enables (user gesture).
- Rain: procedural WebAudio (filtered noise + random droplet ticks), no file.
- Music: one lofi track at `public/audio/lofi.mp3` (Zack supplies a royalty-free track; until then fall back to existing `home-ambient.mp3`).
- Remember mute preference in localStorage (wrapped in try/catch).

## Live homelab status — dropped (Zack, 2026-10-12)
No endpoint will be exposed. In P6, remove the fetch in `status/homelabStatus.ts` (or pin it to "healthy") and drop uptime/self-heal from the copy. Original plan kept below for reference.
- Client fetches `VITE_STATUS_URL` (default `https://status.ailuruslab.dev/status.json`), expects
  `{ "healthy": bool, "uptimeSeconds": number, "lastSelfHeal": ISO8601|null }`, 5s timeout, 60s poll.
- Unknown/failed fetch → amber LED + "status: unknown". Never block render.
- Endpoint itself is Zack's to expose from his Go service (documented in `docs/redesign/night-shift/STATUS_ENDPOINT.md`).

## Content
Single typed source: `src/content/site.ts` (experience, projects, skills, links) — shared with the Sessions branch.
Facts come only from the Oct 2026 resume. No invented metrics.

## Cleanup (this branch)
- Delete unused heavy assets: `public/Cathedral` (104MB), `public/Clouds`, `public/Forest`, `public/Duck`, `assets/headshot1.JPG`, duplicate `resume-2026.pdf`/`project1.png`/`project2.png`.
- Replace old pages/scenes with the night app; keep git history.
- Remove `src/night/scene/window/Skyline.tsx` (+ its SKYLINE_* shaders), unused since the R3 restyle swapped it for `Hills.tsx`.
- `index.html`: real title, meta description, Open Graph/Twitter card + image, fixed favicon path.
- Fix `${BASE_URL}/x` double slashes.
- Replace `public/resume.pdf` with the Oct 2026 resume.

## Performance & accessibility budget
- Initial JS ≤ 350KB gz (three is lazy-loaded after first paint of HTML shell).
- Hero LCP ≤ 2.5s on mid laptop; 60fps desktop, 30+ fps mobile.
- `prefers-reduced-motion` → static poster image of the room (render once, save `public/night/poster.webp`), no camera moves.
- No WebGL → poster. Keyboard: every hotspot also exists as a real link in a visually-hidden-until-focus nav.
- Text contrast ≥ 4.5:1. Mobile: hero becomes a vertical crop, hotspots become a bottom sheet list.

## Definition of done
All PROGRESS.md items checked, `npm run build` passes with no TS errors, lint clean,
manual check on desktop + mobile widths, Zack reviews a local preview before anything touches `main`.
