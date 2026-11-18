import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Products", href: "#products" },
  { label: "Global Network", href: "#network" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      const sections = navLinks
        .map((link) => document.querySelector(link.href))
        .filter((section): section is Element => section !== null);

      let currentSection = "home";

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;

        if (sectionTop <= 150) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <a href="#home" className="brand" onClick={closeMenu}>
        <img
          src="/images/shreem-logo.png"
          alt="Shreem Solutions"
          className="brand-logo"
        />
        <span className="brand-name">SHREEM SOLUTIONS</span>
      </a>

      <nav
        className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
        id="primary-navigation"
        aria-label="Main navigation"
      >
        {navLinks.map((link) => {
          const sectionId = link.href.slice(1);

          return (
            <a
              key={link.href}
              href={link.href}
              className={activeSection === sectionId ? "active" : ""}
              onClick={closeMenu}
              aria-current={
                activeSection === sectionId ? "location" : undefined
              }
            >
              {link.label}
            </a>
          );
        })}

        <a
          href="#contact"
          className="nav-mobile-cta"
          onClick={closeMenu}
        >
          LET'S CONNECT
          <ArrowUpRight size={16} />
        </a>
      </nav>

      <a href="#contact" className="nav-cta">
        LET'S CONNECT
        <ArrowUpRight size={16} />
      </a>

      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
      >
        {menuOpen ? <X size={25} /> : <Menu size={25} />}
      </button>
    </header>
  );
}