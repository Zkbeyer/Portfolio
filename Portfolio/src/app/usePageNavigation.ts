import { useEffect, useState } from "react";
import type { AppPage } from "./types";
import { preloadFor } from "./routes";
import { useNavBus } from "./navBus";

export function usePageNavigation(initial: AppPage = "HOME") {
  const [page, setPage] = useState<AppPage>(initial);

  useEffect(() => {
    // Preload the first likely destinations quickly after load
    // (doesn't block paint; helps it feel instant)
    const id = window.setTimeout(() => {
      preloadFor("PROJECTS");
      preloadFor("ABOUT");
    }, 350);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    return useNavBus((p) => setPage(p));
  }, []);

  const go = (p: AppPage) => setPage(p);

  return {
    page,
    goHome: () => go("HOME"),
    goProjects: () => go("PROJECTS"),
    goAbout: () => go("ABOUT"),
    setPage: go,
  };
}