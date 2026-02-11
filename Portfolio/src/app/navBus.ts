import type { AppPage } from "./types";
import { preloadFor } from "./routes";

const NAV_EVENT = "portfolio:navigate";

type NavDetail = { page: AppPage };

export function preloadPage(page: AppPage) {
  preloadFor(page);
}

export function navigateTo(page: AppPage) {
  window.dispatchEvent(new CustomEvent<NavDetail>(NAV_EVENT, { detail: { page } }));
}

export function useNavBus(onNavigate: (page: AppPage) => void) {
  // Small helper to subscribe/unsubscribe
  const handler = (e: Event) => {
    const ce = e as CustomEvent<NavDetail>;
    if (!ce.detail?.page) return;
    onNavigate(ce.detail.page);
  };

  window.addEventListener(NAV_EVENT, handler as EventListener);
  return () => window.removeEventListener(NAV_EVENT, handler as EventListener);
}