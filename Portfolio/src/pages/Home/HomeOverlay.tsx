// @ts-ignore
import "./HomeOverlay.css";

type HomeProps = {
  activeIndex?: number;
  numSections?: number;
  onSelectIndex?: (i: number) => void;
  onToggleMusic?: () => void;
  musicMuted?: boolean;
};

const NAV_ITEMS = [
  { label: "PROJECTS", index: 0, className: "page1" },
  { label: "ABOUT", index: 1, className: "page2" },
  { label: "CONTACT", index: 2, className: "page3" },
] as const;

const SOCIALS = [
  { label: "GITHUB", className: "github", href: "https://github.com/Zkbeyer" },
  { label: "LINKEDIN", className: "linkedin", href: "https://www.linkedin.com/in/zackery-beyer/" },
] as const;

export default function Home({
  activeIndex = 0,
  numSections = 3,
  onSelectIndex,
  onToggleMusic,
  musicMuted,
}: HomeProps) {
  return (
    <div>
      <header className="header">
        <div className="overlay-top" role="banner" aria-label="Site header">
          <div className="V">V-004</div>
          <div className="index">INDEX</div>

          <a
            className="resume"
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            aria-label="Open resume PDF"
          >
            CHECK OUT MY RESUME
          </a>

          <div className="name">ZACKERY BEYER</div>
          <div className="title">SOFTWARE DEVELOPER</div>

          <nav className="pages" aria-label="Section navigation">
            {NAV_ITEMS.map((item) => (
              <div key={item.index}>
                <a
                  className={`${item.className} ${activeIndex === item.index ? "active-page" : ""}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectIndex?.(item.index);
                  }}
                  aria-current={activeIndex === item.index ? "page" : undefined}
                >
                  {item.label}
                </a>
              </div>
            ))}
          </nav>
        </div>
      </header>

      <footer className="footer">
        <div className="overlay-bottom" role="contentinfo" aria-label="Site footer">
          <div className="wheel" aria-label="Section indicator">
            {Array.from({ length: numSections }).map((_, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={i}
                  type="button"
                  className={`wheel-dash ${isActive ? "wheel-active" : ""}`}
                  onClick={() => onSelectIndex?.(i)}
                  aria-label={`Go to section ${i + 1} of ${numSections}`}
                  aria-current={isActive ? "true" : undefined}
                  style={{ cursor: "pointer" }}
                >
                  —
                </button>
              );
            })}
          </div>

          <div className="socials" aria-label="Social links">
            {SOCIALS.map((s) => (
              <div key={s.label}>
                <a className={s.className} target="_blank" rel="noreferrer" href={s.href}>
                  {s.label}
                </a>
              </div>
            ))}
          </div>

          <div className="email">
            <a className="mail" href="mailto:zkbeyer@icloud.com">
              ZKBEYER@ICLOUD.COM
            </a>
          </div>

          <div className="music">
            <button
              type="button"
              className={`music-toggle ${musicMuted ? "is-muted" : "is-on"}`}
              onClick={() => onToggleMusic?.()}
              aria-pressed={!musicMuted}
              aria-label={musicMuted ? "Enable audio" : "Mute audio"}
            >
              <span className="music-dot" aria-hidden="true" />
              <span className="music-label">AUDIO</span>
              <span className="music-state">{musicMuted ? "MUTED" : "ENABLED"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}