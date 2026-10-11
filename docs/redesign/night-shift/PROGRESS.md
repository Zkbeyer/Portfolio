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
- [ ] Sky shader (gradient, stars, moon glow) + skyline layers with lit windows
- [ ] Plane flyby with blinking lights
- [ ] Rain-on-glass shader
### P3 — props
- [ ] Monitor (animated code screen), Lamp, Books, Plant, Mug + steam
- [ ] Pi with status-driven LED (status client with fallback)
- [ ] Notebook, Cassette (spinning reels), Telescope
### P4 — interaction
- [ ] Hotspot component (outline, handwritten label, click → focusOn → scroll)
- [ ] Subtitles overlay + accessible hidden nav
### P5 — audio
- [ ] Procedural rain + lofi track player, cassette/footer toggles, persisted mute
### P6 — HTML sections
- [ ] track 01 notebook spread
- [ ] track 02 monitor playlist (interactive)
- [ ] track 03 homelab + live sticky note
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
- Photos: Grafana screenshot or photo of the Pi; preferred headshot
- Homelab `status.json` endpoint (spec in STATUS_ENDPOINT.md, to be written in P3)

## Log
- 2026-10-07: branches created, plan written.
- 2026-10-07: P0 done — deps added, ~130MB unused models removed, content module, meta tags, new resume.pdf. Old pages still in place until P1 swaps the app (Forest/Duck/SpaceBoi removed then).
- 2026-10-11: P1 done — App now renders `src/night/NightApp` (HTML shell + lazy `NightCanvas` chunk). CameraRig: base shot, mouse parallax, responsive FOV + portrait shift, `focusOn(id)` store (`scene/focus.ts`, Esc / scroll-to-top resets). Shared `scene/layout.ts` anchors for P3 props. Procedural Room (wall with window opening, frame + sill, side wall, floor, desk, shelf). Lighting (lamp spot, window fill, monitor fill, night HDRI) + Post (bloom on >1.0 emissives, neutral tone map, vignette, grain). Window view is a gradient + moon placeholder until P2. Fonts switched to latin subsets (CSS 127KB→0.8KB gz). Initial JS 62KB gz; NightCanvas chunk 433KB gz (three + inlined night HDRI) → revisit in perf pass. Old pages/scenes are still in the tree, unimported; delete in P7 cleanup. Checked in headless Chromium at 960×600 and 360×700.
