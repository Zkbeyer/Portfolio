export type PageKey = "projects" | "about" | "contact";

export type PageConfig = {
  key: PageKey;
  title: string;
  route: string;
  prompt: string;
};

export const PAGES: PageConfig[] = [
  {
    key: "projects",
    title: "Projects",
    route: "/projects",
    prompt: "Open Projects",
  },
  {
    key: "about",
    title: "About",
    route: "/about",
    prompt: "Open About",
  },
  {
    key: "contact",
    title: "Contact",
    route: "/contact",
    prompt: "Open Contact",
  },
];