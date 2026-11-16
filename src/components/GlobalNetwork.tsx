
import {
  ArrowUpRight,
  Globe2,
  MapPin,
  MoveUpRight,
} from "lucide-react";

const networkRegions = [
  {
    number: "01",
    name: "Asia Pacific",
    detail: "Strategic sourcing & supply",
    position: "asia",
  },
  {
    number: "02",
    name: "Middle East",
    detail: "Trade routes & distribution",
    position: "middle-east",
  },
  {
    number: "03",
    name: "Europe",
    detail: "International market access",
    position: "europe",
  },
  {
    number: "04",
    name: "Africa",
    detail: "Emerging trade opportunities",
    position: "africa",
  },
];

export default function GlobalNetwork() {
  return (
    <section className="global-network-section" id="network">
      <div className="global-network-inner">
        <div className="network-topline">
          <span>03 / OUR GLOBAL REACH</span>
          <span>CONNECTING MARKETS. CREATING OPPORTUNITIES.</span>
        </div>

        <div className="network-layout">
          <div className="network-content">
            <div className="network-eyebrow">
              <span className="network-eyebrow-line" />
              BEYOND BORDERS
            </div>

            <h2>
              One network.
              <br />
              <span>Global possibilities.</span>
            </h2>

            <p className="network-description">
              We connect businesses with the right suppliers, buyers and
              opportunities across international markets — making global
              trade more accessible, coordinated and dependable.
            </p>

            <a href="#contact" className="network-cta">
              <span>EXPLORE BUSINESS OPPORTUNITIES</span>
              <ArrowUpRight size={18} />
            </a>

            <div className="network-stats">
              <div>
                <strong>01</strong>
                <span>GLOBAL OUTLOOK</span>
              </div>
              <div>
                <strong>02</strong>
                <span>CONNECTED MARKETS</span>
              </div>
              <div>
                <strong>∞</strong>
                <span>NEW OPPORTUNITIES</span>
              </div>
            </div>
          </div>

          <div className="network-visual">
            <div className="network-visual-heading">
              <span>SHREEM / WORLDWIDE</span>
              <span className="network-live">
                <i />
                CONNECTED
              </span>
            </div>

            <div className="network-map">
              <div className="map-grid" />

              <svg
                className="network-lines"
                viewBox="0 0 700 540"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="networkGlow">
                    <stop offset="0%" stopColor="#0875f9" stopOpacity=".3" />
                    <stop offset="100%" stopColor="#0875f9" stopOpacity="0" />
                  </radialGradient>
                </defs>

                <circle cx="365" cy="250" r="180" fill="url(#networkGlow)" />

                <g className="network-route-lines">
                  <path d="M350 255 Q245 125 160 185" />
                  <path d="M350 255 Q390 100 470 125" />
                  <path d="M350 255 Q520 215 575 300" />
                  <path d="M350 255 Q280 390 220 410" />
                  <path d="M350 255 Q440 380 485 420" />
                  <path d="M160 185 Q300 65 470 125" />
                  <path d="M470 125 Q560 190 575 300" />
                  <path d="M220 410 Q360 470 485 420" />
                </g>

                <g className="network-points">
                  <circle cx="350" cy="255" r="8" />
                  <circle cx="160" cy="185" r="5" />
                  <circle cx="470" cy="125" r="5" />
                  <circle cx="575" cy="300" r="5" />
                  <circle cx="220" cy="410" r="5" />
                  <circle cx="485" cy="420" r="5" />
                </g>
              </svg>

              <div className="network-center">
                <div className="network-center-icon">
                  <Globe2 size={31} strokeWidth={1.3} />
                </div>
                <span>SHREEM</span>
                <small>GLOBAL TRADE</small>
              </div>

              <div className="network-marker marker-asia">
                <span className="marker-dot" />
                <div>
                  <strong>ASIA PACIFIC</strong>
                  <small>SUPPLY NETWORK</small>
                </div>
              </div>

              <div className="network-marker marker-europe">
                <span className="marker-dot" />
                <div>
                  <strong>EUROPE</strong>
                  <small>MARKET ACCESS</small>
                </div>
              </div>

              <div className="network-marker marker-middle-east">
                <span className="marker-dot" />
                <div>
                  <strong>MIDDLE EAST</strong>
                  <small>TRADE CONNECT</small>
                </div>
              </div>

              <div className="network-marker marker-africa">
                <span className="marker-dot" />
                <div>
                  <strong>AFRICA</strong>
                  <small>NEW OPPORTUNITIES</small>
                </div>
              </div>

              <div className="map-coordinate coordinate-one">
                19°04' N / 72°52' E
              </div>
              <div className="map-coordinate coordinate-two">
                GLOBAL NETWORK / 001
              </div>
            </div>

            <div className="network-region-list">
              {networkRegions.map((region) => (
                <div className="network-region" key={region.number}>
                  <span>{region.number}</span>
                  <div>
                    <strong>{region.name}</strong>
                    <small>{region.detail}</small>
                  </div>
                  <MoveUpRight size={15} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="network-bottomline">
          <span>LOCAL EXPERTISE. INTERNATIONAL CONNECTIONS.</span>
          <span>
            LET'S BUILD SOMETHING GLOBAL <MapPin size={13} />
          </span>
        </div>
      </div>
    </section>
  );
}
