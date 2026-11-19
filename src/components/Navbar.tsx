
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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

  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  const isProductsPage =
    location.pathname === "/products" ||
    location.pathname.startsWith("/products/");

  const closeMenu = () => setMenuOpen(false);

  const navigateToSection = (href: string) => {
    closeMenu();

    if (!isHomePage) {
      navigate(`/${href}`);
      return;
    }

    const sectionId = href.slice(1);
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      window.history.replaceState(null, "", `/${href}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      if (!isHomePage) return;

      const sections = navLinks
        .map((link) => document.getElementById(link.href.slice(1)))
        .filter((section): section is HTMLElement => section !== null);

      let currentSection = "home";

      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 150) {
          currentSection = section.id;
        }
      });

      setActiveSection(currentSection);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    const handleResize = () => {
      if (window.innerWidth > 900) closeMenu();
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
  }, [isHomePage]);

  useEffect(() => {
    if (isHomePage && location.hash) {
      const sectionId = location.hash.slice(1);

      requestAnimationFrame(() => {
        document.getElementById(sectionId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else if (!isHomePage) {
      setActiveSection("");
    }
  }, [isHomePage, location.hash, location.pathname]);

  return (
    <header className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <Link to="/" className="brand" onClick={closeMenu}>
        <img
          src="/images/shreem-logo.png"
          alt="SHREEM SOLUTION"
          className="brand-logo"
        />
        <span className="brand-name">SHREEM SOLUTION</span>
      </Link>

      <nav
        className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}
        id="primary-navigation"
        aria-label="Main navigation"
      >
        {navLinks.map((link) => {
          const sectionId = link.href.slice(1);

          const isActive =
            (link.label === "Products" && isProductsPage) ||
            (isHomePage && activeSection === sectionId);

          return (
            <a
              key={link.href}
              href={
                link.label === "Products"
                  ? "/products"
                  : isHomePage
                    ? link.href
                    : `/${link.href}`
              }
              className={isActive ? "active" : ""}
              onClick={(event) => {
                event.preventDefault();

                if (link.label === "Products") {
                  closeMenu();

                  if (!isProductsPage) {
                    navigate("/products");
                  }

                  return;
                }

                navigateToSection(link.href);
              }}
              aria-current={isActive ? "location" : undefined}
            >
              {link.label}
            </a>
          );
        })}

        <a
          href={isHomePage ? "#contact" : "/#contact"}
          className="nav-mobile-cta"
          onClick={(event) => {
            event.preventDefault();
            navigateToSection("#contact");
          }}
        >
          LET'S CONNECT
          <ArrowUpRight size={16} />
        </a>
      </nav>

      <a
        href={isHomePage ? "#contact" : "/#contact"}
        className="nav-cta"
        onClick={(event) => {
          event.preventDefault();
          navigateToSection("#contact");
        }}
      >
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
