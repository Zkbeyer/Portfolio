import type { ComponentType } from "react";
import type { PanelId } from "../ui/panelStore";
import { WorkSection } from "./WorkSection";
import { ProjectsSection } from "./ProjectsSection";
import { HomelabSection } from "./HomelabSection";
import { AboutSection } from "./AboutSection";

/**
 * The four "tracks". Each body renders twice: as the detail panel behind an object's second click
 * (`ui/DetailPanel`) and as a plain section below the hero (`ui/Tracks`) — content lives once.
 */
export const TRACKS: Record<PanelId, { kicker: string; title: string; Body: ComponentType }> = {
  work: { kicker: "Track 01 · Work", title: "The day job", Body: WorkSection },
  projects: { kicker: "Track 02 · Projects", title: "Projects", Body: ProjectsSection },
  homelab: { kicker: "Track 03 · Homelab", title: "The homelab", Body: HomelabSection },
  about: { kicker: "Track 04 · About", title: "About me", Body: AboutSection },
};
