
import {
  ArrowRight,
  Globe2,
  Package,
  Clock3,
  Handshake,
} from "lucide-react";

const strengths = [
  {
    value: "Global",
    label: (
      <>
        MARKET
        <br />
        CONNECTIONS
      </>
    ),
    className: "stat-experience",
    icon: Globe2,
  },
  {
    value: "Reliable",
    label: (
      <>
        SUPPLIER
        <br />
        NETWORK
      </>
    ),
    className: "stat-countries",
    icon: Handshake,
  },
  {
    value: "Quality",
    label: (
      <>
        PRODUCT
        <br />
        SOURCING
      </>
    ),
    className: "stat-shipments",
    icon: Package,
  },
  {
    value: "End-to-end",
    label: (
      <>
        TRADE
        <br />
        COORDINATION
      </>
    ),
    className: "stat-delivery",
    icon: Clock3,
  },
];

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-layout">
        <div className="about-content">
          <span className="section-eyebrow">
            ABOUT US
          </span>

          <h2>
            Your Gateway
            <br />
            to Global
            <br />
            <span>Markets.</span>
          </h2>

          <p className="about-description">
            SHREEM SOLUTION connects global buyers and suppliers with
            quality products across agricultural, industrial and commercial
            sectors. We simplify international trade by helping businesses
            source the right products, connect with reliable suppliers and
            coordinate their import and export requirements.
          </p>

          <a href="#contact" className="about-link">
            DISCOVER OUR APPROACH
            <span className="round-arrow">
              <ArrowRight size={17} />
            </span>
          </a>

          <div className="about-index">
            <span>01 / ABOUT US</span>
            <span>CONNECTING BUSINESSES WORLDWIDE</span>
          </div>
        </div>

        <div className="about-stats">
          {strengths.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                className={`about-stat-card ${item.className}`}
                key={item.value}
              >
                <span className="stat-index">
                  0{index + 1}
                </span>

                <Icon
                  className="stat-decoration"
                  strokeWidth={1.2}
                />

                <span className="stat-number">
                  {item.value}
                </span>

                <span className="stat-description">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
