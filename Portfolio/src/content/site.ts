// Single source of truth for site copy. Facts come from the Oct 2026 resume only.
// Shared by every redesign branch so content never drifts between themes.

const BASE = import.meta.env.BASE_URL; // always ends with "/"
export const asset = (path: string) => `${BASE}${path.replace(/^\//, "")}`;

export type Link = { label: string; href: string };

export type Experience = {
  id: string;
  org: string;
  role: string;
  team?: string;
  location: string;
  period: string;
  summary: string;
  highlights: string[];
};

export type ProjectStatus = "running" | "live" | "active" | "in-progress" | "in-development" | "demo";

export type Project = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  metric?: string; // only real numbers
  image?: string;
  links: Link[];
};

export const person = {
  name: "Zackery Beyer",
  shortName: "Zack Beyer",
  title: "Software Engineer",
  focus: "Backend & platform",
  location: "Columbia, MO",
  education: {
    school: "University of Missouri",
    degree: "B.E. Computer Science, minor in Mathematics",
    certificate: "Web and Mobile Applications Development",
    graduation: "December 2026",
    gpa: "3.95",
  },
  next: {
    org: "Garmin",
    role: "Software Engineer, Aviation Databases",
    when: "2027",
  },
  email: "zkbeyer@icloud.com",
  links: {
    github: "https://github.com/Zkbeyer",
    linkedin: "https://www.linkedin.com/in/zackery-beyer/",
    resume: asset("resume.pdf"),
  },
  interests: ["skiing", "camping", "hiking", "nature photography", "space weather"],
} as const;

export const experience: Experience[] = [
  {
    id: "garmin",
    org: "Garmin International",
    role: "Software Engineering Intern",
    team: "Automated Test Equipment (ATE) Software",
    location: "Olathe, KS",
    period: "May – Aug 2026",
    summary: "Owned projects end to end on an established team and earned a full-time return offer.",
    highlights: [
      "Traced the main bottleneck on a high-traffic test-report platform and restructured its SQL: large reports went from 33s to 1.6s (~95%), and a targeted step-name lookup cut query volume 80%+.",
      "Built a fault-tolerant PC provisioning tool: install steps live as data in SQL Server, a PyQt5 client runs them with per-step retry/skip and checkpointed reboot-and-resume.",
      "Wrote two instrument drivers in C over NI-VISA/NI-MAX, plus a GUI for each, so automated tests drive the hardware directly.",
      "Shipped a batch comparison view used daily, replacing a manual serial-by-serial lookup.",
    ],
  },
  {
    id: "dataannotation",
    org: "DataAnnotation",
    role: "Software Engineering Contractor",
    team: "AI Coding Evaluation",
    location: "Remote",
    period: "2026 – present",
    summary: "Evaluate code from frontier LLM coding agents and design tasks that expose where they break.",
    highlights: [
      "Review AI-generated code for correctness, edge cases, security and maintainability, documenting the failure mode behind each rejection.",
      "Design adversarial coding and Docker tasks against real open-source codebases such as pandas.",
    ],
  },
];

export const projects: Project[] = [
  {
    id: "homelab",
    name: "Homelab",
    tagline: "A self-healing k3s cluster on a Raspberry Pi 5",
    description:
      "Migrated from Docker Compose to declarative Kubernetes (k3s). A custom Go service handles health checks, backups and automated recovery with no operator in the loop. Prometheus and Grafana handle monitoring and alerting; access is hardened with automated TLS, Tailscale and key-only SSH. It also hosts a Minecraft server for friends.",
    stack: ["Kubernetes (k3s)", "Go", "Docker", "Prometheus", "Grafana", "Linux"],
    status: "running",
    links: [{ label: "ailuruslab.dev", href: "https://ailuruslab.dev" }],
  },
  {
    id: "faultinjector",
    name: "FaultInjector",
    tagline: "A chaos-engineering reverse proxy",
    description:
      "Custom ASP.NET Core middleware injects controlled latency, errors and timeouts into live API traffic to test how services behave when dependencies fail. A control-plane REST API swaps fault rules at runtime, with no restart or redeploy.",
    stack: [".NET 10", "C#", "ASP.NET Core", "Docker"],
    status: "active",
    image: asset("projects/fault-injector/1.png"),
    links: [{ label: "source", href: "https://github.com/Zkbeyer/FaultInjector" }],
  },
  {
    id: "mu-planner",
    name: "MU Planner",
    tagline: "A course planner for Mizzou students",
    description:
      "Python ETL scrapers merge the course catalog and RateMyProfessors into one schema, refreshed on scheduled GitHub Actions, behind a static Next.js frontend.",
    stack: ["Next.js", "React", "Python", "GitHub Actions"],
    status: "live",
    metric: "100+ students",
    image: asset("projects/mu-planner/1.png"),
    links: [
      { label: "live", href: "https://mu.ailuruslab.dev" },
      { label: "source", href: "https://github.com/Zkbeyer/mu-planner" },
    ],
  },
  {
    id: "boeing-capstone",
    name: "Boeing Flight Simulator",
    tagline: "Senior capstone, 5-person team",
    description:
      "Own the geospatial data pipeline (QGIS → BlenderGIS → Blender) for simulator-ready airport models, holding positional tolerance within a few feet against a formal client requirements document.",
    stack: ["QGIS", "BlenderGIS", "Blender"],
    status: "in-progress",
    links: [],
  },
  {
    id: "shiftforge",
    name: "ShiftForge",
    tagline: "Shift scheduling for small teams",
    description:
      "Employees, availability and role-based shift templates on a drag-and-drop weekly calendar with auto-generation and CSV import/export.",
    stack: ["Next.js", "TypeScript", "Supabase", "Stripe"],
    status: "in-development",
    image: asset("projects/shiftforge/1.png"),
    links: [{ label: "source", href: "https://github.com/Zkbeyer/shiftforge" }],
  },
  {
    id: "spotify-rewind",
    name: "Spotify Rewind",
    tagline: "Wrapped, on demand",
    description:
      "Turns your Spotify listening history into a year-in-review report with AI-written insights. Spotify only allows allowlisted accounts to sign in to apps in development mode, so the demo is the way in.",
    stack: ["React", "Node.js", "Express", "Spotify API"],
    status: "demo",
    image: asset("projects/spotify/1.png"),
    links: [
      { label: "live", href: "https://your-rewind.vercel.app" },
      { label: "source", href: "https://github.com/Zkbeyer/Rewind" },
    ],
  },
];

export const skills = {
  Languages: ["Python", "Go", "C#", "C++", "C", "SQL", "TypeScript", "JavaScript"],
  Infrastructure: ["Docker", "Kubernetes (k3s)", "Linux", "Prometheus", "Grafana", "GitHub Actions"],
  Data: ["PostgreSQL", "SQL Server", "MongoDB", "schema design", "query optimization", "ETL"],
  Practice: ["code review", "testing", "technical documentation", "CI/CD", "fault-injection testing"],
} as const;
