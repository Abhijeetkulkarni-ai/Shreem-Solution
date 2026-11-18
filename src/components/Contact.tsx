
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { supabase } from "../lib/supabase";
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Globe2,
  Send,
  CheckCircle2,
} from "lucide-react";

import { company } from "../data/company";

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
  const [showForm, setShowForm] = useState<boolean>(false);

  const phoneLink = company.phone.primary.replace(/[^\d+]/g, "");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fullAddress = [
    company.address.line1,
    company.address.line2,
    company.address.city,
    company.address.state,
    company.address.postalCode,
    company.address.country,
  ]
    .filter(Boolean)
    .join(", ");

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

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const { error } = await supabase.from("leads").insert({
        company_name:
          formData.company.trim() || "Individual / Not provided",

        contact_name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,

        product_interest: formData.inquiry,
        notes: formData.message.trim(),

        source: "website",
        status: "new",
        priority: "normal",
      });

      if (error) throw error;

      setSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Contact form submission error:", error);

      setSubmitError(
        "We couldn't submit your inquiry. Please try again or contact us directly by email."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeForm = (): void => {
    setShowForm(false);
    setSubmitted(false);
  };

  return (
    <section className="contact-section" id="contact">

      {/* TOPLINE */}
      <div className="contact-topline">
        <span>05 / CONTACT</span>
        <span>LET'S TALK BUSINESS.</span>
      </div>

      {/* HEADING */}
      <div className="contact-heading">
        <div>
          <div className="contact-eyebrow">
            <span />
            CONNECT WITH {company.name.toUpperCase()}
          </div>

          <h2>
            Let's do
            <br />
            <span>business</span> together.
          </h2>
        </div>

        <div className="contact-heading-text">
          <p>
            Looking to source, import or export?
            Tell us what you need. Let's make it happen.
          </p>

          <div className="contact-heading-note">
            <Globe2 size={16} />
            <span>YOUR NEXT OPPORTUNITY STARTS HERE.</span>
          </div>
        </div>
      </div>

      {/* CONTACT LAYOUT */}
      <div
        className={`contact-layout ${showForm ? "form-open" : "form-closed"
          }`}
      >

        {/* CONTACT INFORMATION */}
        <div className="contact-info">

          <span className="contact-info-label">
            GET IN TOUCH
          </span>

          <h3>
            Let's start
            <br />
            with a <span>hello.</span>
          </h3>

          <p className="contact-info-description">
            Our team is ready to discuss your trade and
            sourcing requirements.
          </p>

          {/* INQUIRY BUTTON */}
          {!showForm && (
            <button
              type="button"
              className="contact-open-form"
              onClick={() => setShowForm(true)}
            >
              SEND AN INQUIRY
              <ArrowUpRight size={18} />
            </button>
          )}

          {/* CONTACT DETAILS */}
          <div className="contact-details">

            {/* EMAIL */}
            <a
              href={`mailto:${company.email.primary}`}
              className="contact-detail"
            >
              <div className="contact-detail-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>EMAIL US</span>
                <strong>{company.email.primary}</strong>
              </div>

              <ArrowUpRight size={16} />
            </a>

            {/* PHONE */}
            <a
              href={`tel:${phoneLink}`}
              className="contact-detail"
            >
              <div className="contact-detail-icon">
                <Phone size={18} />
              </div>

              <div>
                <span>CALL US</span>
                <strong>{company.phone.primary}</strong>
              </div>

              <ArrowUpRight size={16} />
            </a>

            {/* ADDRESS */}
            <div className="contact-detail">
              <div className="contact-detail-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>OUR LOCATION</span>
                <strong>
                  {company.address.city}, {company.address.state}
                </strong>
                <small>{fullAddress}</small>
              </div>
            </div>

          </div>

          {/* BOTTOM BRAND */}
          <div className="contact-info-bottom">
            <span>{company.name.toUpperCase()}</span>
            <span>{company.tagline.toUpperCase()}</span>
          </div>
        </div>

        {/* CONTACT FORM */}
        {showForm && (
          <div className="contact-form-wrap">

            <div className="contact-form-header">
              <div>
                <span>01 — YOUR DETAILS</span>
                <h3>How can we help?</h3>
              </div>

              <button
                type="button"
                className="contact-form-close"
                onClick={closeForm}
                aria-label="Close contact form"
              >
                ×
              </button>
            </div>

            {/* SUCCESS STATE */}
            {submitted ? (
              <div className="contact-success">
                <CheckCircle2 size={40} />

                <div className="contact-success">
                  <CheckCircle2 size={40} />

                  <h3>Thank you for reaching out!</h3>

                  <p>
                    Your inquiry has been successfully submitted.
                    Our team will review your requirements and get
                    back to you shortly.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setShowForm(false);
                    }}
                  >
                    DONE
                    <ArrowUpRight size={16} />
                  </button>
                </div>

                <p>
                  Your email application should open with
                  your inquiry. Send the prepared email to
                  complete your request.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData(initialFormData);
                    setShowForm(false);
                  }}
                >
                  DONE
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ) : (

              /* FORM */
              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                {/* NAME AND EMAIL */}
                <div className="contact-form-row">

                  <div className="contact-field">
                    <label htmlFor="contact-name">
                      YOUR NAME *
                    </label>

                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder="Full name"
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

                {/* COMPANY AND PHONE */}
                <div className="contact-form-row">

                  <div className="contact-field">
                    <label htmlFor="contact-company">
                      COMPANY
                    </label>

                    <input
                      id="contact-company"
                      type="text"
                      name="company"
                      placeholder="Company name"
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

                {/* INQUIRY TYPE */}
                <div className="contact-field">
                  <label htmlFor="contact-inquiry">
                    INQUIRY TYPE *
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

                {/* MESSAGE */}
                <div className="contact-field">
                  <label htmlFor="contact-message">
                    YOUR MESSAGE *
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows={3}
                    placeholder="Tell us briefly about your requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                {submitError && (
                  <p className="contact-submit-error" role="alert">
                    {submitError}
                  </p>
                )}
                {/* FORM FOOTER */}
                <div className="contact-form-footer">
                  <p>
                    * Required fields. Your details help us
                    respond to your inquiry.
                  </p>

                  <button
                    type="submit"
                    className="contact-submit"
                    disabled={submitting}
                  >
                    {submitting ? "SUBMITTING..." : "SEND INQUIRY"}

                    {!submitting && <Send size={15} />}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>

      {/* BOTTOM LINE */}
      <div className="contact-bottomline">
        <span>
          {company.name.toUpperCase()} / {company.address.country.toUpperCase()}
        </span>

        <span>
          {company.business.slogan.toUpperCase()}
        </span>
      </div>

    </section>
  );
}
