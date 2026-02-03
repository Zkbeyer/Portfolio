// @ts-ignore

import "../components/Home.css";

type HomeProps = {
  activeIndex?: number;   // optional so Home still works standalone
  numSections?: number;
  onSelectIndex?: (i: number) => void;
};


export default function Home({activeIndex = 0, numSections = 3, onSelectIndex}: HomeProps) {
     // Map your 3 sections to your links (match your order)
  const pages = [
    { key: "projects", label: "PROJECTS", href: "/projects", className: "page1" },
    { key: "about", label: "ABOUT", href: "/about", className: "page2" },
    { key: "contact", label: "CONTACT", href: "/contact", className: "page3" },
  ];

  const activeKey = pages[activeIndex]?.key ?? "projects";

    return(
    
        <div>
        <header className="header">
        <div className="overlay-top">
            <div className="V">V-001</div>
            <div className="index">INDEX</div>
            <div className="resume">CHECK OUT MY RESUME</div>
            <div className="name">ZACKERY BEYER</div>
            <div className="title">SOFTWARE DEVELOPER</div>

            <div className="pages">
                <div>
                <a
                    className={`page1 ${activeIndex === 0 ? "active-page" : ""}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onSelectIndex?.(0);
                    }}
                    >
                    PROJECTS
                    </a>
                </div>

                <div>
                    <a
                    className={`page2 ${activeIndex === 1 ? "active-page" : ""}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onSelectIndex?.(1);
                    }}
                    >
                    ABOUT
                    </a>
                </div>

                <div>
                    <a
                    className={`page3 ${activeIndex === 2 ? "active-page" : ""}`}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        onSelectIndex?.(2);
                    }}
                    >
                    CONTACT
                    </a>
                </div>
            </div>
        </div>
        </header>     

        <footer className="footer">
            <div className="overlay-bottom">
                <div className="wheel">
                    {Array.from({ length: numSections }).map((_, i) => {
                        const isActive = i === activeIndex;

                        return (
                        <span
                            key={i}
                            className={`wheel-dash ${isActive ? "wheel-active" : ""}`}
                            onClick={() => onSelectIndex?.(i)}
                            style={{ cursor: "pointer" }}
                        >
                            —
                        </span>
                        );
                    })}
                </div>
                <div className="socials">
                    <div><a className="github" target="blank" href="https://github.com/Zkbeyer">GITHUB</a></div>
                    <div ><a className="linkedin" target="blank" href="https://www.linkedin.com/in/zackery-beyer/">LINKEDIN</a></div>
                    
                </div>
                <div className="email"><a className="mail" href="mailto:zkbeyer@icloud.com">ZKBEYER@ICLOUD.COM</a></div>
                <div className="music">Music?</div>
            </div>
        </footer>
        </div>
    );
}