// Live homelab status for the Pi LED and the track 03 sticky note.
// Contract: docs/redesign/night-shift/STATUS_ENDPOINT.md. Never blocks render; any failure → "unknown".
import { useSyncExternalStore } from "react";
import { PALETTE } from "../palette";

export type HomelabState = "healthy" | "down" | "unknown";

export type HomelabStatus = {
  state: HomelabState;
  uptimeSeconds: number | null;
  lastSelfHeal: string | null;
  /** ms epoch of the last successful check, null until one succeeds */
  checkedAt: number | null;
};

/** Colour of the Pi LED (and the sticky-note dot) per state. */
export const LED_COLORS: Record<HomelabState, string> = {
  healthy: PALETTE.led,
  unknown: "#FFB347",
  down: "#FF4D5E",
};

export const STATUS_URL: string = import.meta.env.VITE_STATUS_URL || "https://status.ailuruslab.dev/status.json";
const TIMEOUT_MS = 5_000;
const POLL_MS = 60_000;

const UNKNOWN: HomelabStatus = { state: "unknown", uptimeSeconds: null, lastSelfHeal: null, checkedAt: null };

let status: HomelabStatus = UNKNOWN;
const listeners = new Set<() => void>();
let timer: number | undefined;
let inFlight: AbortController | null = null;

/** Validate the endpoint's JSON; anything malformed is treated as unknown. */
export function parseStatus(json: unknown, now = Date.now()): HomelabStatus | null {
  if (!json || typeof json !== "object") return null;
  const o = json as Record<string, unknown>;
  if (typeof o.healthy !== "boolean") return null;
  const uptime = typeof o.uptimeSeconds === "number" && Number.isFinite(o.uptimeSeconds) && o.uptimeSeconds >= 0 ? o.uptimeSeconds : null;
  const heal = typeof o.lastSelfHeal === "string" && !Number.isNaN(Date.parse(o.lastSelfHeal)) ? o.lastSelfHeal : null;
  return { state: o.healthy ? "healthy" : "down", uptimeSeconds: uptime, lastSelfHeal: heal, checkedAt: now };
}

function set(next: HomelabStatus) {
  const same =
    next.state === status.state &&
    next.uptimeSeconds === status.uptimeSeconds &&
    next.lastSelfHeal === status.lastSelfHeal &&
    next.checkedAt === status.checkedAt;
  if (same) return;
  status = next;
  listeners.forEach((l) => l());
}

async function check() {
  if (typeof document !== "undefined" && document.hidden) return;
  inFlight?.abort();
  const controller = new AbortController();
  inFlight = controller;
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(STATUS_URL, { signal: controller.signal, cache: "no-store", headers: { Accept: "application/json" } });
    const parsed = res.ok ? parseStatus(await res.json()) : null;
    set(parsed ?? UNKNOWN);
  } catch {
    if (!controller.signal.aborted || inFlight === controller) set(UNKNOWN);
  } finally {
    window.clearTimeout(timeout);
    if (inFlight === controller) inFlight = null;
  }
}

function onVisibility() {
  if (!document.hidden) void check();
}

function start() {
  void check();
  timer = window.setInterval(check, POLL_MS);
  document.addEventListener("visibilitychange", onVisibility);
}

function stop() {
  window.clearInterval(timer);
  timer = undefined;
  inFlight?.abort();
  inFlight = null;
  document.removeEventListener("visibilitychange", onVisibility);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0) stop();
  };
}

/** Current homelab status; polling runs only while something is subscribed. */
export function useHomelabStatus() {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => UNKNOWN,
  );
}
