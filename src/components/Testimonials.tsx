
import { Quote, ArrowUpRight } from "lucide-react";
import { testimonials } from "../data/testimonials";

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="reviews">
      <div className="testimonials-topline">
        <span>06 / PARTNER STORIES</span>
        <span>BUILT ON TRUST. BACKED BY RELATIONSHIPS.</span>
      </div>

      <div className="testimonials-heading">
        <div>
          <span className="testimonials-eyebrow">
            WHAT OUR CLIENTS SAY
          </span>

          <h2>
            Trust is built
            <br />
            <span>through action.</span>
          </h2>
        </div>

        <div className="testimonials-intro">
          <p>
            Strong global trade begins with strong relationships.
            We believe every successful partnership is built on
            communication, commitment, and consistency.
          </p>

          <a href="#contact" className="testimonials-link">
            START A CONVERSATION
            <ArrowUpRight size={17} />
          </a>
        </div>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((item) => (
          <article
            className="testimonial-card"
            key={item.number}
          >
            <div className="testimonial-card-top">
              <span>{item.number} / TESTIMONIAL</span>
              <Quote size={27} strokeWidth={1.4} />
            </div>

            <span className="testimonial-category">
              {item.category}
            </span>

            <blockquote>{item.quote}</blockquote>

            <div className="testimonial-author">
              <div className="testimonial-avatar">
                {item.name.charAt(0)}
              </div>

              <div className="testimonial-author-info">
                <strong>{item.name}</strong>
                <span>{item.company}</span>
                <span>{item.location}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="testimonials-bottomline">
        <span>SHREEM SOLUTIONS</span>
        <span>CONNECTING MARKETS. CREATING OPPORTUNITIES.</span>
      </div>
    </section>
  );
}
