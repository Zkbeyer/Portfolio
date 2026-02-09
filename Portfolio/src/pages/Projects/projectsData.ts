export type Project = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
  images: string[];     // put paths in /public/projects/...
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
    images: ["/projects/spotify/1.png", "/projects/spotify/2.png"],
    repoUrl: "https://github.com/Zkbeyer/<your-repo>",
    liveUrl: undefined,
  },
  {
    id: "secret-scanner",
    title: "Secret Scanner",
    tagline: "Catch leaked tokens early",
    description:
      "CLI/tooling that scans repos for secrets, risky configs, and credential patterns with actionable output.",
    tech: ["C#", ".NET", "Regex", "Git"],
    images: ["/projects/scanner/1.png"],
    repoUrl: "https://github.com/Zkbeyer/<your-repo>",
  },
];