
import {
  ArrowRight,
  Ship,
  FileCheck2,
  Truck,
  Network,
  Globe2,
} from "lucide-react";

const services = [
  {
    number: "01",
    title: "Import Solutions",
    description:
      " Find the right products, connect with reliable suppliers and simplify your international sourcing journey.",
    icon: Ship,
  },
  {
    number: "02",
    title: "Customs & Documentation",
    description:
      "Coordinate essential trade documents and customs-related requirements.",
    icon: FileCheck2,
  },
  {
    number: "03",
    title: "Logistics & Shipping",
    description:
      "Coordinate transportation and shipment movement across international trade routes.",
    icon: Truck,
  },
  {
    number: "04",
    title: "Sourcing & Procurement",
    description:
      "Find suitable manufacturers and suppliers based on your product requirements.",
    icon: Network,
  },
  {
    number: "05",
    title: "Global Supplier Network",
    description:
      "Connect with relevant product sources and business opportunities across markets.",
    icon: Globe2,
  },
];

export default function Services() {
  return (
    <section className="services-section" id="services">
      <div className="services-inner">
        <header className="services-heading">
          <div className="services-title-group">
            <span className="section-eyebrow">
              WHAT WE DO — HOW WE HELP
            </span>

            <h2>
              Trade without
              <br />
              <span>boundaries.</span>
            </h2>
          </div>

          <a href="#contact" className="services-view-link">
            <span>LET'S DISCUSS YOUR REQUIREMENTS</span>
            <span className="round-arrow">
              <ArrowRight size={17} />
            </span>
          </a>
        </header>

        <div className="services-grid">
          <a href="#contact" className="import-feature">
            <div className="import-feature-top">
              <span className="import-label">
                SHREEM SOLUTION / 01
              </span>
              <span className="import-feature-index">GLOBAL TRADE</span>
            </div>

            <div className="import-feature-content">
              <span className="import-kicker">
                YOUR GATEWAY TO GLOBAL MARKETS
              </span>

              <h3>
                Export
                <br />
                <em>Solutions.</em>
              </h3>

              <p>
               
                Connect quality products with international buyers and expand into global markets.
              </p>

              <span className="import-feature-action">
                EXPLORE EXPORT SOLUTIONS
                <span className="round-arrow import-arrow">
                  <ArrowRight size={18} />
                </span>
              </span>
            </div>

            <span className="import-feature-watermark">S</span>
          </a>

          <div className="services-cards">
            <div className="service-card-row service-card-top">
              {services.slice(0, 2).map((service) => {
                const Icon = service.icon;

                return (
                  <a
                    href="#contact"
                    className="service-card service-card-large"
                    key={service.number}
                  >
                    <div className="service-card-topline">
                      <span className="service-number">
                        {service.number}
                      </span>
                      <Icon
                        className="service-icon"
                        strokeWidth={1.4}
                      />
                    </div>

                    <div className="service-card-content">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>

                    <ArrowRight
                      className="service-arrow"
                      size={19}
                    />
                  </a>
                );
              })}
            </div>

            <div className="service-card-row service-card-bottom">
              {services.slice(2).map((service) => {
                const Icon = service.icon;

                return (
                  <a
                    href="#contact"
                    className="service-card service-card-small"
                    key={service.number}
                  >
                    <div className="service-card-topline">
                      <span className="service-number">
                        {service.number}
                      </span>
                      <Icon
                        className="service-icon"
                        strokeWidth={1.4}
                      />
                    </div>

                    <div className="service-card-content">
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>

                    <ArrowRight
                      className="service-arrow"
                      size={17}
                    />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="services-footer">
          <span>02 / OUR SERVICES</span>
          <span>SOURCING · COORDINATION · GLOBAL TRADE</span>
          <span>SHREEM SOLUTION</span>
        </footer>
      </div>
    </section>
  );
}
