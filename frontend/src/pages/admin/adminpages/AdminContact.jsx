
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminContact.css";

/* =========================================================
   INITIAL DATA
========================================================= */

const initialData = {
  section: {
    number: "",
    label: "",
  },

  availability: "",

  hero: {
    kicker: "",
    title: {
      line1: "",
      line2: "",
    },
    description: "",
    email: "",
  },

  info: {
    sectionNumber: "",
    title: "",
    description: "",
  },

  form: {
    sectionNumber: "",
    title: "",
  },

  links: [],

  footer: {
    number: "",
    label: "",
    message: "",
    logo: "",
    copy: "",
    role: "",
  },
};

/* =========================================================
   HELPERS
========================================================= */

let nextLinkKey = 0;

const createLinkKey = () => {
  nextLinkKey += 1;
  return `contact-link-${nextLinkKey}`;
};

const normalizeData = (data = {}) => ({
  section: {
    ...initialData.section,
    ...data.section,
  },

  availability: data.availability || "",

  hero: {
    ...initialData.hero,
    ...data.hero,

    title: {
      ...initialData.hero.title,
      ...data.hero?.title,
    },
  },

  info: {
    ...initialData.info,
    ...data.info,
  },

  form: {
    ...initialData.form,
    ...data.form,
  },

  links: Array.isArray(data.links)
    ? data.links.map((link) => ({
        ...link,
        _key: createLinkKey(),
      }))
    : [],

  footer: {
    ...initialData.footer,
    ...data.footer,
  },
});

const formatNumber = (index) =>
  String(index + 1).padStart(2, "0");

/* =========================================================
   URL VALIDATION
========================================================= */

const validLink = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  const url = value.trim();

  if (!url || url.length > 500) {
    return false;
  }

  // Email links
  if (
    /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(url)
  ) {
    return true;
  }

  // Telephone links
  if (
    /^tel:\+?[0-9()\s.-]+$/i.test(url)
  ) {
    return true;
  }

  // Website links
  try {
    const parsed = new URL(url);

    return (
      ["http:", "https:"].includes(
        parsed.protocol
      ) &&
      Boolean(parsed.hostname) &&
      !/\s/.test(url)
    );
  } catch {
    return false;
  }
};

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SectionHeading({
  number,
  title,
  description,
}) {
  return (
    <div className="admin-contact-section-heading">
      <span>{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  maxLength,
  type = "text",
  placeholder,
  full = false,
}) {
  return (
    <label
      className={`admin-contact-field ${
        full ? "full" : ""
      }`}
    >
      <span>{label}</span>

      <input
        type={type}
        value={value ?? ""}
        maxLength={maxLength}
        placeholder={
          placeholder ||
          `Enter ${label.toLowerCase()}`
        }
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="admin-contact-field full">
      <span>{label}</span>

      <textarea
        rows={4}
        value={value ?? ""}
        placeholder={`Enter ${label.toLowerCase()}`}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </label>
  );
}

/* =========================================================
   ADMIN CONTACT COMPONENT
========================================================= */

function AdminContact() {
  const [formData, setFormData] = useState(initialData);

  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     FETCH CONTACT CONTENT
  ======================================================= */

  useEffect(() => {
    let active = true;

    const fetchContact = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/contact");

        if (
          !response.data?.success ||
          !response.data?.data
        ) {
          throw new Error(
            "Contact content unavailable."
          );
        }

        if (active) {
          setFormData(
            normalizeData(response.data.data)
          );

          setLoaded(true);
        }
      } catch (err) {
        if (active) {
          setLoaded(false);

          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load Contact content."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchContact();

    return () => {
      active = false;
    };
  }, []);

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* =======================================================
     UPDATE STANDARD FIELDS
  ======================================================= */

  const updateField = (section, field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,

      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  /* =======================================================
     UPDATE HERO TITLE
  ======================================================= */

  const updateHeroTitle = (field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,

      hero: {
        ...current.hero,

        title: {
          ...current.hero.title,
          [field]: value,
        },
      },
    }));
  };

  /* =======================================================
     UPDATE AVAILABILITY
  ======================================================= */

  const updateAvailability = (value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      availability: value,
    }));
  };

  /* =======================================================
     ADD CONTACT LINK
  ======================================================= */

  const addLink = () => {
    if (formData.links.length >= 30) {
      setError(
        "Maximum 30 contact links allowed."
      );

      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,

      links: [
        ...current.links,
        {
          _key: createLinkKey(),
          label: "",
          url: "",
        },
      ],
    }));
  };

  /* =======================================================
     UPDATE CONTACT LINK
  ======================================================= */

  const updateLink = (index, field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,

      links: current.links.map((link, i) =>
        i === index
          ? {
              ...link,
              [field]: value,
            }
          : link
      ),
    }));
  };

  /* =======================================================
     REMOVE CONTACT LINK
  ======================================================= */

  const removeLink = (index) => {
    const link = formData.links[index];

    const confirmed = window.confirm(
      `Remove "${link?.label || "this link"}" from your Contact page?`
    );

    if (!confirmed) return;

    clearMessages();

    setFormData((current) => ({
      ...current,

      links: current.links.filter(
        (_, i) => i !== index
      ),
    }));
  };

  /* =======================================================
     REORDER CONTACT LINKS
  ======================================================= */

  const moveLink = (index, direction) => {
    clearMessages();

    setFormData((current) => {
      const links = [...current.links];

      const target = index + direction;

      if (
        target < 0 ||
        target >= links.length
      ) {
        return current;
      }

      [links[index], links[target]] = [
        links[target],
        links[index],
      ];

      return {
        ...current,
        links,
      };
    });
  };

  /* =======================================================
     FORM VALIDATION
  ======================================================= */

  const validateForm = () => {
    const requiredFields = [
      ["Section Number", formData.section.number],
      ["Section Label", formData.section.label],
      ["Availability Status", formData.availability],
      ["Hero Kicker", formData.hero.kicker],
      ["Title Line 1", formData.hero.title.line1],
      ["Title Line 2", formData.hero.title.line2],
      ["Hero Description", formData.hero.description],
      ["Primary Email", formData.hero.email],
      [
        "Information Section Number",
        formData.info.sectionNumber,
      ],
      [
        "Information Section Title",
        formData.info.title,
      ],
      [
        "Information Description",
        formData.info.description,
      ],
      [
        "Form Section Number",
        formData.form.sectionNumber,
      ],
      [
        "Form Section Title",
        formData.form.title,
      ],
      ["Footer Number", formData.footer.number],
      ["Footer Label", formData.footer.label],
      ["Footer Message", formData.footer.message],
      ["Footer Logo", formData.footer.logo],
      ["Copyright Text", formData.footer.copy],
      ["Footer Role", formData.footer.role],
    ];

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    for (const [label, value] of requiredFields) {
      if (
        typeof value !== "string" ||
        !value.trim()
      ) {
        return `${label} is required.`;
      }
    }

    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    const email = formData.hero.email.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 255
    ) {
      return "Enter a valid primary email address.";
    }

    /* =====================================================
       CONTACT LINK VALIDATION
    ===================================================== */

    if (formData.links.length > 30) {
      return "Maximum 30 contact links allowed.";
    }

    for (
      const [index, link] of
      formData.links.entries()
    ) {
      const label = link.label?.trim() || "";
      const url = link.url?.trim() || "";

      if (!label) {
        return (
          `Contact Link ${index + 1}: ` +
          "Label is required."
        );
      }

      if (label.length > 100) {
        return (
          `Contact Link ${index + 1}: ` +
          "Label exceeds 100 characters."
        );
      }

      if (!url) {
        return (
          `Contact Link ${index + 1} (${label}): ` +
          "URL is required."
        );
      }

      if (!validLink(url)) {
        return (
          `Contact Link ${index + 1} (${label}): ` +
          `Invalid URL "${url}". ` +
          "Use https://, http://, mailto: or tel:."
        );
      }
    }

    return "";
  };

  /* =======================================================
     BUILD SAVE PAYLOAD
  ======================================================= */

  const buildPayload = () => {
    return {
      section: {
        number: formData.section.number.trim(),
        label: formData.section.label.trim(),
      },

      availability: formData.availability.trim(),

      hero: {
        kicker: formData.hero.kicker.trim(),

        title: {
          line1: formData.hero.title.line1.trim(),
          line2: formData.hero.title.line2.trim(),
        },

        description: formData.hero.description.trim(),
        email: formData.hero.email.trim(),
      },

      info: {
        sectionNumber:
          formData.info.sectionNumber.trim(),

        title: formData.info.title.trim(),

        description:
          formData.info.description.trim(),
      },

      form: {
        sectionNumber:
          formData.form.sectionNumber.trim(),

        title: formData.form.title.trim(),
      },

      links: formData.links.map((link) => ({
        ...(link.id != null
          ? { id: link.id }
          : {}),

        label: link.label.trim(),
        url: link.url.trim(),
      })),

      footer: {
        number: formData.footer.number.trim(),
        label: formData.footer.label.trim(),
        message: formData.footer.message.trim(),
        logo: formData.footer.logo.trim(),
        copy: formData.footer.copy.trim(),
        role: formData.footer.role.trim(),
      },
    };
  };

  /* =======================================================
     SAVE CONTACT PAGE
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (!loaded) {
      setError(
        "Contact content has not loaded."
      );

      return;
    }

    /* =====================================================
       VALIDATE
    ===================================================== */

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      setSuccess("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /* =====================================================
       CHECK ADMIN TOKEN
    ===================================================== */

    const token = sessionStorage.getItem(
      "adminToken"
    );

    if (!token) {
      setError(
        "Admin session expired. Please log in again."
      );

      return;
    }

    /* =====================================================
       SEND UPDATE
    ===================================================== */

    try {
      setSaving(true);
      clearMessages();

      const payload = buildPayload();

      const response = await api.put(
        "/contact",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          "Server did not confirm the update."
        );
      }

      /* ===================================================
         REFRESH CONTACT CONTENT
      =================================================== */

      try {
        const refreshed = await api.get(
          "/contact"
        );

        if (
          refreshed.data?.success &&
          refreshed.data?.data
        ) {
          setFormData(
            normalizeData(refreshed.data.data)
          );
        } else {
          setError(
            "Changes saved, but the latest content could not be refreshed."
          );
        }
      } catch (refreshError) {
        console.error(
          "Contact refresh error:",
          refreshError
        );

        setError(
          "Changes saved, but refreshing the content failed."
        );
      }

      setSuccess(
        "Contact page updated successfully."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Contact update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update Contact page."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="admin-contact-loading">
        Loading Contact content...
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="admin-contact">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <header className="admin-contact-header">
        <div>
          <Link
            to="/admin/dashboard"
            className="admin-contact-back"
          >
            ← Back to Dashboard
          </Link>

          <p className="admin-contact-eyebrow">
            CONTENT MANAGEMENT / 07
          </p>

          <h1>Contact Page Editor</h1>

          <p className="admin-contact-subtitle">
            Manage contact information, social links,
            availability, contact form headings and
            footer content.
          </p>
        </div>

        <Link
          to="/contact"
          target="_blank"
          rel="noreferrer"
          className="admin-contact-preview"
        >
          Preview Contact ↗
        </Link>
      </header>

      {/* ===================================================
          STATUS MESSAGES
      =================================================== */}

      {error && (
        <div
          className="admin-contact-alert error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="admin-contact-alert success"
          role="status"
        >
          {success}
        </div>
      )}

      {/* ===================================================
          EDITOR FORM
      =================================================== */}

      <form
        className="admin-contact-form"
        onSubmit={handleSubmit}
      >

        {/* =================================================
            01 SECTION HEADER
        ================================================= */}

        <section className="admin-contact-panel">
          <SectionHeading
            number="01"
            title="Section Header"
            description="Manage your Contact section identity and availability."
          />

          <div className="admin-contact-fields">
            <Field
              label="Section Number"
              value={formData.section.number}
              maxLength={20}
              onChange={(value) =>
                updateField(
                  "section",
                  "number",
                  value
                )
              }
            />

            <Field
              label="Section Label"
              value={formData.section.label}
              maxLength={100}
              onChange={(value) =>
                updateField(
                  "section",
                  "label",
                  value
                )
              }
            />

            <Field
              label="Availability Status"
              value={formData.availability}
              maxLength={150}
              onChange={updateAvailability}
              full
            />
          </div>
        </section>

        {/* =================================================
            02 CONTACT HERO
        ================================================= */}

        <section className="admin-contact-panel">
          <SectionHeading
            number="02"
            title="Contact Hero"
            description="Edit your main heading, introduction and primary email."
          />

          <div className="admin-contact-fields">
            <Field
              label="Hero Kicker"
              value={formData.hero.kicker}
              maxLength={250}
              onChange={(value) =>
                updateField(
                  "hero",
                  "kicker",
                  value
                )
              }
              full
            />

            <Field
              label="Title Line 1"
              value={formData.hero.title.line1}
              maxLength={100}
              onChange={(value) =>
                updateHeroTitle(
                  "line1",
                  value
                )
              }
            />

            <Field
              label="Title Line 2"
              value={formData.hero.title.line2}
              maxLength={100}
              onChange={(value) =>
                updateHeroTitle(
                  "line2",
                  value
                )
              }
            />

            <Field
              label="Primary Email"
              type="email"
              value={formData.hero.email}
              maxLength={255}
              onChange={(value) =>
                updateField(
                  "hero",
                  "email",
                  value
                )
              }
              full
            />

            <TextField
              label="Hero Description"
              value={formData.hero.description}
              onChange={(value) =>
                updateField(
                  "hero",
                  "description",
                  value
                )
              }
            />
          </div>
        </section>

        {/* =================================================
            03 CONTACT INFORMATION
        ================================================= */}

        <section className="admin-contact-panel">
          <SectionHeading
            number="03"
            title="Contact Information"
            description="Manage the information displayed beside the contact form."
          />

          <div className="admin-contact-fields">
            <Field
              label="Information Section Number"
              value={formData.info.sectionNumber}
              maxLength={20}
              onChange={(value) =>
                updateField(
                  "info",
                  "sectionNumber",
                  value
                )
              }
            />

            <Field
              label="Information Section Title"
              value={formData.info.title}
              maxLength={150}
              onChange={(value) =>
                updateField(
                  "info",
                  "title",
                  value
                )
              }
            />

            <TextField
              label="Information Description"
              value={formData.info.description}
              onChange={(value) =>
                updateField(
                  "info",
                  "description",
                  value
                )
              }
            />
          </div>
        </section>

        {/* =================================================
            04 SOCIAL LINKS
        ================================================= */}

        <section className="admin-contact-panel">
          <SectionHeading
            number="04"
            title="Social & Contact Links"
            description="Add, edit, reorder and remove links displayed on your Contact page."
          />

          <div className="admin-contact-list-heading">
            <div>
              <h3>Contact Links</h3>

              <p>
                {formData.links.length} links
              </p>
            </div>

            <button
              type="button"
              onClick={addLink}
              disabled={
                formData.links.length >= 30
              }
            >
              + Add Link
            </button>
          </div>

          <div className="admin-contact-links-list">
            {formData.links.map(
              (link, index) => (
                <div
                  className="admin-contact-link-item"
                  key={link._key}
                >
                  <div className="admin-contact-link-top">
                    <div>
                      <span>
                        LINK {formatNumber(index)}
                      </span>

                      <h3>
                        {link.label ||
                          "New Contact Link"}
                      </h3>
                    </div>

                    <div className="admin-contact-actions">
                      <button
                        type="button"
                        title="Move up"
                        aria-label="Move link up"
                        disabled={index === 0}
                        onClick={() =>
                          moveLink(index, -1)
                        }
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        title="Move down"
                        aria-label="Move link down"
                        disabled={
                          index ===
                          formData.links.length - 1
                        }
                        onClick={() =>
                          moveLink(index, 1)
                        }
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        title="Remove link"
                        aria-label="Remove link"
                        className="remove"
                        onClick={() =>
                          removeLink(index)
                        }
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="admin-contact-fields">
                    <Field
                      label="Link Label"
                      value={link.label}
                      maxLength={100}
                      onChange={(value) =>
                        updateLink(
                          index,
                          "label",
                          value
                        )
                      }
                    />

                    <Field
                      label="Link URL"
                      value={link.url}
                      maxLength={500}
                      onChange={(value) =>
                        updateLink(
                          index,
                          "url",
                          value
                        )
                      }
                      placeholder="https://example.com/..."
                    />
                  </div>

                  {link.url?.trim() &&
                    !validLink(link.url) && (
                      <p
                        className="admin-contact-note"
                        role="alert"
                      >
                        Invalid URL. Use
                        https://, http://,
                        mailto: or tel:.
                      </p>
                    )}

                  {validLink(link.url) && (
                    <a
                      href={link.url.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-contact-test-link"
                    >
                      Test Link ↗
                    </a>
                  )}
                </div>
              )
            )}

            {formData.links.length === 0 && (
              <p className="admin-contact-empty">
                No contact links added.
              </p>
            )}
          </div>
        </section>

        {/* =================================================
            05 CONTACT FORM
        ================================================= */}

        <section className="admin-contact-panel">
          <SectionHeading
            number="05"
            title="Contact Form"
            description="Manage the public contact form section heading."
          />

          <div className="admin-contact-fields">
            <Field
              label="Form Section Number"
              value={formData.form.sectionNumber}
              maxLength={20}
              onChange={(value) =>
                updateField(
                  "form",
                  "sectionNumber",
                  value
                )
              }
            />

            <Field
              label="Form Section Title"
              value={formData.form.title}
              maxLength={150}
              onChange={(value) =>
                updateField(
                  "form",
                  "title",
                  value
                )
              }
            />
          </div>

          <p className="admin-contact-note">
            Public form submissions continue using
            POST /contact/messages. This editor does
            not modify message submission behavior.
          </p>
        </section>

        {/* =================================================
            06 FOOTER
        ================================================= */}

        <section className="admin-contact-panel">
          <SectionHeading
            number="06"
            title="Contact Footer"
            description="Manage your footer labels, logo and copyright information."
          />

          <div className="admin-contact-fields">
            <Field
              label="Footer Number"
              value={formData.footer.number}
              maxLength={20}
              onChange={(value) =>
                updateField(
                  "footer",
                  "number",
                  value
                )
              }
            />

            <Field
              label="Footer Label"
              value={formData.footer.label}
              maxLength={100}
              onChange={(value) =>
                updateField(
                  "footer",
                  "label",
                  value
                )
              }
            />

            <Field
              label="Footer Message"
              value={formData.footer.message}
              maxLength={150}
              onChange={(value) =>
                updateField(
                  "footer",
                  "message",
                  value
                )
              }
            />

            <Field
              label="Footer Logo"
              value={formData.footer.logo}
              maxLength={50}
              onChange={(value) =>
                updateField(
                  "footer",
                  "logo",
                  value
                )
              }
            />

            <Field
              label="Copyright Text"
              value={formData.footer.copy}
              maxLength={150}
              onChange={(value) =>
                updateField(
                  "footer",
                  "copy",
                  value
                )
              }
            />

            <Field
              label="Footer Role"
              value={formData.footer.role}
              maxLength={100}
              onChange={(value) =>
                updateField(
                  "footer",
                  "role",
                  value
                )
              }
            />
          </div>
        </section>

        {/* =================================================
            SAVE
        ================================================= */}

        <div className="admin-contact-save-bar">
          <p>
            Changes will update your public Contact
            page after saving.
          </p>

          <button
            type="submit"
            disabled={
              saving || !loaded
            }
          >
            {saving
              ? "Saving..."
              : "Save Changes"}

            {!saving && " ↗"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminContact;
