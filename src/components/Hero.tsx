
import {
  ArrowRight,
  Globe,
  Headset,
  ShieldCheck,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="hero" id="home">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/hero-poster.jpg"
      >
        <source src="/videos/global-trade.mp4" type="video/mp4" />
      </video>

      <div className="hero-content">
        <p className="eyebrow hero-eyebrow">
          YOUR PARTNER IN GLOBAL TRADE
        </p>

        <h1>
          Moving Business
          <br />
          Across Borders,
          <br />
          <span>Seamlessly.</span>
        </h1>

        <p className="hero-description">
          End-to-end import and export solutions for products
          across multiple industries — from agricultural
          commodities to industrial machinery, connecting
          your business to global markets.
        </p>

        <div className="hero-actions">
          <a href="#contact" className="button button-primary">
            GET A QUOTE
            <ArrowRight size={18} />
          </a>

          <a href="#services" className="button button-outline">
            EXPLORE SERVICES
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="hero-trust">
          <div>
            <ShieldCheck />
            <span>
              <strong>QUALITY</strong>
              <small>Focused</small>
            </span>
          </div>

          <div>
            <Globe />
            <span>
              <strong>GLOBAL</strong>
              <small>Connections</small>
            </span>
          </div>

          <div>
            <Headset />
            <span>
              <strong>24/7</strong>
              <small>Support</small>
            </span>
          </div>
        </div>
      </div>

      <div className="hero-stamp">
        <span>SHREEM SOLUTION</span>
        <strong>GLOBAL TRADE</strong>
        <small>BEYOND BORDERS</small>
      </div>
    </section>
  );
}
