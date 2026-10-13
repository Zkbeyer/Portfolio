import { isAudioPlaying, readAudioPref, setAudioPlaying, subscribeAudio } from "./audioStore";

/**
 * The audio engine behind the turntable: procedural rain (WebAudio, no file) + one looping lofi
 * track. Nothing is created until the visitor turns it on, so the page never makes a sound (or
 * downloads the track) by itself.
 *
 * Track: `public/audio/lofi.mp3` (Zack supplies a royalty-free one); until it exists the element
 * falls back to `home-ambient.mp3` on its first load error.
 *
 * Rain = looped noise through two filters (a soft high hiss + a low body, slowly breathing) plus
 * individual drops: tiny filtered noise bursts at random pitch/pan, scheduled a little ahead.
 * While the record plays, a faint vinyl crackle sits under the music.
 */

const BASE = import.meta.env.BASE_URL;
const TRACK = `${BASE}audio/lofi.mp3`;
const FALLBACK_TRACK = `${BASE}audio/home-ambient.mp3`;

const MASTER = 0.9;
const MUSIC = 0.5;
const FADE_IN = 1.2;
const FADE_OUT = 0.6;

type Graph = {
  ctx: AudioContext;
  master: GainNode;
  rain: GainNode;
  music: GainNode;
  noise: AudioBuffer;
  el: HTMLAudioElement;
};

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

  // --- music ---
  const el = new Audio();
  el.preload = "none";
  el.loop = true;
  el.src = TRACK;
  el.addEventListener(
    "error",
    () => {
      if (!el.src.endsWith(FALLBACK_TRACK)) {
        el.src = FALLBACK_TRACK;
        if (isAudioPlaying()) void el.play().catch(() => {});
      }
    },
    { once: true },
  );
  const music = ctx.createGain();
  music.gain.value = MUSIC;
  const warm = ctx.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = 9000; // take the edge off, like it's coming out of the console speaker
  ctx.createMediaElementSource(el).connect(warm).connect(music).connect(master);

  return { ctx, master, rain, music, noise, el };
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
    if (!g.el.paused && Math.random() < 0.18) blip(g, nextDropAt + Math.random() * 0.05, true);
    // ~14 drops/s on average, clumpy (exponential gaps)
    nextDropAt += -Math.log(1 - Math.random()) / 14;
  }
}

function start() {
  if (!graph) graph = build();
  const g = graph;
  if (!g) return;
  window.clearTimeout(stopTimer);
  // resume() and play() must be called inside the click/keypress that turned audio on
  void g.ctx.resume();
  void g.el.play().catch(() => {});
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
    g.el.pause();
    void g.ctx.suspend();
  }, FADE_OUT * 1000 + 50);
}

function onVisibility() {
  const g = graph;
  if (!g || !isAudioPlaying()) return;
  if (document.hidden) {
    window.clearInterval(schedTimer);
    g.el.pause();
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
