import React from "react";
import type { AppPage } from "./types";

// ---- Pages (code-split) ----
export const loadProjectsPage = () => import("../pages/Projects/ProjectsPage");
export const loadAboutPage = () => import("../pages/About/AboutPage");

export const ProjectsPageLazy = React.lazy(loadProjectsPage);
export const AboutPageLazy = React.lazy(loadAboutPage);

// ---- 3D models (code-split) ----
// Point these at the actual model components you want per page.
// You already have Duck and SpaceBoi. We'll preload Duck and (placeholder) AboutModel.
export const loadProjectsModel = () => import("../components/3dModels/Duck");
export const loadAboutModel = () => import("../components/3dModels/SpaceBoi"); // placeholder: swap later

export function preloadFor(page: AppPage) {
  if (page === "PROJECTS") {
    void loadProjectsPage();
    void loadProjectsModel();
  }
  if (page === "ABOUT") {
    void loadAboutPage();
    void loadAboutModel();
  }
}