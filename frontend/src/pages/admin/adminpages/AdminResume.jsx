import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminResume.css";

// =========================================================
// DEFAULT DATA
// =========================================================

const initialData = {
  section: {
    number: "",
    label: "",
  },

  hero: {
    kicker: "",
    name: {
      line1: "",
      line2: "",
    },
    description: "",
    availability: "",
  },

  experience: [],
  education: [],
  skills: [],

  resumePdfUrl: "",

  cta: {
    label: "",
    title: {
      line1: "",
      line2: "",
    },
  },
};

const formatNumber = (index) => String(index + 1).padStart(2, "0");

const normalizeData = (data) => ({
  section: {
    ...initialData.section,
    ...data.section,
  },
  hero: {
    ...initialData.hero,
    ...data.hero,
    name: {
      ...initialData.hero.name,
      ...data.hero?.name,
    },
  },
  experience: Array.isArray(data.experience) ? data.experience : [],
  education: Array.isArray(data.education) ? data.education : [],
  skills: Array.isArray(data.skills) ? data.skills : [],
  resumePdfUrl: data.resumePdfUrl || "",
  cta: {
    ...initialData.cta,
    ...data.cta,
    title: {
      ...initialData.cta.title,
      ...data.cta?.title,
    },
  },
});

// =========================================================
// COMPONENT
// =========================================================

function AdminResume() {
  const [formData, setFormData] = useState(initialData);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =======================================================
  // FETCH RESUME
  // =======================================================

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/resume");

        if (!response.data?.success || !response.data?.data) {
          throw new Error("Resume content unavailable.");
        }

        setFormData(normalizeData(response.data.data));
        setLoaded(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load Resume content.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =======================================================
  // UPDATE NESTED CONTENT
  // =======================================================

  const updateSection = (section, field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const updateHeroName = (field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      hero: {
        ...current.hero,
        name: {
          ...current.hero.name,
          [field]: value,
        },
      },
    }));
  };

  const updateCtaTitle = (field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      cta: {
        ...current.cta,
        title: {
          ...current.cta.title,
          [field]: value,
        },
      },
    }));
  };

  // =======================================================
  // EXPERIENCE CRUD
  // =======================================================

  const addExperience = () => {
    if (formData.experience.length >= 30) {
      setError("Maximum 30 experience entries allowed.");
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      experience: [
        ...current.experience,
        {
          year: "",
          role: "",
          type: "",
          description: "",
        },
      ],
    }));
  };

  const updateExperience = (index, field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      experience: current.experience.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeExperience = (index) => {
    if (!window.confirm("Remove this experience from your Resume page?")) {
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      experience: current.experience.filter((_, i) => i !== index),
    }));
  };

  // =======================================================
  // EDUCATION CRUD
  // =======================================================

  const addEducation = () => {
    if (formData.education.length >= 30) {
      setError("Maximum 30 education entries allowed.");
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      education: [
        ...current.education,
        {
          year: "",
          degree: "",
          institution: "",
        },
      ],
    }));
  };

  const updateEducation = (index, field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      education: current.education.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const removeEducation = (index) => {
    if (!window.confirm("Remove this education entry?")) {
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      education: current.education.filter((_, i) => i !== index),
    }));
  };

  // =======================================================
  // SKILLS CRUD
  // =======================================================

  const addSkill = () => {
    if (formData.skills.length >= 100) {
      setError("Maximum 100 skills allowed.");
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      skills: [...current.skills, ""],
    }));
  };

  const updateSkill = (index, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      skills: current.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const removeSkill = (index) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      skills: current.skills.filter((_, i) => i !== index),
    }));
  };

  // =======================================================
  // REORDER
  // =======================================================

  const moveItem = (field, index, direction) => {
    clearMessages();

    setFormData((current) => {
      const items = [...current[field]];
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= items.length) {
        return current;
      }

      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];

      return {
        ...current,
        [field]: items,
      };
    });
  };

  // =======================================================
  // SAVE
  // =======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!loaded) {
      setError("Resume data has not loaded.");
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setError("Admin session expired. Please log in again.");
      return;
    }

    if (
      formData.experience.some(
        (item) =>
          !item.year.trim() ||
          !item.role.trim() ||
          !item.type.trim() ||
          !item.description.trim(),
      ) ||
      formData.education.some(
        (item) =>
          !item.year.trim() || !item.degree.trim() || !item.institution.trim(),
      ) ||
      formData.skills.some((skill) => !skill.trim())
    ) {
      setError("Complete all required fields before saving.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const response = await api.put("/resume", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.success) {
        throw new Error("Server did not confirm the save.");
      }

      // Reload generated database IDs.
      const refreshed = await api.get("/resume");

      if (refreshed.data?.success && refreshed.data?.data) {
        setFormData(normalizeData(refreshed.data.data));
      }

      setSuccess("Resume page updated successfully.");
      // Smooth scroll to top to display the error
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save Resume content.",
      );
      // Smooth scroll to top to display the error
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="admin-resume-loading">Loading Resume content...</div>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="admin-resume">
      <header className="admin-resume-header">
        <div>
          <Link to="/admin/dashboard" className="admin-resume-back">
            ← Back to Dashboard
          </Link>

          <p className="admin-resume-eyebrow">CONTENT MANAGEMENT / 06</p>

          <h1>Resume Page Editor</h1>

          <p className="admin-resume-subtitle">
            Manage your professional experience, education, technical skills and
            resume content.
          </p>
        </div>

        <Link
          to="/resume"
          target="_blank"
          rel="noreferrer"
          className="admin-resume-preview"
        >
          Preview Resume ↗
        </Link>
      </header>

      {error && <div className="admin-resume-alert error">{error}</div>}

      {success && <div className="admin-resume-alert success">{success}</div>}

      <form className="admin-resume-form" onSubmit={handleSubmit}>
        {/* ===================================================
            SECTION HEADER
        =================================================== */}

        <section className="admin-resume-panel">
          <SectionHeading
            number="01"
            title="Section Header"
            description="Manage your Resume section labels."
          />

          <div className="admin-resume-fields">
            <Field
              label="Section Number"
              value={formData.section.number}
              maxLength={20}
              onChange={(value) => updateSection("section", "number", value)}
            />

            <Field
              label="Section Label"
              value={formData.section.label}
              maxLength={100}
              onChange={(value) => updateSection("section", "label", value)}
            />
          </div>
        </section>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="admin-resume-panel">
          <SectionHeading
            number="02"
            title="Resume Hero"
            description="Manage your name, introduction and availability."
          />

          <div className="admin-resume-fields">
            <Field
              label="Hero Kicker"
              value={formData.hero.kicker}
              maxLength={200}
              onChange={(value) => updateSection("hero", "kicker", value)}
            />

            <Field
              label="Name Line 1"
              value={formData.hero.name.line1}
              maxLength={100}
              onChange={(value) => updateHeroName("line1", value)}
            />

            <Field
              label="Name Line 2"
              value={formData.hero.name.line2}
              maxLength={100}
              onChange={(value) => updateHeroName("line2", value)}
            />

            <Field
              label="Availability Status"
              value={formData.hero.availability}
              maxLength={250}
              onChange={(value) => updateSection("hero", "availability", value)}
            />

            <TextField
              label="Hero Description"
              value={formData.hero.description}
              onChange={(value) => updateSection("hero", "description", value)}
            />
          </div>
        </section>

        {/* ===================================================
            EXPERIENCE
        =================================================== */}

        <section className="admin-resume-panel">
          <SectionHeading
            number="03"
            title="Professional Experience"
            description="Add, edit and reorder your experience."
          />

          <ListHeader
            title="Experience Entries"
            count={formData.experience.length}
            onAdd={addExperience}
            addLabel="Add Experience"
          />

          <div className="admin-resume-repeat-list">
            {formData.experience.map((item, index) => (
              <div
                className="admin-resume-repeat-item"
                key={item.id ?? `new-${index}`}
              >
                <ItemHeader
                  number={formatNumber(index)}
                  title={item.role || "New Experience"}
                  onUp={() => moveItem("experience", index, -1)}
                  onDown={() => moveItem("experience", index, 1)}
                  onRemove={() => removeExperience(index)}
                  disableUp={index === 0}
                  disableDown={index === formData.experience.length - 1}
                />

                <div className="admin-resume-fields">
                  <Field
                    label="Year / Duration"
                    value={item.year}
                    maxLength={50}
                    onChange={(value) => updateExperience(index, "year", value)}
                  />

                  <Field
                    label="Role"
                    value={item.role}
                    maxLength={200}
                    onChange={(value) => updateExperience(index, "role", value)}
                  />

                  <Field
                    label="Experience Type"
                    value={item.type}
                    maxLength={200}
                    onChange={(value) => updateExperience(index, "type", value)}
                  />

                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      updateExperience(index, "description", value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            EDUCATION
        =================================================== */}

        <section className="admin-resume-panel">
          <SectionHeading
            number="04"
            title="Education"
            description="Manage academic qualifications."
          />

          <ListHeader
            title="Education Entries"
            count={formData.education.length}
            onAdd={addEducation}
            addLabel="Add Education"
          />

          <div className="admin-resume-repeat-list">
            {formData.education.map((item, index) => (
              <div
                className="admin-resume-repeat-item"
                key={item.id ?? `new-${index}`}
              >
                <ItemHeader
                  number={formatNumber(index)}
                  title={item.degree || "New Education"}
                  onUp={() => moveItem("education", index, -1)}
                  onDown={() => moveItem("education", index, 1)}
                  onRemove={() => removeEducation(index)}
                  disableUp={index === 0}
                  disableDown={index === formData.education.length - 1}
                />

                <div className="admin-resume-fields">
                  <Field
                    label="Year"
                    value={item.year}
                    maxLength={50}
                    onChange={(value) => updateEducation(index, "year", value)}
                  />

                  <Field
                    label="Degree"
                    value={item.degree}
                    maxLength={250}
                    onChange={(value) =>
                      updateEducation(index, "degree", value)
                    }
                  />

                  <Field
                    label="Institution"
                    value={item.institution}
                    maxLength={250}
                    onChange={(value) =>
                      updateEducation(index, "institution", value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            SKILLS
        =================================================== */}

        <section className="admin-resume-panel">
          <SectionHeading
            number="05"
            title="Technical Skills"
            description="Manage skills displayed in your Resume section."
          />

          <ListHeader
            title="Resume Skills"
            count={formData.skills.length}
            onAdd={addSkill}
            addLabel="Add Skill"
          />

          <div className="admin-resume-skills-list">
            {formData.skills.map((skill, index) => (
              <div className="admin-resume-skill-row" key={index}>
                <span>{formatNumber(index)}</span>

                <input
                  type="text"
                  maxLength={150}
                  value={skill}
                  placeholder="Skill name"
                  onChange={(event) => updateSkill(index, event.target.value)}
                />

                <div className="admin-resume-actions">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem("skills", index, -1)}
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={index === formData.skills.length - 1}
                    onClick={() => moveItem("skills", index, 1)}
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    className="remove"
                    onClick={() => removeSkill(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================
            PDF AND CTA
        =================================================== */}

        <section className="admin-resume-panel">
          <SectionHeading
            number="06"
            title="Resume PDF & Call to Action"
            description="Manage the resume download link and closing statement."
          />

          <div className="admin-resume-fields">
            <div className="admin-resume-field full">
              <label htmlFor="resume-pdf-url">Resume PDF URL</label>

              <input
                id="resume-pdf-url"
                type="text"
                maxLength={500}
                value={formData.resumePdfUrl}
                placeholder="/resume.pdf or https://example.com/resume.pdf"
                onChange={(event) => {
                  clearMessages();
                  setFormData((current) => ({
                    ...current,
                    resumePdfUrl: event.target.value,
                  }));
                }}
              />

              {formData.resumePdfUrl && (
                <a
                  href={formData.resumePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-resume-pdf-link"
                >
                  View Current Resume ↗
                </a>
              )}
            </div>

            <Field
              label="CTA Label"
              value={formData.cta.label}
              maxLength={200}
              onChange={(value) => updateSection("cta", "label", value)}
            />

            <Field
              label="CTA Title Line 1"
              value={formData.cta.title.line1}
              maxLength={100}
              onChange={(value) => updateCtaTitle("line1", value)}
            />

            <Field
              label="CTA Title Line 2"
              value={formData.cta.title.line2}
              maxLength={100}
              onChange={(value) => updateCtaTitle("line2", value)}
            />
          </div>
        </section>

        {/* ===================================================
            SAVE
        =================================================== */}

        <div className="admin-resume-save-bar">
          <p>Save to update your Resume content stored in PostgreSQL.</p>

          <button type="submit" disabled={saving || !loaded}>
            {saving ? "Saving..." : "Save Changes"}

            {!saving && " ↗"}
          </button>
        </div>
      </form>
    </div>
  );
}

// =========================================================
// REUSABLE LOCAL COMPONENTS
// =========================================================

function SectionHeading({ number, title, description }) {
  return (
    <div className="admin-resume-section-heading">
      <span>{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, maxLength }) {
  return (
    <label className="admin-resume-field">
      <span>{label}</span>

      <input
        type="text"
        value={value ?? ""}
        maxLength={maxLength}
        placeholder={`Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="admin-resume-field full">
      <span>{label}</span>

      <textarea
        rows={4}
        value={value ?? ""}
        placeholder={`Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ListHeader({ title, count, onAdd, addLabel }) {
  return (
    <div className="admin-resume-list-heading">
      <div>
        <h3>{title}</h3>
        <p>{count} entries</p>
      </div>

      <button type="button" onClick={onAdd}>
        + {addLabel}
      </button>
    </div>
  );
}

function ItemHeader({
  number,
  title,
  onUp,
  onDown,
  onRemove,
  disableUp,
  disableDown,
}) {
  return (
    <div className="admin-resume-repeat-top">
      <div>
        <strong>ENTRY {number}</strong>
        <h3>{title}</h3>
      </div>

      <div className="admin-resume-actions">
        <button
          type="button"
          disabled={disableUp}
          onClick={onUp}
          title="Move up"
        >
          ↑
        </button>

        <button
          type="button"
          disabled={disableDown}
          onClick={onDown}
          title="Move down"
        >
          ↓
        </button>

        <button
          type="button"
          className="remove"
          onClick={onRemove}
          title="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default AdminResume;
