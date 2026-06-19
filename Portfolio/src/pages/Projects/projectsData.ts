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
    id: "mu-planner",
    title: "MU Planner",
    tagline: "Mizzou course explorer — browse courses, grade distributions, and professor ratings",
    description:
      "A Next.js web app that aggregates Mizzou course catalog data, historical grade distributions, and professor ratings into a fast, searchable interface for students planning their semester.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Fuse.js"],
    images: [`${import.meta.env.BASE_URL}/projects/mu-planner/1.png`, `${import.meta.env.BASE_URL}/projects/mu-planner/2.png`],
    repoUrl: "https://github.com/Zkbeyer/mu-planner",
    liveUrl: "https://mu.ailuruslab.dev",
    meta: { role: "Full-stack", timeframe: "2025", status: "Live" },
    bullets: [
      "Scrapes and aggregates Mizzou course catalog, grade distributions, and professor data",
      "Fuzzy search across all courses and professors with instant results (Fuse.js)",
      "Filter by minimum GPA, credit hours, and department",
      "Statically generated pages for fast load times across thousands of courses",
    ],
    highlight: [
      { label: "Focus", value: "Student Tooling" },
      { label: "Stack", value: "Next.js + TypeScript" },
      { label: "Data", value: "Mizzou Course Catalog" },
    ],
  },
  {
    id: "shiftforge",
    title: "ShiftForge",
    tagline: "Employee shift scheduling and workforce management platform",
    description:
      "A full-stack scheduling platform for managing employees, shift templates, and weekly schedules — with availability tracking, role-based assignment, drag-and-drop editing, and CSV import/export.",
    tech: ["Next.js", "TypeScript", "Supabase", "React Query", "shadcn/ui", "dnd-kit", "Zod", "Vitest"],
    images: [`${import.meta.env.BASE_URL}/projects/shiftforge/1.png`, `${import.meta.env.BASE_URL}/projects/shiftforge/2.png`],
    repoUrl: "https://github.com/Zkbeyer/shiftforge",
    meta: { role: "Full-stack", timeframe: "2026", status: "Active" },
    bullets: [
      "Manages employees, roles, and recurring/one-time availability blocks",
      "Shift templates with role slots, coverage modes, and a color-coded weekly calendar",
      "Drag-and-drop schedule editing with auto-generation from templates",
      "CSV import/export for employees and schedules; Supabase auth and real-time sync",
      "Subscription plans, test suite (Vitest), and full TypeScript type coverage",
    ],
    highlight: [
      { label: "Focus", value: "Workforce Scheduling" },
      { label: "Stack", value: "Next.js + Supabase" },
      { label: "Type", value: "Full-stack SaaS" },
    ],
  },
  {
    id: "spotify-rewind",
    title: "Spotify Rewind",
    tagline: "Your personal year-in-review (your Spotify email must be registered with my API key to use this)",
    description:
      "Full-stack app that generates a Spotify Wrapped-style report with AI analysis and interactive insights.",
    tech: ["React", "Node.js", "Express", "Spotify API"],
    images: [`${import.meta.env.BASE_URL}/projects/spotify/1.png`, `${import.meta.env.BASE_URL}/projects/spotify/2.png`],
    repoUrl: "https://github.com/Zkbeyer/Rewind",
    liveUrl: "https://your-rewind.vercel.app",
    meta: { role: "Full-stack", timeframe: "2025", status: "Live" },
    bullets: [
      "Ingests listening history and generates a Wrapped-style report",
      "Shareable insights with clean, fast information hierarchy",
      "API-driven architecture designed for easy feature expansion",
    ],
    highlight: [
      { label: "Focus", value: "Insightful UX" },
      { label: "Stack", value: "React + Node + Express" },
      { label: "Data", value: "Spotify API" },
    ],
  },
  {
    id: "fault-injector",
    title: "Fault Injector API",
    tagline: "Chaos testing & fault injection service",
    description:
      "A .NET 10 API that injects configurable faults — latency, errors, dropped requests — to test system resilience under real-world failure scenarios.",
    tech: ["C#", ".NET 10", "ASP.NET Core", "Docker", "YARP"],
    images: [
      `${import.meta.env.BASE_URL}/projects/fault-injector/1.png`,
      `${import.meta.env.BASE_URL}/projects/fault-injector/2.png`
    ],
    repoUrl: "https://github.com/Zkbeyer/FaultInjector",
    meta: { role: "Backend / Systems", timeframe: "2026", status: "Active" },
    bullets: [
      "Injects latency, faults, and chaos behaviors via configurable rules",
      "Runtime enable/disable of fault profiles without redeploy",
      "Dockerized for fast local and CI testing workflows",
      "Structured logging and rule-based probability controls",
    ],
    highlight: [
      { label: "Focus", value: "Resilience Testing" },
      { label: "Type", value: "Chaos / Fault API" },
      { label: "Runtime", value: ".NET 10" },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio",
    tagline: "My portfolio website (this)",
    description:
      "An interactive 3D portfolio experience built to showcase my projects, skills, and experience.",
    tech: ["React", "TypeScript", "Three.js", "React Three Fiber", "Vite"],
    images: [`${import.meta.env.BASE_URL}/projects/portfolio/1.png`, `${import.meta.env.BASE_URL}/projects/portfolio/2.png`],
    repoUrl: "https://github.com/Zkbeyer/Portfolio",
    meta: { role: "Web Dev", timeframe: "2026", status: "Live" },
    bullets: [
      "Interactive 3D scenes built with Three.js and React Three Fiber",
      "Scroll-driven camera animations and ambient audio per section",
      "Fully responsive across desktop and mobile",
    ],
  },
];