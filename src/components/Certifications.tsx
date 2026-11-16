
import { trustItems } from "../data/site";

export default function Certifications() {
  return (
    <section className="certifications">
      <p className="certification-heading">
        OUR TRADE & COMPLIANCE ECOSYSTEM
      </p>

      <div className="certification-list">
        {trustItems.map((item) => (
          <div
            className="certification-item"
            key={item.title}
          >
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
