import React, { Suspense, useMemo } from "react";
import Home from "./pages/Home/Home";
import { usePageNavigation } from "./app/usePageNavigation";
import { AboutPageLazy, ProjectsPageLazy } from "./app/routes";

export default function App() {
  const { page } = usePageNavigation("HOME");

  const Page = useMemo(() => {
    if (page === "PROJECTS") return <ProjectsPageLazy />;
    if (page === "ABOUT") return <AboutPageLazy />;
    return <Home />;
  }, [page]);

  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            color: "rgba(255,255,255,0.85)",
            display: "grid",
            placeItems: "center",
            fontFamily: "ui-sans-serif, system-ui",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontSize: 12,
          }}
        >
          Loading…
        </div>
      }
    >
      {Page}
    </Suspense>
  );
}