import { lazy, Suspense, useEffect } from "react";
import "@fontsource/zen-maru-gothic/latin-500.css";
import "@fontsource/zen-maru-gothic/latin-700.css";
import "@fontsource/kalam/latin-400.css";
import { person } from "../content/site";
import { initAudioEngine } from "./audio/engine";
import { HiddenNav } from "./ui/HiddenNav";
import { Subtitles } from "./ui/Subtitles";
import { INTRO_LINES } from "./ui/copy";
import "./night.css";

// three.js + the scene load in their own chunk after the HTML shell paints.
const NightCanvas = lazy(() => import("./scene/NightCanvas"));

export default function NightApp() {
  useEffect(initAudioEngine, []);
  return (
    <main className="night">
      <HiddenNav />
      <section className="night-hero" aria-label="Intro">
        <div className="night-hero__stage" aria-hidden="true">
          <Suspense fallback={null}>
            <NightCanvas />
          </Suspense>
        </div>
        <header className="night-hero__name">
          <h1>{person.name.toLowerCase()}</h1>
          <p className="hand">{person.title.toLowerCase()} · night shift</p>
          <p className="sr-only">{INTRO_LINES.join(" ")}</p>
        </header>
        <Subtitles />
      </section>
    </main>
  );
}
