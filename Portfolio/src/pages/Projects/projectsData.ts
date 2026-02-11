export type Project = {
  id: string;
  title: string;
  tagline: string;

  /** Short overview (1–2 sentences) */
  description: string;

  /** 3–6 concise bullets that explain what you built / why it matters */
  bullets?: string[];

  /** Optional quick facts row */
  meta?: {
    role?: string;
    timeframe?: string;
    status?: string;
  };

  /** Optional callout box (used for a featured project) */
  highlight?: {
    label: string;
    value: string;
  }[];

  tech: string[];
  images: string[]; // put paths in /public/projects/...
  repoUrl: string;
  liveUrl?: string;
};

export const PROJECTS: Project[] = [
  {
    id: "spotify-rewind",
    title: "Spotify Rewind",
    tagline: "Your personal year-in-review",
    description:
      "Full-stack app that generates a Spotify Wrapped-style report with AI analysis and interactive insights.",
    tech: ["React", "Node.js", "Express", "Spotify API"],
    images: [`${import.meta.env.BASE_URL}/projects/spotify/1.png`, `${import.meta.env.BASE_URL}/projects/spotify/2.png`],
    repoUrl: "https://github.com/Zkbeyer/Rewind",
    liveUrl: "https://your-rewind.vercel.app",
    meta: { role: "Full-stack", timeframe: "2025", status: "Live" },
    bullets: [
      "Ingests listening history and generates a Wrapped-style report",
      "Shareable insights + fast UI with clean information hierarchy",
      "API-driven architecture designed for easy feature expansion",
    ],
    highlight: [
      { label: "Focus", value: "Insightful UX" },
      { label: "Stack", value: "React + Node + Express" },
      { label: "Data", value: "Spotify API" },
    ],
  },
  {
    id: "portfolio",
    title: "Portfilio",
    tagline: "My portfolio website (this)",
    description:
      "My portfolio website to showcase my projects, skills, and experience.",
    tech: ["React", "Node.js"],
    images: [`${import.meta.env.BASE_URL}/projects/portfolio/1.png`, `${import.meta.env.BASE_URL}/projects/portfolio/2.png`],
    repoUrl: "https://github.com/Zkbeyer/Portfolio",
    meta: { role: "Web Dev", timeframe: "2026", status: "In progress" },
    bullets: [
      "Shows what I can do and have done",
      "Helps you find and connect with me",
      "Give you a taste of my personality",
    ],
  },
];