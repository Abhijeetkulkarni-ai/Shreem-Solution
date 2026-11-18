import { trustItems } from "../data/site";

export default function Certifications() {
  const marqueeItems = [...trustItems, ...trustItems];

  return (
    <section className="certifications">
      <p className="certification-heading">
        OUR TRADE & COMPLIANCE ECOSYSTEM
      </p>

      <div className="certification-marquee">
        <div className="certification-list">
          {marqueeItems.map((item, index) => (
            <div
              className="certification-item"
              key={`${item.title}-${index}`}
            >
              <span className="certification-number">
                {String((index % trustItems.length) + 1).padStart(2, "0")}
              </span>

              <strong>{item.title}</strong>
              <span className="certification-subtitle">
                {item.subtitle}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}