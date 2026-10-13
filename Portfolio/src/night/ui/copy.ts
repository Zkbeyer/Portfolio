import { person } from "../../content/site";

/**
 * Hero copy. Facts only from `content/site.ts` (finishing at Mizzou Dec 2026, Garmin in 2027).
 * Subtitles are sentence case: calm and readable, like film subtitles, not shouty.
 */
export const INTRO_LINES = [
  "Finishing CS at Mizzou. Garmin after that.",
  "It's 2 a.m., and the cluster is fine.",
  "Everything here is a link. Look around.",
] as const;

/** "Backend & platform software engineer" */
export const HERO_ROLE = `${person.focus} ${person.title.toLowerCase()}`;

/** Small mono line under the name. */
export const HERO_META = `Mizzou CS ’${person.education.graduation.slice(-2)} · joining ${person.next.org} in ${person.next.when}`;

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
/** 6 → "six" (falls back to digits past twelve). */
export const numberWord = (n: number) => WORDS[n] ?? String(n);
