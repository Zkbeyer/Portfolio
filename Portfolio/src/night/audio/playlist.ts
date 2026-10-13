/**
 * The turntable's lo-fi playlist (Zack, 2026-10-13). All four tracks are by Sascha Ende (ende.app).
 * His license: free to use, no credit required; terms are only "don't claim you composed it" and
 * "never register it with Content ID". No credit or now-playing line on the site (Zack, 2026-10-13).
 * Files live in `public/audio/lofi/`, re-encoded to 128 kbps stereo (~2.3–3.7 MB each).
 * To add a track: drop the mp3 in that folder and add an entry here.
 */
export type Track = {
  id: string;
  title: string;
  artist: string;
  file: string;
  /** Where the track came from. */
  source: string;
};

export const PLAYLIST: readonly Track[] = [
  {
    id: "hexakaideca",
    title: "Relaxing Lofi - Hexakaideca",
    artist: "Sascha Ende",
    file: "audio/lofi/relaxing-lofi-hexakaideca.mp3",
    source: "https://ende.app/en/song/13282-relaxing-lofi-hexakaideca",
  },
  {
    id: "japan-vol-3",
    title: "Japan Lo-Fi Vol. 3",
    artist: "Sascha Ende",
    file: "audio/lofi/japan-lo-fi-vol-3.mp3",
    source: "https://ende.app/en/song/12960-japan-lo-fi-vol-3",
  },
  {
    id: "sunday-morning-coffee",
    title: "Sunday Morning Coffee",
    artist: "Sascha Ende",
    file: "audio/lofi/sunday-morning-coffee.mp3",
    source: "https://ende.app/en/song/13693-sunday-morning-coffee",
  },
  {
    id: "madeira-from-above",
    title: "Madeira From Above [Lofi Edition]",
    artist: "Sascha Ende",
    file: "audio/lofi/madeira-from-above-lofi.mp3",
    source: "https://ende.app/en/song/13819-madeira-from-above-lofi-edition",
  },
];

/**
 * A fresh random order of track indices (Fisher–Yates). `avoidFirst` keeps the next round from
 * starting with the track that just ended, so the same song never plays twice in a row.
 */
export function shuffledOrder(n: number, avoidFirst?: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (n > 1 && order[0] === avoidFirst) [order[0], order[n - 1]] = [order[n - 1], order[0]];
  return order;
}
