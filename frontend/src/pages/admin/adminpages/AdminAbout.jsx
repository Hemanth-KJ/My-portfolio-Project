
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminAbout.css";

const emptyData = {
  section: { index: "", label: "" },
  intro: {
    eyebrow: "",
    title: { line1: "", line2: "", line3: "" },
  },
  profile: {
    image: "",
    name: "",
    number: "",
    caption: "",
  },
  about: {
    number: "",
    heading: "",
    introduction: "",
    technicalFocus: "",
  },
  link: { text: "", url: "" },
  philosophy: {
    sectionNumber: "",
    sectionLabel: "",
    title: "",
    introduction: "",
    principles: [],
  },
  stack: [],
};

function AdminAbout() {
  const [formData, setFormData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/about");

        if (!response.data?.success || !response.data?.data) {
          throw new Error("About content was not returned by the server.");
        }

        const data = response.data.data;

        setFormData({
          ...emptyData,
          ...data,
          section: { ...emptyData.section, ...data.section },
          intro: {
            ...emptyData.intro,
            ...data.intro,
            title: {
              ...emptyData.intro.title,
              ...data.intro?.title,
            },
          },
          profile: { ...emptyData.profile, ...data.profile },
          about: { ...emptyData.about, ...data.about },
          link: { ...emptyData.link, ...data.link },
          philosophy: {
            ...emptyData.philosophy,
            ...data.philosophy,
            principles: Array.isArray(data.philosophy?.principles)
              ? data.philosophy.principles
              : [],
          },
          stack: Array.isArray(data.stack) ? data.stack : [],
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load About content."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const updateSection = (section, field, value) => {
    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
    setSuccess("");
  };

  const updateNested = (section, parent, field, value) => {
    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [parent]: {
          ...current[section][parent],
          [field]: value,
        },
      },
    }));
    setSuccess("");
  };

  const updatePrinciple = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      philosophy: {
        ...current.philosophy,
        principles: current.philosophy.principles.map((item, i) =>
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
    setSuccess("");
  };

  const addPrinciple = () => {
    if (formData.philosophy.principles.length >= 20) {
      setError("You can add a maximum of 20 principles.");
      return;
    }

    setFormData((current) => ({
      ...current,
      philosophy: {
        ...current.philosophy,
        principles: [
          ...current.philosophy.principles,
          {
            number: String(current.philosophy.principles.length + 1).padStart(2, "0"),
            title: "",
            description: "",
          },
        ],
      },
    }));
    setError("");
    setSuccess("");
  };

  const removePrinciple = (index) => {
    setFormData((current) => ({
      ...current,
      philosophy: {
        ...current.philosophy,
        principles: current.philosophy.principles.filter(
          (_, i) => i !== index
        ),
      },
    }));
    setSuccess("");
  };

  const movePrinciple = (index, direction) => {
    const nextIndex = index + direction;
    const items = [...formData.philosophy.principles];

    if (nextIndex < 0 || nextIndex >= items.length) return;

    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];

    setFormData((current) => ({
      ...current,
      philosophy: {
        ...current.philosophy,
        principles: items,
      },
    }));
    setSuccess("");
  };

  const updateTechnology = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      stack: current.stack.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    setSuccess("");
  };

  const addTechnology = () => {
    if (formData.stack.length >= 30) {
      setError("You can add a maximum of 30 technologies.");
      return;
    }

    setFormData((current) => ({
      ...current,
      stack: [
        ...current.stack,
        {
          name: "",
          category: "",
        },
      ],
    }));
    setError("");
    setSuccess("");
  };

  const removeTechnology = (index) => {
    setFormData((current) => ({
      ...current,
      stack: current.stack.filter((_, i) => i !== index),
    }));
    setSuccess("");
  };

  const moveTechnology = (index, direction) => {
    const nextIndex = index + direction;
    const items = [...formData.stack];

    if (nextIndex < 0 || nextIndex >= items.length) return;

    [items[index], items[nextIndex]] = [items[nextIndex], items[index]];

    setFormData((current) => ({ ...current, stack: items }));
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = sessionStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      const payload = {
        ...formData,
        philosophy: {
          ...formData.philosophy,
          principles: formData.philosophy.principles.map(
            ({ number, title, description }) => ({
              number,
              title,
              description,
            })
          ),
        },
        stack: formData.stack.map(({ name, category }) => ({
          name,
          category,
        })),
      };

      await api.put("/about", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("About page content saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save About content."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-about-state">
        <div className="admin-about-loader" />
        <p>Loading About content...</p>
      </div>
    );
  }

  return (
    <div className="admin-about">
      <header className="admin-about-header">
        <div>
          <Link to="/admin/dashboard" className="admin-about-back">
            ← Back to Dashboard
          </Link>
          <p className="admin-about-eyebrow">CONTENT MANAGEMENT / 02</p>
          <h1>About Page Editor</h1>
          <p className="admin-about-subtitle">
            Manage your profile, biography, philosophy and technology stack.
          </p>
        </div>

        <Link
          to="/about"
          target="_blank"
          rel="noreferrer"
          className="admin-about-preview"
        >
          Preview About ↗
        </Link>
      </header>

      {error && <div className="admin-about-alert error" role="alert">{error}</div>}
      {success && <div className="admin-about-alert success" role="status">{success}</div>}

      <form className="admin-about-form" onSubmit={handleSubmit}>
        <section className="admin-about-panel">
          <SectionHeading number="01" title="Section Information" description="Section labels and introduction heading." />

          <div className="admin-about-fields">
            <Field label="Section Index" value={formData.section.index} onChange={(v) => updateSection("section", "index", v)} />
            <Field label="Section Label" value={formData.section.label} onChange={(v) => updateSection("section", "label", v)} />
            <Field label="Eyebrow Text" value={formData.intro.eyebrow} onChange={(v) => updateSection("intro", "eyebrow", v)} />
            <Field label="Title Line 1" value={formData.intro.title.line1} onChange={(v) => updateNested("intro", "title", "line1", v)} />
            <Field label="Title Line 2" value={formData.intro.title.line2} onChange={(v) => updateNested("intro", "title", "line2", v)} />
            <Field label="Title Line 3" value={formData.intro.title.line3} onChange={(v) => updateNested("intro", "title", "line3", v)} />
          </div>
        </section>

        <section className="admin-about-panel">
          <SectionHeading number="02" title="Profile Information" description="Your profile image, name and caption." />

          <div className="admin-about-fields">
            <Field label="Profile Name" value={formData.profile.name} onChange={(v) => updateSection("profile", "name", v)} />
            <Field label="Profile Number" value={formData.profile.number} onChange={(v) => updateSection("profile", "number", v)} />
            <Field label="Profile Caption" value={formData.profile.caption} onChange={(v) => updateSection("profile", "caption", v)} />
            <Field label="Profile Image URL / Path" value={formData.profile.image} onChange={(v) => updateSection("profile", "image", v)} />
          </div>

          {formData.profile.image && (
            <div className="admin-about-image-preview">
              <p>Profile image preview</p>
              <img
                src={formData.profile.image}
                alt="Profile preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </section>

        <section className="admin-about-panel">
          <SectionHeading number="03" title="About Description" description="Your biography and professional introduction." />

          <div className="admin-about-fields">
            <Field label="Copy Number" value={formData.about.number} onChange={(v) => updateSection("about", "number", v)} />
            <Field label="Copy Heading" value={formData.about.heading} onChange={(v) => updateSection("about", "heading", v)} />
            <TextField label="Introduction" value={formData.about.introduction} onChange={(v) => updateSection("about", "introduction", v)} />
            <TextField label="Technical Focus" value={formData.about.technicalFocus} onChange={(v) => updateSection("about", "technicalFocus", v)} />
          </div>

          <div className="admin-about-subsection">
            <h3>About Link</h3>
            <div className="admin-about-fields">
              <Field label="Link Text" value={formData.link.text} onChange={(v) => updateSection("link", "text", v)} />
              <Field label="Link URL" value={formData.link.url} onChange={(v) => updateSection("link", "url", v)} />
            </div>
          </div>
        </section>

        <section className="admin-about-panel">
          <SectionHeading number="04" title="Engineering Philosophy" description="Manage your engineering philosophy and principles." />

          <div className="admin-about-fields">
            <Field label="Section Number" value={formData.philosophy.sectionNumber} onChange={(v) => updateSection("philosophy", "sectionNumber", v)} />
            <Field label="Section Label" value={formData.philosophy.sectionLabel} onChange={(v) => updateSection("philosophy", "sectionLabel", v)} />
            <Field label="Philosophy Title" value={formData.philosophy.title} onChange={(v) => updateSection("philosophy", "title", v)} />
            <TextField label="Philosophy Introduction" value={formData.philosophy.introduction} onChange={(v) => updateSection("philosophy", "introduction", v)} />
          </div>

          <div className="admin-about-list-heading">
            <div>
              <h3>Engineering Principles</h3>
              <p>Add, edit, remove and reorder principles.</p>
            </div>
            <button type="button" onClick={addPrinciple}>+ Add Principle</button>
          </div>

          <div className="admin-about-repeat-list">
            {formData.philosophy.principles.map((item, index) => (
              <div className="admin-about-repeat-item" key={index}>
                <div className="admin-about-repeat-top">
                  <strong>PRINCIPLE {String(index + 1).padStart(2, "0")}</strong>
                  <div className="admin-about-repeat-actions">
                    <button type="button" disabled={index === 0} onClick={() => movePrinciple(index, -1)}>↑</button>
                    <button type="button" disabled={index === formData.philosophy.principles.length - 1} onClick={() => movePrinciple(index, 1)}>↓</button>
                    <button type="button" className="remove" onClick={() => removePrinciple(index)}>×</button>
                  </div>
                </div>
                <div className="admin-about-fields">
                  <Field label="Principle Number" value={item.number} onChange={(v) => updatePrinciple(index, "number", v)} />
                  <Field label="Principle Title" value={item.title} onChange={(v) => updatePrinciple(index, "title", v)} />
                  <TextField label="Principle Description" value={item.description} onChange={(v) => updatePrinciple(index, "description", v)} />
                </div>
              </div>
            ))}
            {formData.philosophy.principles.length === 0 && (
              <p className="admin-about-empty">No principles added yet.</p>
            )}
          </div>
        </section>

        <section className="admin-about-panel">
          <SectionHeading number="05" title="Technology Stack" description="Manage the technologies displayed on your About page." />

          <div className="admin-about-list-heading">
            <div>
              <h3>Technologies</h3>
              <p>Set each technology name and its category.</p>
            </div>
            <button type="button" onClick={addTechnology}>+ Add Technology</button>
          </div>

          <div className="admin-about-repeat-list">
            {formData.stack.map((item, index) => (
              <div className="admin-about-stack-item" key={index}>
                <span className="admin-about-stack-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="admin-about-stack-fields">
                  <Field label="Technology Name" value={item.name} onChange={(v) => updateTechnology(index, "name", v)} />
                  <Field label="Category" value={item.category || ""} onChange={(v) => updateTechnology(index, "category", v)} />
                </div>
                <div className="admin-about-repeat-actions">
                  <button type="button" disabled={index === 0} onClick={() => moveTechnology(index, -1)}>↑</button>
                  <button type="button" disabled={index === formData.stack.length - 1} onClick={() => moveTechnology(index, 1)}>↓</button>
                  <button type="button" className="remove" onClick={() => removeTechnology(index)}>×</button>
                </div>
              </div>
            ))}
            {formData.stack.length === 0 && (
              <p className="admin-about-empty">No technologies added yet.</p>
            )}
          </div>
        </section>

        <div className="admin-about-save-bar">
          <p>Save to update the content stored in your database.</p>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"} {!saving && "↗"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="admin-about-section-heading">
      <span>{number}</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  const id = `about-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="admin-about-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value ?? ""}
        placeholder={String(value ?? "") || `Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function TextField({ label, value, onChange }) {
  const id = `about-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="admin-about-field full">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={4}
        value={value ?? ""}
        placeholder={String(value ?? "") || `Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default AdminAbout;
