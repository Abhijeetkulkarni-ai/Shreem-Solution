
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Send,
  CheckCircle2,
} from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  inquiry: string;
  message: string;
}

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  company: "",
  phone: "",
  inquiry: "General Business Inquiry",
  message: "",
};

export default function Contact() {
  const [formData, setFormData] =
    useState<ContactFormData>(initialFormData);

  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Business Inquiry — ${formData.inquiry}`
    );

    const body = encodeURIComponent(
      `Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company}
Phone: ${formData.phone}
Inquiry: ${formData.inquiry}

Message:
${formData.message}`
    );

    window.location.href = `mailto:info@shreemsolutions.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-topline">
        <span>05 / GET IN TOUCH</span>
        <span>LET'S START A CONVERSATION.</span>
      </div>

      <div className="contact-heading">
        <div>
          <div className="contact-eyebrow">
            <span />
            CONNECT WITH SHREEM
          </div>

          <h2>
            Let's make
            <br />
            <span>global business</span>
            <br />
            happen.
          </h2>
        </div>

        <div className="contact-heading-text">
          <p>
            Have a product to source, a market to explore or a business
            opportunity to discuss? Tell us what you need. Let's find the
            right way forward together.
          </p>

          <div className="contact-heading-note">
            <Globe2 size={17} />
            <span>YOUR NEXT OPPORTUNITY STARTS HERE.</span>
          </div>
        </div>
      </div>

      <div className="contact-layout">
        {/* CONTACT INFORMATION */}

        <div className="contact-info">
          <span className="contact-info-label">
            CONTACT INFORMATION
          </span>

          <h3>
            Every great
            <br />
            partnership starts
            <br />
            with a <span>hello.</span>
          </h3>

          <p className="contact-info-description">
            Connect with our team to discuss sourcing, exports, imports,
            product requirements and international trade opportunities.
          </p>

          <div className="contact-details">
            <a
              href="mailto:YOUR_EMAIL_ADDRESS"
              className="contact-detail"
            >
              <div className="contact-detail-icon">
                <Mail size={19} />
              </div>

              <div>
                <span>EMAIL US</span>
                <strong>YOUR_EMAIL_ADDRESS</strong>
              </div>

              <ArrowUpRight size={17} />
            </a>

            <a
              href="tel:YOUR_PHONE_NUMBER"
              className="contact-detail"
            >
              <div className="contact-detail-icon">
                <Phone size={19} />
              </div>

              <div>
                <span>CALL US</span>
                <strong>YOUR_PHONE_NUMBER</strong>
              </div>

              <ArrowUpRight size={17} />
            </a>

            <div className="contact-detail">
              <div className="contact-detail-icon">
                <MapPin size={19} />
              </div>

              <div>
                <span>OUR LOCATION</span>
                <strong>India</strong>
              </div>
            </div>
          </div>

          <div className="contact-info-bottom">
            <span>SHREEM SOLUTIONS</span>
            <span>BEYOND EVERY BORDER.</span>
          </div>
        </div>

        {/* CONTACT FORM */}

        <div className="contact-form-wrap">
          <div className="contact-form-header">
            <div>
              <span>01 — YOUR DETAILS</span>
              <h3>Tell us about your requirements.</h3>
            </div>

            <span className="contact-form-index">
              S. / 001
            </span>
          </div>

          {submitted ? (
            <div className="contact-success">
              <CheckCircle2 size={42} />

              <h3>Your message is ready!</h3>

              <p>
                Your email application should open with your inquiry.
                Please send the prepared email to complete your request.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData(initialFormData);
                }}
              >
                SEND ANOTHER MESSAGE
                <ArrowUpRight size={16} />
              </button>
            </div>
          ) : (
            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >
              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">
                    YOUR NAME *
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-email">
                    EMAIL ADDRESS *
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-field">
                  <label htmlFor="contact-company">
                    COMPANY NAME
                  </label>

                  <input
                    id="contact-company"
                    type="text"
                    name="company"
                    placeholder="Your company"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-phone">
                    PHONE NUMBER
                  </label>

                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-inquiry">
                  WHAT CAN WE HELP YOU WITH? *
                </label>

                <select
                  id="contact-inquiry"
                  name="inquiry"
                  value={formData.inquiry}
                  onChange={handleChange}
                  required
                >
                  <option>General Business Inquiry</option>
                  <option>Export Requirements</option>
                  <option>Import Requirements</option>
                  <option>Product Sourcing</option>
                  <option>Supplier Partnership</option>
                  <option>Buyer Partnership</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">
                  YOUR MESSAGE *
                </label>

                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your product, requirements, target market or business opportunity..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-form-footer">
                <p>
                  * Required fields. Your information will be used to
                  respond to your inquiry.
                </p>

                <button
                  type="submit"
                  className="contact-submit"
                >
                  SEND INQUIRY
                  <Send size={16} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="contact-bottomline">
        <span>SHREEM SOLUTIONS / INDIA</span>
        <span>CONNECTING MARKETS. CREATING OPPORTUNITIES.</span>
      </div>
    </section>
  );
}
