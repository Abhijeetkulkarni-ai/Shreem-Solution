
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { company } from "../data/company";

const sections = [
  {
    title: "1. Introduction",
    content: [
      `${company.name} respects your privacy and is committed to handling personal information responsibly. This Privacy Policy explains how information may be collected, used, stored, and shared when you visit our website or contact us.`,
      "By using our website, you acknowledge this policy. Please do not submit personal information through our website if you do not agree with the practices described here.",
    ],
  },
  {
    title: "2. Information We May Collect",
    content: [
      "Depending on how you interact with us, we may collect the following categories of information:",
      "• Contact information: name, email address, phone number, company name, and business address.",
      "• Business enquiry information: product requirements, sourcing requests, destination markets, and other details you choose to provide.",
      "• Communication information: messages, enquiry details, and correspondence with our team.",
      "• Technical information: IP address, browser type, device information, pages visited, and basic website usage data, where collected through server logs or analytics tools.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: [
      "We may use information collected to:",
      "• Respond to enquiries and business requests.",
      "• Provide information about our import-export and trade-related services.",
      "• Coordinate relevant product, supplier, or buyer enquiries.",
      "• Communicate about quotations, potential transactions, and business relationships.",
      "• Maintain, secure, and improve our website.",
      "• Meet applicable legal, regulatory, and record-keeping obligations.",
    ],
  },
  {
    title: "4. Sharing of Information",
    content: [
      "We do not sell your personal information. We may share relevant information where reasonably necessary with:",
      "• Suppliers, manufacturers, buyers, or business partners involved in your enquiry.",
      "• Logistics, shipping, customs, and other service providers where required to support a requested transaction.",
      "• Technology, hosting, communication, and website service providers supporting our operations.",
      "• Government authorities, regulators, or other parties where disclosure is required by law or necessary to protect legal rights.",
      "We aim to share only information relevant to the purpose for which it is disclosed.",
    ],
  },
  {
    title: "5. Cookies and Website Technologies",
    content: [
      "Our website or its service providers may use cookies or similar technologies to support website functionality, understand website usage, and improve user experience.",
      "You can manage cookies through your browser settings. Disabling certain cookies may affect some website features.",
      "If analytics or other tracking technologies are enabled on the website, their collection and use will be subject to the applicable provider's terms and settings.",
    ],
  },
  {
    title: "6. Data Storage and Security",
    content: [
      "We take reasonable technical and organizational measures designed to protect information against unauthorized access, alteration, disclosure, or loss.",
      "However, no internet transmission or electronic storage method can be guaranteed to be completely secure. We cannot promise absolute security.",
      "Information is retained for as long as reasonably necessary for the purposes described in this policy, including business, legal, and regulatory requirements.",
    ],
  },
  {
    title: "7. International Data Transfers",
    content: [
      "Because our business may involve international trade and service providers in different countries, information may be processed or transferred across national borders where necessary for business operations or legal compliance.",
      "Where applicable, we will take reasonable steps to ensure that such processing is handled in accordance with relevant data protection requirements.",
    ],
  },
  {
    title: "8. Your Privacy Rights",
    content: [
      "Subject to applicable law, you may have the right to request access to, correction of, or deletion of personal information that we hold about you. You may also raise concerns about how your information is being used.",
      "To make a privacy-related request, contact us using the details below. We may need to verify your identity before responding.",
    ],
  },
  {
    title: "9. Third-Party Websites",
    content: [
      "Our website may contain links to third-party websites or services. We do not control those websites and are not responsible for their privacy practices or content. We encourage you to review their respective privacy policies.",
    ],
  },
  {
    title: "10. Children's Privacy",
    content: [
      "Our website and services are intended for business and general audiences and are not specifically directed at children. We do not knowingly seek to collect personal information from children in violation of applicable law.",
    ],
  },
  {
    title: "11. Changes to This Privacy Policy",
    content: [
      "We may update this Privacy Policy from time to time to reflect changes in our business, website, or legal requirements. Any revised version will be published on this page with an updated date.",
    ],
  },
  {
    title: "12. Contact Us",
    content: [
      "For questions, requests, or concerns regarding this Privacy Policy or the handling of your personal information, please contact us.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back">
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <header className="legal-header">
          <span className="legal-eyebrow">YOUR PRIVACY MATTERS</span>
          <h1>Privacy Policy<span>.</span></h1>
          <p>
            Transparency matters. Learn how we handle information when you
            interact with Shreem Solution.
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
              <a key={section.title} href={`#privacy-${index + 1}`}>
                {section.title}
              </a>
            ))}
          </aside>

          <article className="legal-article">
            {sections.map((section, index) => (
              <section
                key={section.title}
                id={`privacy-${index + 1}`}
                className="legal-section"
              >
                <h2>{section.title}</h2>
                {section.content.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </section>
            ))}

            <div className="legal-contact">
              <span>PRIVACY QUESTIONS?</span>
              <h2>We're here to help.</h2>
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
