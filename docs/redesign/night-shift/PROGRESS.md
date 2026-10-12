# Night Shift — progress (resume point for any session)

Rules for every session (attended or scheduled):
- Work only on branch `redesign/night-shift`. Never push, merge or touch `main`. Never force-push.
- Do the NEXT unchecked item(s). After each item: `npm run build` in `Portfolio/` must pass, then commit with a clear message.
- Append a dated line to the Log below. If blocked (needs Zack's input/asset), write it under "Blocked" and move to the next unblocked item.
- Read `PLAN.md` first. Facts only from the resume; no invented numbers.

## Checklist
### P0 — setup
- [x] Create branches `redesign/night-shift` and `redesign/sessions`
- [x] Write PLAN.md / PROGRESS.md
- [x] `npm ci`; add deps: @fontsource/kalam, @fontsource/zen-maru-gothic, @pmndrs/assets
- [x] Remove unused heavy assets + old pages (see PLAN Cleanup)
- [x] `src/content/site.ts` single content source from the Oct 2026 resume
- [x] index.html meta/OG/favicon fixes; replace resume.pdf
### P1 — scene shell
- [x] NightCanvas + CameraRig (base framing, parallax)
- [x] Room shell (walls, window cut-out, floor, desk, shelf) with palette materials
- [x] Lighting (lamp, window, monitor) + Environment(night) + Post (bloom, vignette, grain)
### P2 — window
- [x] Sky shader (gradient, stars, moon glow) + skyline layers with lit windows
- [x] Plane flyby with blinking lights
- [x] Rain-on-glass shader
### P3 — props
- [x] Monitor (animated code screen), Lamp, Books, Plant, Mug + steam
- [x] Pi with status-driven LED (status client with fallback)
- [x] Notebook, Cassette (spinning reels), Telescope
### P4 — interaction
- [x] Hotspot component (outline, handwritten label, click → focusOn → scroll)
- [x] Subtitles overlay + accessible hidden nav
### P5 — audio
- [ ] Procedural rain + lofi track player, cassette/footer toggles, persisted mute
### P6 — HTML sections
- [ ] track 01 notebook spread
- [ ] track 02 monitor playlist (interactive)
- [ ] track 03 homelab + sticky note — static, no live endpoint (Zack, 2026-10-12): drop the status fetch, make the Pi LED a steady green with activity flicker, sticky note shows "status: running" only (no uptime/self-heal)
- [ ] track 04 about window + polaroid
- [ ] now-playing footer
### P7 — polish
- [ ] Mobile layout + bottom-sheet hotspots
- [ ] Reduced-motion/no-WebGL poster
- [ ] Perf pass (bundle split, dpr, draw calls), lint clean
- [ ] OG image

## Blocked / needs Zack
- Royalty-free lofi track → `Portfolio/public/audio/lofi.mp3` (placeholder used until then)
- Optional: Kenney Furniture Kit (CC0) unzipped into `Portfolio/public/models/kenney-furniture/`
- Photo: preferred headshot

## Log
- 2026-10-07: branches created, plan written.
- 2026-10-07: P0 done — deps added, ~130MB unused models removed, content module, meta tags, new resume.pdf. Old pages still in place until P1 swaps the app (Forest/Duck/SpaceBoi removed then).
- 2026-10-11: P1 done — App now renders `src/night/NightApp` (HTML shell + lazy `NightCanvas` chunk). CameraRig: base shot, mouse parallax, responsive FOV + portrait shift, `focusOn(id)` store (`scene/focus.ts`, Esc / scroll-to-top resets). Shared `scene/layout.ts` anchors for P3 props. Procedural Room (wall with window opening, frame + sill, side wall, floor, desk, shelf). Lighting (lamp spot, window fill, monitor fill, night HDRI) + Post (bloom on >1.0 emissives, neutral tone map, vignette, grain). Window view is a gradient + moon placeholder until P2. Fonts switched to latin subsets (CSS 127KB→0.8KB gz). Initial JS 62KB gz; NightCanvas chunk 433KB gz (three + inlined night HDRI) → revisit in perf pass. Old pages/scenes are still in the tree, unimported; delete in P7 cleanup. Checked in headless Chromium at 960×600 and 360×700.
- 2026-10-11 (scheduled run): P2 done — window view. `scene/window/`: Sky shader (gradient mapped to the visible band, hashed twinkling stars, moon + halo), Skyline (3 seeded layers, merged geometry per layer, lit/flickering windows in-shader, rooftop blocks, pulsing antenna beacons), Plane (silhouette + nav lights/strobe/beacon, crosses every ~21s, `planeState` exported for the P4 hotspot), RainGlass (outside world lives in its own scene via `createPortal`, rendered each frame to a half-res HalfFloat mip-mapped target; glass samples it in screen space — fogged glass = blurred mip, running drops/trails/beads = sharp + refracted). New hooks: `useSceneTime` (frozen frame under reduced motion), `useDisposable`. `src/night` is lint-clean; remaining lint errors are all in legacy pages slated for P7 deletion. NightCanvas chunk 438KB gz (+2KB). Note for future runs: the device shell is Linux and the repo's node_modules are macOS-native, so builds run in a mirror (`~/build`, `npm ci` there) — no changes to the repo's node_modules. Checked in headless Chromium at 960×600 (normal + reduced motion) and 390×760.
- 2026-10-11 (scheduled run 2): P3 done — all props procedural in `scene/props/` (mounted by `Props.tsx`). Monitor: code-editor shader (gutter, syntax-coloured glyph runs, line typed char by char with caret, buffer scrolls; `active` raises brightness) + instanced keyboard (1 draw call). Lamp (articulated arms, shade aimed at the same spot as the Lighting spotlight, blooming bulb), Books (seeded row, last one leaning on its neighbour), Plant (pothos, two trailing vines with sway), Mug (lathe-hollow, glaze band, billboarded steam shader). Pi 5 case with status LED driven by `status/homelabStatus.ts` (useSyncExternalStore, 5s timeout, 60s poll only while visible, strict JSON validation → unknown on any failure; green steady w/ activity flicker, amber breathe, red blink) + cable down the wall; STATUS_ENDPOINT.md written. Notebook (canvas-drawn ruled pages w/ handwriting strokes, lit by the scene; top page flutters on `active`), Cassette player (`playing` spins reels at different rates, LED, play key pressed), Telescope (tripod, refractor aimed through the window, leans toward cursor; off under reduced motion). Moved anchors for books (-1.95), cassette (1.9, z -1.35) and telescope (2.2, z -1.0) so they are inside the base shot. `active`/`playing` props are ready for P4 hotspots. NightCanvas chunk 443KB gz (+5KB). Lint clean in `src/night`. Checked status states by mocking status.json, and renders at 1280×800, 960×600 reduced-motion and 390×760 in headless Chromium (cloud preview of the build). Note: Playwright can't download browsers on the device shell, so previews run from a copied `dist`.
- 2026-10-12 (scheduled run): P4 done — `scene/hotspots.ts` is the shared hotspot config (label, subtitle hint, section) + `activateHotspot` (monitor/pi/plane/telescope → `focusOn` + scroll; notebook → focus + opens resume.pdf in a new tab; cassette → `audio/audioStore` toggle, which the P5 engine will subscribe to) + a hover store. `Hotspot.tsx`: invisible hit box per prop (nearest wins via stopPropagation), drei `Html` handwritten label (amber when active), hover feedback = warm emissive lift on the prop's standard materials plus each prop's own `active` animation. Deviation from PLAN: no outline — the postprocessing `<Selection>/<Select>` pair loops (Select re-registers on every context change) and a directly-fed `OutlineEffect` drew nothing in testing, so it was dropped rather than shipped unverified. `PlaneHotspot`: proxy follows `planeState`, only hoverable/labelled while the plane is seen through the window opening. `ui/Subtitles`: intro lines (from the mockup) fade in; hovered/focused object swaps in its line; '← back to the desk (esc)' button while focused. `ui/HiddenNav`: visually hidden until focus; work/projects/homelab/about anchors, resume (pdf), lofi toggle with aria-pressed. Section anchors (#work etc.) don't exist until P6, so focus+scroll currently only moves the camera. Main chunk 64.8KB gz, NightCanvas 449KB gz. Build + `eslint src/night` clean. Checked in headless Chromium (cloud copy of the build) at 1280×800 and 390×760: hover on pi/cassette/telescope/monitor, cassette toggle, notebook focus + back button, Tab reveals the nav. Mobile labels clip at the edges → P7 bottom sheet.
- 2026-10-12: Zack: no homelab status endpoint and no Grafana/Pi photos needed. Removed both from Blocked; track 03 reworded to a static sticky note + decorative LED (applies when P6 reaches it).
