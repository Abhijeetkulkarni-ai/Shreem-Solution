
import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";

const faqItems = [
  {
    number: "01",
    question: "What products does SHREEM SOLUTION deal in?",
    answer:
      "We work across diverse product categories, including agricultural commodities, industrial goods, machinery, chemicals, textiles, and specialized equipment. Product availability and specifications depend on your requirements and sourcing needs.",
  },
  {
    number: "02",
    question: "Do you handle both imports and exports?",
    answer:
      "Yes. We support both import and export requirements by connecting buyers and suppliers, coordinating product sourcing, and helping facilitate international trade transactions.",
  },
  {
    number: "03",
    question: "Can you help us find international suppliers?",
    answer:
      "Yes. Share your product specifications, quantity, quality standards, and target market. We can help identify potential suppliers and coordinate the sourcing process based on your requirements.",
  },
  {
    number: "04",
    question: "Do you work with international buyers?",
    answer:
      "Yes. We connect with buyers across international markets and help coordinate product requirements, supplier communication, and trade opportunities.",
  },
  {
    number: "05",
    question: "How does your sourcing process work?",
    answer:
      "The process begins with understanding your product requirements, specifications, quantity, and destination. We then work on identifying suitable sourcing opportunities and coordinating communication between the relevant parties.",
  },
  {
    number: "06",
    question: "Do you assist with export documentation?",
    answer:
      "We can help coordinate export-related documentation and communication as part of a trade transaction. Specific documentation, compliance requirements, and responsibilities depend on the product, destination, and agreed scope of work.",
  },
  {
    number: "07",
    question: "How can I request a quotation?",
    answer:
      "Use our contact form or email us with your product name, specifications, quantity, destination, and any relevant requirements. Our team can review your enquiry and discuss the next steps.",
  },
  {
    number: "08",
    question: "How do I start a business partnership with SHREEM SOLUTION?",
    answer:
      "Get in touch through our contact section and tell us whether you are a buyer, supplier, or business looking for sourcing support. Share your requirements so we can explore potential opportunities together.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <section className="faq-section" id="faq">
      <div className="faq-topline">
        <span>07 / FREQUENTLY ASKED QUESTIONS</span>
        <span>CLARITY BEFORE COMMITMENT.</span>
      </div>

      <div className="faq-layout">
        <div className="faq-heading">
          <span className="faq-eyebrow">GOOD TO KNOW</span>

          <h2>
            Questions?
            <br />
            <span>We've got</span>
            <br />
            answers.
          </h2>

          <p>
            Everything you need to know about working with
            SHREEM SOLUTION and making your next global
            trade opportunity happen.
          </p>

          <a href="#contact" className="faq-contact-link">
            STILL HAVE QUESTIONS?
            <span>
              LET'S TALK <ArrowUpRight size={16} />
            </span>
          </a>

          <div className="faq-side-note">
            <span>SHREEM SOLUTION</span>
            <span>BEYOND EVERY BORDER.</span>
          </div>
        </div>

        <div className="faq-list">
          {faqItems.map((item, index) => {
            const isOpen = activeIndex === index;
            const answerId = `faq-answer-${index}`;

            return (
              <article
                className={`faq-item ${isOpen ? "faq-item-open" : ""}`}
                key={item.number}
              >
                <button
                  className="faq-question"
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="faq-number">{item.number}</span>

                  <span className="faq-question-text">
                    {item.question}
                  </span>

                  <span className="faq-icon">
                    <Plus size={19} strokeWidth={1.5} />
                  </span>
                </button>

                <div
                  className="faq-answer"
                  id={answerId}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="faq-bottomline">
        <span>YOUR QUESTIONS. OUR COMMITMENT.</span>
        <span>CONNECTING MARKETS. CREATING OPPORTUNITIES.</span>
      </div>
    </section>
  );
}
