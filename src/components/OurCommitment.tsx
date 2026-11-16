
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
    description:
      "We focus on product quality and reliable sourcing to help businesses make confident trade decisions.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Trust & Transparency",
    description:
      "Clear communication, honest coordination and dependable relationships are at the heart of every interaction.",
    icon: Handshake,
  },
  {
    number: "03",
    title: "Customer Focus",
    description:
      "We understand your requirements and work towards practical solutions that support your business goals.",
    icon: Target,
  },
  {
    number: "04",
    title: "Long-term Partnerships",
    description:
      "We believe lasting success comes from building relationships that create value beyond a single transaction.",
    icon: Compass,
  },
];

export default function OurCommitment() {
  return (
    <section className="commitment-section" id="commitment">
      <div className="commitment-inner">

        {/* Topline */}
        <div className="commitment-topline">
          <span>04 / OUR PHILOSOPHY</span>
          <span>BUILT ON TRUST. DRIVEN BY COMMITMENT.</span>
        </div>

        {/* Main Heading */}
        <div className="commitment-hero">
          <div className="commitment-heading">
            <div className="commitment-eyebrow">
              <span />
              OUR SUCCESS. OUR COMMITMENT.
            </div>

            <h2>
              Your success
              <br />
              is <span>our commitment.</span>
            </h2>
          </div>

          <div className="commitment-intro">
            <span className="commitment-intro-number">S / 04</span>

            <p>
              Success in global trade is built on more than moving products.
              It takes trust, consistency and a genuine commitment to the
              people behind every business.
            </p>

            <a href="#contact" className="commitment-link">
              LET'S BUILD A PARTNERSHIP
              <ArrowUpRight size={17} />
            </a>
          </div>
        </div>

        {/* Shreem Promise */}
        <div className="commitment-statement">
          <div className="commitment-statement-label">
            <span>THE SHREEM PROMISE</span>
            <span>01 — 04</span>
          </div>

          <p>
            Every connection matters.
            <br />
            <span>Every commitment counts.</span>
          </p>

          <div className="commitment-statement-mark">S.</div>
        </div>

        {/* Founders Section */}
        <div className="founders-section">

          <div className="founders-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1764103945182-7d324a311115?q=80&w=867&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
              alt="Shreem Solutions founders"
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
              <span />
              LEADERSHIP & VISION
            </div>

            <h3>
              Behind every
              <br />
              <span>promise is a person.</span>
            </h3>

            <p>
              At Shreem Solutions, we believe strong businesses are built on
              trust, relationships and personal commitment. Our founders
              bring this philosophy to every business connection, working
              to create meaningful partnerships that go beyond borders.
            </p>

            <div className="founders-signature">
              <div>
                <strong>THE FOUNDERS</strong>
                <span>SHREEM SOLUTIONS</span>
              </div>

              <span className="founders-signature-mark">S.</span>
            </div>

            <a href="#contact" className="founders-link">
              CONNECT WITH OUR TEAM
              <ArrowUpRight size={17} />
            </a>
          </div>

        </div>

        {/* Our Commitments */}
        <div className="commitment-grid">
          {commitments.map((item) => {
            const Icon = item.icon;

            return (
              <article className="commitment-card" key={item.number}>
                <div className="commitment-card-top">
                  <span>{item.number} / 04</span>
                  <Icon size={23} strokeWidth={1.5} />
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

        {/* Bottomline */}
        <div className="commitment-bottomline">
          <span>SHREEM SOLUTIONS / BEYOND EVERY BORDER.</span>
          <span>BUILT FOR BUSINESS. COMMITTED TO GROWTH.</span>
        </div>

      </div>
    </section>
  );
}
