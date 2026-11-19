
import {
  ArrowUpRight,
  ShieldCheck,
  Handshake,
  Target,
  Compass,
} from "lucide-react";

const commitments = [
  {
    number: "01",
    title: "Quality First",
    description: "Reliable sourcing and quality-focused trade solutions.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Trust & Transparency",
    description: "Honest communication and dependable coordination.",
    icon: Handshake,
  },
  {
    number: "03",
    title: "Customer Focus",
    description: "Practical solutions built around your business needs.",
    icon: Target,
  },
  {
    number: "04",
    title: "Long-term Partnerships",
    description: "Building relationships that create lasting value.",
    icon: Compass,
  },
];

export default function OurCommitment() {
  return (
    <section className="commitment-section" id="commitment">
      <div className="commitment-inner">

        <div className="commitment-topline">
          <span>04 / OUR PHILOSOPHY</span>
          <span>BUILT ON TRUST. DRIVEN BY COMMITMENT.</span>
        </div>

        <div className="commitment-hero">
          <div>
            <div className="commitment-eyebrow">
              <span /> OUR SUCCESS. OUR COMMITMENT.
            </div>
            <h2>
              Your success
              <br />
              is <span>our commitment.</span>
            </h2>
          </div>

          <div className="commitment-intro">
            <p>
              Global trade is built on trust, consistency and
              meaningful business relationships.
            </p>
            <a href="#contact" className="commitment-link">
              LET'S PARTNER <ArrowUpRight size={17} />
            </a>
          </div>
        </div>

        <div className="founders-section">
          <div className="founders-image-wrap">
            <img
              src="images/founder.png"
              alt="SHREEM SOLUTION leadership"
              className="founders-image"
              loading="lazy"
            />
            <div className="founders-image-label">
              <span>THE PEOPLE BEHIND SHREEM</span>
              <span>SHREEM / 001</span>
            </div>
          </div>

          <div className="founders-content">
            <div className="founders-eyebrow">
              <span /> LEADERSHIP & VISION
            </div>
            <h3>
              Behind every
              <br />
              <span>promise is a person.</span>
            </h3>
            <p>
              We believe strong businesses are built on trust,
              relationships and personal commitment. Every
              connection reflects our dedication to meaningful
              partnerships.
            </p>
            <a href="#contact" className="founders-link">
              MEET OUR TEAM <ArrowUpRight size={17} />
            </a>
          </div>
        </div>

        <div className="commitment-grid">
          {commitments.map((item) => {
            const Icon = item.icon;

            return (
              <article className="commitment-card" key={item.number}>
                <div className="commitment-card-top">
                  <span>{item.number} / 04</span>
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                <div className="commitment-card-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="commitment-card-bottom">
                  <span>OUR COMMITMENT</span>
                  <span className="commitment-card-arrow">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="commitment-bottomline">
          <span>SHREEM SOLUTION / BEYOND EVERY BORDER.</span>
          <span>BUILT FOR BUSINESS. COMMITTED TO GROWTH.</span>
        </div>

      </div>
    </section>
  );
}
