
import {
  ArrowUpRight,
  ArrowRight,
  Globe2,
  Mail,
  Phone,
  Ship,
} from "lucide-react";

import { Link } from "react-router-dom";
import { company } from "../data/company";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Our Services", href: "#services" },
  { label: "Our Products", href: "#products" },
  { label: "Global Network", href: "#network" },
  { label: "Contact", href: "#contact" },
];

const services = [
  "Export Solutions",
  "Import Solutions",
  "Product Sourcing",
  "Supplier Coordination",
  "Global Trade Support",
];

export default function Footer() {
  const fullAddress = [
    company.address.line1,
    company.address.line2,
    company.address.city,
    company.address.state,
    company.address.postalCode,
    company.address.country,
  ]
    .filter(Boolean)
    .join(", ");

  const phoneLink = company.phone.primary.replace(/[^\d+]/g, "");

  return (
    <footer className="footer" id="footer">
      <div className="footer-main">
        {/* Brand section */}
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            {company.short.toUpperCase()}<span>.</span>
          </a>

          <p className="footer-brand-description">
            {company.description}
          </p>

          <a href="#contact" className="footer-cta">
            LET'S WORK TOGETHER
            <span>
              <ArrowUpRight size={19} />
            </span>
          </a>

          <div className="footer-socials">
            {company.social.linkedin && (
              <a
                href={company.social.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
              >
                in
              </a>
            )}

            {company.social.instagram && (
              <a
                href={company.social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                ig
              </a>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="footer-column">
          <p className="footer-column-title">EXPLORE</p>

          {quickLinks.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>

        {/* Services */}
        <div className="footer-column">
          <p className="footer-column-title">WHAT WE DO</p>

          {services.map((service) => (
            <a key={service} href="#services">
              {service}
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>

        {/* Contact */}
        <div className="footer-column footer-contact">
          <p className="footer-column-title">GET IN TOUCH</p>

          <a href={`mailto:${company.email.primary}`}>
            <Mail size={16} />
            <span>{company.email.primary}</span>
          </a>

          <a href={`tel:${phoneLink}`}>
            <Phone size={16} />
            <span>{company.phone.primary}</span>
          </a>

          <div className="footer-contact-note">
            <Globe2 size={17} />
            <span>{fullAddress}</span>
          </div>

          <a href="#contact" className="footer-contact-link">
            START A CONVERSATION
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Brand statement */}
      <div className="footer-marquee">
        <span className="footer-marquee-watermark" aria-hidden="true">
          {company.tagline.toUpperCase()}
        </span>

        <span className="footer-marquee-dot">
          <Ship size={64} strokeWidth={1.5} />
        </span>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {company.name.toUpperCase()}. ALL
          RIGHTS RESERVED.
        </p>

        <p className="footer-bottom-center">
          BUILT ON TRUST. CONNECTED BY TRADE.
        </p>

        <a href="#home" className="footer-back-top">
          BACK TO TOP
          <ArrowUpRight size={15} />
        </a>
      </div>

      {/* Legal Links */}
      <div className="footer-legal-links">
        <Link to="/terms-and-conditions">
          Terms & Conditions
        </Link>

        <Link to="/privacy-policy">
          Privacy Policy
        </Link>
      </div>

      {/* Developer credit */}
      <div className="footer-credit">
        <span>Designed &amp; Developed by</span>

        <a
          href="https://creonox.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Creonox Technologies
          <ArrowUpRight size={12} />
        </a>
      </div>
    </footer>
  );
}
