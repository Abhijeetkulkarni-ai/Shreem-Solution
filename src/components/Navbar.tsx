
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { navigation, siteConfig } from "../data/site";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <a href="#home" className="brand">
        <div className="brand-mark">S</div>
        <span>{siteConfig.name}</span>
      </a>

      <nav className={`nav-links ${menuOpen ? "active" : ""}`}>
        {navigation.map((item) => (
          <a
            key={item.label}
            href={item.href}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <a href="#contact" className="nav-cta">
        GET A QUOTE <ArrowRight size={17} />
      </a>

      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}
