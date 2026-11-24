import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const sectionLinks = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "certificates", label: "Certificates" },
  { id: "contact", label: "Contact" }
];

export default function Navbar({ email, resumeUrl, resumeName }) {
  const [activeSection, setActiveSection] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sections = sectionLinks
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(entries => {
      const activationPoint = window.innerHeight * 0.35;
      const current = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) =>
          Math.abs(a.boundingClientRect.top - activationPoint) -
          Math.abs(b.boundingClientRect.top - activationPoint)
        )[0];
      if (current) setActiveSection(current.target.id);
    }, { rootMargin: "-30% 0px -60% 0px" });

    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-nav${menuOpen ? " is-expanded" : ""}`}>
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" onClick={closeMenu} aria-label="Triparna Ghosh home">
          TG<span>.</span>
        </a>
        <div className={`nav-links${menuOpen ? " is-open" : ""}`} id="primary-navigation">
          {sectionLinks.map(({ id, label }) => (
            <a
              href={`#${id}`}
              key={id}
              onClick={closeMenu}
              aria-current={activeSection === id ? "location" : undefined}
            >
              {label}
            </a>
          ))}
          {resumeUrl && (
            <a href={resumeUrl} download={resumeName || "Triparna-Ghosh-Resume.pdf"} onClick={closeMenu}>
              Resume
            </a>
          )}
        </div>
        <div className="nav-actions">
          <a className="nav-cta" href={`mailto:${email}`}>Let’s Talk <ArrowUpRight size={16}/></a>
          <button
            className="nav-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen(open => !open)}
          >
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>
    </header>
  );
}
