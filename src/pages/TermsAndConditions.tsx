
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { company } from "../data/company";

const sections = [
  {
    title: "1. Introduction",
    content: [
      `Welcome to ${company.name}. These Terms and Conditions govern your access to and use of our website, services, and business communications. By accessing this website, you agree to these terms.`,
      "If you do not agree with any part of these terms, please discontinue using our website.",
    ],
  },
  {
    title: "2. About Our Services",
    content: [
      `${company.name} provides import-export and international trade-related services, including product sourcing, supplier and buyer coordination, trade facilitation, and assistance with business enquiries.`,
      "The availability of products, suppliers, markets, and services may vary depending on commercial requirements, applicable laws, and other relevant conditions.",
    ],
  },
  {
    title: "3. Website Information",
    content: [
      "We make reasonable efforts to keep the information on this website accurate and up to date. However, product descriptions, specifications, availability, pricing, images, and other information are provided for general reference and may change without prior notice.",
      "You should independently verify important product specifications, commercial terms, regulatory requirements, and other details before entering into a transaction.",
    ],
  },
  {
    title: "4. Enquiries and Quotations",
    content: [
      "Submitting an enquiry through our website does not constitute a confirmed order, purchase agreement, or binding commercial commitment.",
      "All quotations, prices, product availability, delivery estimates, payment terms, and other commercial conditions are subject to confirmation in writing by the relevant parties.",
    ],
  },
  {
    title: "5. User Responsibilities",
    content: [
      "When using our website or submitting an enquiry, you agree to:",
      "• Provide accurate, complete, and up-to-date information.",
      "• Use the website only for lawful business and personal purposes.",
      "• Avoid submitting misleading, fraudulent, or unauthorized information.",
      "• Avoid attempting to interfere with the website's security, functionality, or availability.",
      "• Respect applicable intellectual property rights and laws.",
    ],
  },
  {
    title: "6. International Trade and Compliance",
    content: [
      "International trade transactions may be subject to customs regulations, export controls, import restrictions, sanctions, licensing requirements, taxes, duties, and other applicable laws.",
      "Each party involved in a transaction is responsible for fulfilling the legal and regulatory obligations applicable to it. Any assistance provided by us does not replace independent legal, tax, customs, or regulatory advice.",
    ],
  },
  {
    title: "7. Third-Party Suppliers and Services",
    content: [
      "Our services may involve independent suppliers, buyers, manufacturers, logistics providers, financial institutions, and other third parties.",
      "Unless expressly agreed in a separate written contract, these third parties operate independently. Their products, services, performance, delivery commitments, and policies remain subject to their respective terms and obligations.",
    ],
  },
  {
    title: "8. Intellectual Property",
    content: [
      "Unless otherwise stated, the content on this website, including text, graphics, branding, logos, design elements, and other materials, belongs to or is used with permission by the relevant rights holder.",
      "You may not reproduce, distribute, modify, publish, or commercially exploit website content without prior written permission, except where permitted by applicable law.",
    ],
  },
  {
    title: "9. Limitation of Liability",
    content: [
      "To the extent permitted by applicable law, we shall not be liable for indirect, incidental, special, or consequential losses arising from the use of this website or reliance on information published on it.",
      "Nothing in these terms excludes or limits liability that cannot legally be excluded or limited under applicable law.",
    ],
  },
  {
    title: "10. Website Availability",
    content: [
      "We may update, suspend, restrict, or discontinue any part of the website or its features when reasonably necessary. We do not guarantee uninterrupted or error-free access to the website.",
    ],
  },
  {
    title: "11. Privacy",
    content: [
      "Your use of this website is also governed by our Privacy Policy, which explains how information may be collected, used, stored, and shared.",
    ],
  },
  {
    title: "12. Changes to These Terms",
    content: [
      "We may revise these Terms and Conditions from time to time. Updated terms will be published on this page with a revised effective date. Your continued use of the website after changes are published indicates your acceptance of the updated terms, to the extent permitted by law.",
    ],
  },
  {
    title: "13. Governing Law",
    content: [
      "These terms shall be governed by the laws of India, subject to applicable conflict-of-law principles. Any dispute shall be subject to the jurisdiction of the competent courts in accordance with applicable law.",
    ],
  },
  {
    title: "14. Contact Us",
    content: [
      "If you have questions about these Terms and Conditions, please contact us using the contact details provided below.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <header className="legal-header">
          <span className="legal-eyebrow">LEGAL INFORMATION</span>
          <h1>Terms & Conditions<span>.</span></h1>
          <p>
            Please read these terms carefully before using our website or
            engaging with our services.
          </p>
          <div className="legal-meta">
            <span>Effective date: 20 November 2026</span>
            <span>Last updated: 20 November 2026</span>
          </div>
        </header>

        <div className="legal-divider" />

        <div className="legal-content">
          <aside className="legal-sidebar">
            <span>ON THIS PAGE</span>
            {sections.map((section, index) => (
              <a key={section.title} href={`#terms-${index + 1}`}>
                {section.title}
              </a>
            ))}
          </aside>

          <article className="legal-article">
            {sections.map((section, index) => (
              <section
                key={section.title}
                id={`terms-${index + 1}`}
                className="legal-section"
              >
                <h2>{section.title}</h2>
                {section.content.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </section>
            ))}

            <div className="legal-contact">
              <span>HAVE A QUESTION?</span>
              <h2>Let's talk business.</h2>
              <a href={`mailto:${company.email.primary}`}>
                {company.email.primary}
                <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
        </div>

        <footer className="legal-footer">
          <span>© {new Date().getFullYear()} {company.name}. All rights reserved.</span>
          <div>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
