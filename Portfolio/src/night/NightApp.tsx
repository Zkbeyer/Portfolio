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
import "./night.css";

// three.js + the scene load in their own chunk after the HTML shell paints.
const NightCanvas = lazy(() => import("./scene/NightCanvas"));

export default function NightApp() {
  useEffect(initAudioEngine, []);
  return (
    <main className="night">
      <section className="night-hero" aria-label="Intro">
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
        <Subtitles />
      </section>
    </main>
  );
}
