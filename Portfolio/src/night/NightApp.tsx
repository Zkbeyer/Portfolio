import { lazy, Suspense, useEffect } from "react";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource/caveat/latin-600.css";
import "@fontsource/dm-mono/latin-400.css";
import { person } from "../content/site";
import { initAudioEngine } from "./audio/engine";
import { SiteNav } from "./ui/SiteNav";
import { Subtitles } from "./ui/Subtitles";
import { HERO_META, HERO_ROLE, INTRO_LINES } from "./ui/copy";
import { DetailPanel } from "./ui/DetailPanel";
import { Eyepiece } from "./ui/Eyepiece";
import { closePanel, getPanel, isPanelId, usePanel } from "./ui/panelStore";
import { goToPanel } from "./scene/hotspots";
import { useRoomKeys } from "./ui/useRoomKeys";
import "./night.css";

// three.js + the scene load in their own chunk after the HTML shell paints.
const NightCanvas = lazy(() => import("./scene/NightCanvas"));

/** #work, #projects… open that panel (on load and when the hash changes, e.g. a plain link or Back). */
function useHashPanels() {
  useEffect(() => {
    const sync = () => {
      const id = window.location.hash.slice(1);
      if (isPanelId(id)) goToPanel(id);
      else if (getPanel()) closePanel();
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
}

export default function NightApp() {
  useEffect(initAudioEngine, []);
  useHashPanels();
  useRoomKeys();
  const panel = usePanel();
  return (
    <main className="night">
      <section className="night-hero" aria-label="Intro" inert={panel !== null}>
        <div className="night-hero__stage" aria-hidden="true">
          <Suspense fallback={null}>
            <NightCanvas />
          </Suspense>
        </div>
        <header className="night-top">
          <div className="night-top__id">
            <h1>{person.name}</h1>
            <p className="night-top__role">{HERO_ROLE}</p>
            <p className="night-top__meta">{HERO_META}</p>
          </div>
          <SiteNav />
        </header>
        <p className="sr-only">{INTRO_LINES.join(" ")}</p>
        <Eyepiece />
        <Subtitles />
      </section>
      <DetailPanel />
    </main>
  );
}
