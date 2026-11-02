import { useEffect, useState } from "react";
import api from "../services/api";
import "./Contact.css";

// =========================================================
// CONTACT COMPONENT
// =========================================================

function Contact() {
  // =========================================================
  // CONTACT PAGE DATA
  // =========================================================

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // =========================================================
  // SUBMISSION STATE
  // =========================================================

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // =========================================================
  // FETCH CONTACT DATA
  // =========================================================

  useEffect(() => {
    const fetchContact = async () => {
      try {
        setLoading(true);
        setLoadError("");

        const response = await api.get("/contact");

        setContact(response.data.data);
      } catch (error) {
        console.error("Failed to load contact page:", error);

        setLoadError(
          error.response?.data?.message ||
            "Failed to load contact information."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  // =========================================================
  // SCROLL REVEAL ANIMATION
  // =========================================================

  useEffect(() => {
    if (!contact) return;

    const elements = document.querySelectorAll(".contact-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("contact-visible");
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    // Observe all reveal elements
    elements.forEach((element) => observer.observe(element));

    // Cleanup observer
    return () => observer.disconnect();
  }, [contact]);

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (submitError) {
      setSubmitError("");
    }
  };

  // =========================================================
  // HANDLE FORM SUBMISSION
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    try {
      setSubmitting(true);
      setSubmitError("");

      await api.post("/contact/messages", formData);

      setSubmitted(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        message: "",
      });

      // Hide success message after 4 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      console.error("Failed to send contact message:", error);

      setSubmitError(
        error.response?.data?.message ||
          "Failed to send message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-header">
            <div className="contact-label">
              <span>CONTACT</span>
              <span>/ 07</span>
            </div>

            <div className="contact-status">
              <span className="contact-status-dot"></span>
              LOADING...
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (loadError || !contact) {
    return (
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-header">
            <div className="contact-label">
              <span>CONTACT</span>
              <span>/ 07</span>
            </div>

            <div className="contact-status">
              <span className="contact-status-dot"></span>
              {loadError || "CONTACT UNAVAILABLE"}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // EXTRACT API DATA
  // =========================================================

  const {
    section,
    availability,
    hero,
    info,
    form,
    links,
    footer,
  } = contact;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="contact-section">

      {/* =====================================================
          BACKGROUND GRID
      ===================================================== */}

      <div className="contact-grid-background"></div>

      <div className="contact-container">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="contact-header contact-reveal">

          {/* Section label */}
          <div className="contact-label">
            <span>{section.label}</span>
            <span>/ {section.number}</span>
          </div>

          {/* Availability status */}
          <div className="contact-status">
            <span className="contact-status-dot"></span>
            {availability}
          </div>

        </div>


        {/* ===================================================
            HERO
        =================================================== */}

        <div className="contact-hero contact-reveal">

          {/* Hero kicker */}
          <p className="contact-kicker">
            {hero.kicker}
          </p>

          {/* Hero title */}
          <h1>
            {hero.title.line1}
            <br />
            <span>{hero.title.line2}</span>
          </h1>

          {/* Hero bottom content */}
          <div className="contact-hero-bottom">

            {/* Hero description */}
            <p>
              {hero.description}
            </p>

            {/* Primary email */}
            <a
              href={`mailto:${hero.email}`}
              className="contact-email"
            >
              {hero.email}
              <span>↗</span>
            </a>

          </div>

        </div>


        {/* ===================================================
            CONTACT BODY
        =================================================== */}

        <div className="contact-body">

          {/* =================================================
              LEFT — CONTACT INFORMATION
          ================================================= */}

          <div className="contact-info contact-reveal">

            {/* Section title */}
            <div className="contact-info-title">
              <span>{info.sectionNumber}</span>
              <h2>{info.title}</h2>
            </div>

            {/* Contact description */}
            <p className="contact-info-description">
              {info.description}
            </p>

            {/* Social / contact links */}
            <div className="contact-links">

              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={
                    link.url.startsWith("http")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    link.url.startsWith("http")
                      ? "noreferrer"
                      : undefined
                  }
                  className="contact-link"
                >
                  <span>{link.label}</span>
                  <strong>↗</strong>
                </a>
              ))}

            </div>

          </div>


          {/* =================================================
              RIGHT — CONTACT FORM
          ================================================= */}

          <div className="contact-form-wrapper contact-reveal">

            {/* Form title */}
            <div className="contact-form-title">
              <span>{form.sectionNumber}</span>
              <h2>{form.title}</h2>
            </div>

            {/* Submission success message */}
            {submitted && (
              <div className="contact-success">
                MESSAGE SENT SUCCESSFULLY
              </div>
            )}

            {/* Submission error */}
            {submitError && (
              <div className="contact-success">
                {submitError}
              </div>
            )}

            {/* Contact form */}
            <form onSubmit={handleSubmit}>

              {/* Name field */}
              <div className="contact-field">

                <label htmlFor="name">
                  NAME
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Email field */}
              <div className="contact-field">

                <label htmlFor="email">
                  EMAIL
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Message field */}
              <div className="contact-field">

                <label htmlFor="message">
                  MESSAGE
                </label>

                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell me about your project..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* Submit button */}
              <button
                type="submit"
                className="contact-submit"
                disabled={submitting}
              >
                <span>
                  {submitting
                    ? "SENDING..."
                    : "SEND MESSAGE"}
                </span>

                <span>↗</span>
              </button>

            </form>

          </div>

        </div>


        {/* ===================================================
            FOOTER CTA
        =================================================== */}

        <div className="contact-footer contact-reveal">

          {/* Footer left */}
          <div className="contact-footer-left">

            <span className="footer-number">
              {footer.number}
            </span>

            <div>
              <span>{footer.label}</span>
              <strong>{footer.message}</strong>
            </div>

          </div>


          {/* Footer right */}
          <div className="contact-footer-right">

            <span>SCROLL TO TOP</span>

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              aria-label="Scroll to top"
            >
              ↑
            </button>

          </div>

        </div>


        {/* ===================================================
            BIG FOOTER
        =================================================== */}

        <footer className="contact-big-footer">

          {/* Footer logo */}
          <div className="footer-logo">
            {footer.logo.replace(".", "")}
            <span>.</span>
          </div>

          {/* Copyright */}
          <div className="footer-copy">
            {footer.copy}
          </div>

          {/* Footer role */}
          <div className="footer-tech">
            {footer.role}
          </div>

        </footer>

      </div>
    </section>
  );
}


// =========================================================
// EXPORT
// =========================================================

export default Contact;