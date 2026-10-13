import { isAudioPlaying, readAudioPref, setAudioPlaying, subscribeAudio } from "./audioStore";
import { PLAYLIST, shuffledOrder } from "./playlist";

/**
 * The audio engine behind the turntable: procedural rain (WebAudio, no file) + a shuffled lo-fi
 * playlist (`playlist.ts`). Nothing is created until the visitor turns it on, so the page never
 * makes a sound (or downloads a track) by itself.
 *
 * Playlist: two <audio> "decks" so tracks crossfade. The queue is a shuffle of every track; when it
 * runs out a new shuffle starts (never with the song that just ended). Only the playing track is
 * downloaded, plus the next one ~15s before the crossfade. A track that fails to load is skipped.
 * Safari only lets an element start from a timer if it was started inside a click once, so both
 * decks are unlocked in the click that turns sound on; if a deck is still refused, the playlist
 * carries on with one deck (no crossfade).
 *
 * Rain = looped noise through two filters (a soft high hiss + a low body, slowly breathing) plus
 * individual drops: tiny filtered noise bursts at random pitch/pan, scheduled a little ahead.
 * While the record plays, a faint vinyl crackle sits under the music.
 */

const BASE = import.meta.env.BASE_URL;
/** Seconds of overlap between two tracks. */
const XFADE = 3;
/** Start downloading the next track this many seconds before the crossfade. */
const PRELOAD_AHEAD = 15;
/** A few ms of silence, used to unlock a deck that has nothing loaded yet (see `unlockDecks`). */
const SILENCE = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";

const MASTER = 0.9;
const MUSIC = 0.5;
const FADE_IN = 1.2;
const FADE_OUT = 0.6;

/** `blocked`: the browser refused to start this deck without a click — fall back to one deck. */
type Deck = { el: HTMLAudioElement; gain: GainNode; track: number | null; blocked: boolean };

type Graph = {
  ctx: AudioContext;
  master: GainNode;
  rain: GainNode;
  music: GainNode;
  noise: AudioBuffer;
  decks: [Deck, Deck];
};

// playlist state
let active = 0; // index into graph.decks
let queue: number[] = []; // upcoming track indices
let last: number | undefined; // the track that started most recently
let xfadeTimer: number | undefined;
let xfading = false;
let failures = 0; // consecutive load errors (stop skipping once every track has failed)

let graph: Graph | null = null;
let schedTimer: number | undefined;
let nextDropAt = 0;
let stopTimer: number | undefined;

function makeNoise(ctx: AudioContext, seconds: number) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c);
    // gently pinked white noise (one-pole), so the loop sounds like water, not static
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = 0.97 * last + 0.03 * w;
      d[i] = w * 0.55 + last * 3.2;
    }
  }
  return buf;
}

function build(): Graph | null {
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();

  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // --- rain bed ---
  const rain = ctx.createGain();
  rain.gain.value = 1;
  rain.connect(master);

  const noise = makeNoise(ctx, 4);
  const bed = ctx.createBufferSource();
  bed.buffer = noise;
  bed.loop = true;

  const hissHP = ctx.createBiquadFilter();
  hissHP.type = "highpass";
  hissHP.frequency.value = 1400;
  const hissLP = ctx.createBiquadFilter();
  hissLP.type = "lowpass";
  hissLP.frequency.value = 7500;
  const hiss = ctx.createGain();
  hiss.gain.value = 0.045;
  bed.connect(hissHP).connect(hissLP).connect(hiss).connect(rain);

  const bodyBP = ctx.createBiquadFilter();
  bodyBP.type = "bandpass";
  bodyBP.frequency.value = 420;
  bodyBP.Q.value = 0.6;
  const body = ctx.createGain();
  body.gain.value = 0.07;
  bed.connect(bodyBP).connect(body).connect(rain);

  // the shower breathes: a very slow LFO on the hiss level
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.06;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0.015;
  lfo.connect(lfoDepth).connect(hiss.gain);

  bed.start();
  lfo.start();

  // --- music: two decks → warm lowpass → music bus ---
  const music = ctx.createGain();
  music.gain.value = MUSIC;
  const warm = ctx.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 9000; // take the edge off, like it's coming out of the console speaker
  warm.connect(music).connect(master);

  const decks = [0, 1].map((i) => {
    const el = new Audio();
    el.preload = "none";
    const gain = ctx.createGain();
    gain.gain.value = 0;
    ctx.createMediaElementSource(el).connect(gain).connect(warm);
    const deck: Deck = { el, gain, track: null, blocked: false };
    // backups for the tick-driven crossfade (e.g. timers throttled): move on when the active deck ends/fails
    el.addEventListener("ended", () => {
      if (active === i && !xfading) advance();
    });
    el.addEventListener("error", () => {
      if (active !== i || deck.track === null) return;
      failures++;
      if (failures >= PLAYLIST.length) {
        return; // nothing loads (offline?) — leave the rain on its own
      }
      advance(0);
    });
    el.addEventListener("playing", () => {
      if (active === i) failures = 0;
    });
    return deck;
  }) as [Deck, Deck];

  return { ctx, master, rain, music, noise, decks };
}

// ── playlist ────────────────────────────────────────────────────────────────

/** Next track in the shuffle (refills the queue with a fresh shuffle when it runs out). */
function peekNext() {
  if (!queue.length) queue = shuffledOrder(PLAYLIST.length, last);
  return queue[0];
}

function takeNext() {
  const t = peekNext();
  queue.shift();
  return t;
}

function load(deck: Deck, track: number, preload: "auto" | "none") {
  if (deck.track === track) return;
  deck.track = track;
  deck.el.preload = preload;
  deck.el.src = `${BASE}${PLAYLIST[track].file}`;
}

/** Start `track` on `deck`, fading it in over `fade` seconds (0 = straight in). */
function play(g: Graph, deck: Deck, track: number, fade: number) {
  load(deck, track, "auto");
  deck.el.currentTime = 0;
  const now = g.ctx.currentTime;
  deck.gain.gain.cancelScheduledValues(now);
  deck.gain.gain.setValueAtTime(fade ? 0 : 1, now);
  if (fade) deck.gain.gain.linearRampToValueAtTime(1, now + fade);
  void deck.el.play().catch((err: unknown) => {
    if ((err as DOMException | null)?.name === "NotAllowedError") onBlocked(g, deck, track);
  });
  last = track;
}

/**
 * Safari (and some other browsers) only let an <audio> element start by itself if it was first
 * started inside a click/keypress. If the next deck is refused anyway, play the track on the deck
 * that is allowed (no crossfade from then on).
 */
function onBlocked(g: Graph, deck: Deck, track: number) {
  deck.blocked = true;
  const other = g.decks[g.decks[0] === deck ? 1 : 0];
  if (other.blocked) return; // nothing may play — leave the rain on its own
  window.clearTimeout(xfadeTimer);
  xfading = false;
  deck.gain.gain.setValueAtTime(0, g.ctx.currentTime);
  active = g.decks.indexOf(other);
  play(g, other, track, 0);
}

/**
 * Called inside the click/keypress that turns sound on: start + immediately pause the idle deck,
 * which is what Safari needs to allow it to start later from a timer (for the crossfade). Its gain
 * is 0, so nothing is heard.
 */
function unlockDecks(g: Graph) {
  const idle = g.decks[1 - active];
  if (idle.blocked || !idle.el.paused) return;
  if (!idle.el.src) {
    idle.el.preload = "auto";
    idle.el.src = SILENCE;
  }
  void idle.el.play().catch(() => {});
  idle.el.pause();
}

/** Next track: crossfade to it on the other deck (or straight on this deck in one-deck mode). */
function advance(fade = XFADE) {
  const g = graph;
  if (!g) return;
  if (g.decks[1 - active].blocked) {
    play(g, g.decks[active], takeNext(), 0);
    return;
  }
  const from = g.decks[active];
  active = 1 - active;
  const to = g.decks[active];
  const now = g.ctx.currentTime;
  from.gain.gain.cancelScheduledValues(now);
  from.gain.gain.setValueAtTime(from.gain.gain.value, now);
  from.gain.gain.linearRampToValueAtTime(0, now + fade);
  window.clearTimeout(xfadeTimer);
  xfading = fade > 0;
  xfadeTimer = window.setTimeout(() => {
    from.el.pause();
    xfading = false;
  }, fade * 1000 + 50);
  play(g, to, takeNext(), fade);
}

/** Finish any crossfade immediately (before pausing, so nothing half-faded resumes later). */
function settleCrossfade(g: Graph) {
  if (!xfading) return;
  window.clearTimeout(xfadeTimer);
  xfading = false;
  const old = g.decks[1 - active];
  old.el.pause();
  old.gain.gain.cancelScheduledValues(g.ctx.currentTime);
  old.gain.gain.setValueAtTime(0, g.ctx.currentTime);
}

/** Called from the scheduler tick while playing: preload the next track, start the crossfade on time. */
function watchTrack(g: Graph) {
  const deck = g.decks[active];
  const { duration, currentTime } = deck.el;
  if (xfading || deck.track === null || !Number.isFinite(duration) || deck.el.paused) return;
  const left = duration - currentTime;
  const next = g.decks[1 - active];
  if (left < XFADE + PRELOAD_AHEAD && !next.blocked) load(next, peekNext(), "auto");
  if (left <= XFADE && !next.blocked) advance(); // one-deck mode waits for "ended" instead
}

/** One drop (or, with `crackle`, one vinyl click) at time `t`. */
function blip(g: Graph, t: number, crackle: boolean) {
  const { ctx, noise } = g;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filt = ctx.createBiquadFilter();
  const env = ctx.createGain();
  const pan = ctx.createStereoPanner();
  const dur = crackle ? 0.004 + Math.random() * 0.004 : 0.018 + Math.random() * 0.04;
  if (crackle) {
    filt.type = "highpass";
    filt.frequency.value = 2500 + Math.random() * 3000;
    pan.pan.value = (Math.random() - 0.5) * 0.3;
  } else {
    filt.type = "bandpass";
    filt.frequency.value = 1800 + Math.random() * 4200;
    filt.Q.value = 3 + Math.random() * 5;
    pan.pan.value = (Math.random() - 0.5) * 1.4;
  }
  const peak = crackle ? 0.03 + Math.random() * 0.05 : 0.05 + Math.random() * 0.22;
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(peak, t + 0.002);
  env.gain.setTargetAtTime(0, t + 0.003, dur / 3);
  src.connect(filt).connect(env).connect(pan).connect(crackle ? g.music : g.rain);
  src.start(t, Math.random() * (noise.duration - 0.2), dur + 0.1);
}

/** Schedules drops ~0.3s ahead of the audio clock, so timer jitter never makes gaps. */
function schedule() {
  const g = graph;
  if (!g) return;
  const horizon = g.ctx.currentTime + 0.3;
  if (nextDropAt < g.ctx.currentTime) nextDropAt = g.ctx.currentTime + 0.02;
  while (nextDropAt < horizon) {
    blip(g, nextDropAt, false);
    if (!g.decks[active].el.paused && Math.random() < 0.18) blip(g, nextDropAt + Math.random() * 0.05, true);
    // ~14 drops/s on average, clumpy (exponential gaps)
    nextDropAt += -Math.log(1 - Math.random()) / 14;
  }
  watchTrack(g);
}

function start() {
  if (!graph) graph = build();
  const g = graph;
  if (!g) return;
  window.clearTimeout(stopTimer);
  // resume() and play() must be called inside the click/keypress that turned audio on
  void g.ctx.resume();
  const deck = g.decks[active];
  unlockDecks(g);
  if (deck.track === null) play(g, deck, takeNext(), 0); // first track of the visit
  else if (failures < PLAYLIST.length) void deck.el.play().catch(() => {});
  const now = g.ctx.currentTime;
  g.master.gain.cancelScheduledValues(now);
  g.master.gain.setValueAtTime(g.master.gain.value, now);
  g.master.gain.linearRampToValueAtTime(MASTER, now + FADE_IN);
  window.clearInterval(schedTimer);
  schedTimer = window.setInterval(schedule, 100);
  schedule();
}

function stop() {
  const g = graph;
  if (!g) return;
  const now = g.ctx.currentTime;
  g.master.gain.cancelScheduledValues(now);
  g.master.gain.setValueAtTime(g.master.gain.value, now);
  g.master.gain.linearRampToValueAtTime(0, now + FADE_OUT);
  window.clearInterval(schedTimer);
  stopTimer = window.setTimeout(() => {
    settleCrossfade(g);
    g.decks[active].el.pause();
    void g.ctx.suspend();
  }, FADE_OUT * 1000 + 50);
}

function onVisibility() {
  const g = graph;
  if (!g || !isAudioPlaying()) return;
  if (document.hidden) {
    window.clearInterval(schedTimer);
    settleCrossfade(g);
    g.decks[active].el.pause();
    void g.ctx.suspend();
  } else {
    start();
  }
}

let started = false;

/**
 * Wires the engine to the audio store once (idempotent). If the visitor turned audio on last
 * time, it comes back on with their first click or keypress anywhere — browsers don't allow
 * sound before that. If that first click is itself the turntable/toggle, their click wins.
 */
export function initAudioEngine() {
  if (started || typeof window === "undefined") return;
  started = true;
  subscribeAudio(() => (isAudioPlaying() ? start() : stop()));
  document.addEventListener("visibilitychange", onVisibility);

  if (!readAudioPref()) return;
  let armed = true;
  const unsub = subscribeAudio(() => {
    armed = false; // the visitor already chose during this gesture
  });
  const resumeOnGesture = () => {
    window.removeEventListener("click", resumeOnGesture);
    window.removeEventListener("keydown", resumeOnGesture);
    unsub();
    if (armed) setAudioPlaying(true);
  };
  // bubble phase: runs after the canvas/turntable and button handlers for the same event
  window.addEventListener("click", resumeOnGesture);
  window.addEventListener("keydown", resumeOnGesture);
}
