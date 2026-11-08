
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminAbout.css";

const emptyData = {
  section: {
    number: "",
    label: "",
  },
  intro: {
    eyebrow: "",
    title: {
      line1: "",
      line2: "",
    },
  },
  timeline: [],
  bottom: {
    label: "",
    description: "",
  },
};

function AdminEducation() {
  const [formData, setFormData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/education");

        if (!response.data?.success || !response.data?.data) {
          throw new Error("Education content was not returned by the server.");
        }

        const data = response.data.data;

        setFormData({
          ...emptyData,
          section: {
            ...emptyData.section,
            ...data.section,
          },
          intro: {
            ...emptyData.intro,
            ...data.intro,
            title: {
              ...emptyData.intro.title,
              ...data.intro?.title,
            },
          },
          timeline: Array.isArray(data.timeline)
            ? data.timeline.map((item) => ({
                ...item,
                number: item.number ?? "",
              }))
            : [],
          bottom: {
            ...emptyData.bottom,
            ...data.bottom,
          },
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load Education content."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEducation();
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const updateSection = (field, value) => {
    setFormData((current) => ({
      ...current,
      section: {
        ...current.section,
        [field]: value,
      },
    }));
    clearMessages();
  };

  const updateNested = (group, field, value) => {
    setFormData((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
    clearMessages();
  };

  const updateTitle = (field, value) => {
    setFormData((current) => ({
      ...current,
      intro: {
        ...current.intro,
        title: {
          ...current.intro.title,
          [field]: value,
        },
      },
    }));
    clearMessages();
  };

  const updateTimelineItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      timeline: current.timeline.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    clearMessages();
  };

  const addTimelineItem = () => {
    if (formData.timeline.length >= 30) {
      setError("You can add a maximum of 30 education entries.");
      return;
    }

    setFormData((current) => ({
      ...current,
      timeline: [
        ...current.timeline,
        {
          year: "",
          number: String(current.timeline.length + 1).padStart(2, "0"),
          title: "",
          institution: "",
          description: "",
          status: "",
        },
      ],
    }));

    clearMessages();
  };

  const removeTimelineItem = (index) => {
    if (!window.confirm("Remove this education entry?")) return;

    setFormData((current) => ({
      ...current,
      timeline: current.timeline
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          number: String(i + 1).padStart(2, "0"),
        })),
    }));

    clearMessages();
  };

  const moveTimelineItem = (index, direction) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= formData.timeline.length) return;

    setFormData((current) => {
      const items = [...current.timeline];

      [items[index], items[nextIndex]] = [items[nextIndex], items[index]];

      return {
        ...current,
        timeline: items.map((item, i) => ({
          ...item,
          number: String(i + 1).padStart(2, "0"),
        })),
      };
    });

    clearMessages();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      clearMessages();

      const token = sessionStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      const payload = {
        section: formData.section,
        intro: formData.intro,
        timeline: formData.timeline.map(
          ({ year, number, title, institution, description, status }) => ({
            year,
            number,
            title,
            institution,
            description,
            status,
          })
        ),
        bottom: formData.bottom,
      };

      const response = await api.put("/education", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(
        response.data?.message || "Education page content saved successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save Education content."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-about-state">
        <div className="admin-about-loader" />
        <p>Loading Education content...</p>
      </div>
    );
  }

  return (
    <div className="admin-about">
      {/* HEADER */}

      <header className="admin-about-header">
        <div>
          <Link to="/admin/dashboard" className="admin-about-back">
            ← Back to Dashboard
          </Link>

          <p className="admin-about-eyebrow">
            CONTENT MANAGEMENT / 03
          </p>

          <h1>Education Page Editor</h1>

          <p className="admin-about-subtitle">
            Manage your academic journey, education timeline and closing statement.
          </p>
        </div>

        <Link
          to="/education"
          target="_blank"
          rel="noreferrer"
          className="admin-about-preview"
        >
          Preview Education ↗
        </Link>
      </header>

      {/* NOTIFICATIONS */}

      {error && (
        <div className="admin-about-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-about-alert success" role="status">
          {success}
        </div>
      )}

      <form className="admin-about-form" onSubmit={handleSubmit}>
        {/* SECTION INFORMATION */}

        <section className="admin-about-panel">
          <SectionHeading
            number="01"
            title="Section Information"
            description="Manage the Education section label and introduction heading."
          />

          <div className="admin-about-fields">
            <Field
              label="Section Number"
              value={formData.section.number}
              onChange={(value) => updateSection("number", value)}
            />

            <Field
              label="Section Label"
              value={formData.section.label}
              onChange={(value) => updateSection("label", value)}
            />

            <Field
              label="Eyebrow Text"
              value={formData.intro.eyebrow}
              onChange={(value) => updateNested("intro", "eyebrow", value)}
            />

            <Field
              label="Title Line 1"
              value={formData.intro.title.line1}
              onChange={(value) => updateTitle("line1", value)}
            />

            <Field
              label="Title Line 2"
              value={formData.intro.title.line2}
              onChange={(value) => updateTitle("line2", value)}
            />
          </div>
        </section>

        {/* EDUCATION TIMELINE */}

        <section className="admin-about-panel">
          <SectionHeading
            number="02"
            title="Academic Journey"
            description="Manage your education history and timeline entries."
          />

          <div className="admin-about-list-heading">
            <div>
              <h3>Education Timeline</h3>
              <p>Add, edit, remove and reorder your education entries.</p>
            </div>

            <button
              type="button"
              onClick={addTimelineItem}
              disabled={formData.timeline.length >= 30}
            >
              + Add Education
            </button>
          </div>

          <div className="admin-about-repeat-list">
            {formData.timeline.map((item, index) => (
              <div className="admin-about-repeat-item" key={item.id ?? `new-${index}`}>
                <div className="admin-about-repeat-top">
                  <strong>
                    EDUCATION {String(index + 1).padStart(2, "0")}
                  </strong>

                  <div className="admin-about-repeat-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveTimelineItem(index, -1)}
                      aria-label="Move education up"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={index === formData.timeline.length - 1}
                      onClick={() => moveTimelineItem(index, 1)}
                      aria-label="Move education down"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="remove"
                      onClick={() => removeTimelineItem(index)}
                      aria-label="Remove education"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="admin-about-fields">
                  <Field
                    label="Year"
                    value={item.year}
                    placeholder="e.g. 2022 - 2026"
                    onChange={(value) =>
                      updateTimelineItem(index, "year", value)
                    }
                  />

                  <Field
                    label="Entry Number"
                    value={item.number}
                    onChange={(value) =>
                      updateTimelineItem(index, "number", value)
                    }
                  />

                  <Field
                    label="Education Title"
                    value={item.title}
                    onChange={(value) =>
                      updateTimelineItem(index, "title", value)
                    }
                  />

                  <Field
                    label="Institution"
                    value={item.institution}
                    onChange={(value) =>
                      updateTimelineItem(index, "institution", value)
                    }
                  />

                  <Field
                    label="Status"
                    value={item.status}
                    onChange={(value) =>
                      updateTimelineItem(index, "status", value)
                    }
                  />

                  <Field
                    label="Display Order"
                    value={String(index + 1)}
                    readOnly
                  />

                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(value) =>
                      updateTimelineItem(index, "description", value)
                    }
                  />
                </div>
              </div>
            ))}

            {formData.timeline.length === 0 && (
              <p className="admin-about-empty">
                No education entries added yet.
              </p>
            )}
          </div>
        </section>

        {/* BOTTOM STATEMENT */}

        <section className="admin-about-panel">
          <SectionHeading
            number="03"
            title="Closing Statement"
            description="Manage the final statement displayed at the bottom of your Education page."
          />

          <div className="admin-about-fields">
            <Field
              label="Bottom Label"
              value={formData.bottom.label}
              onChange={(value) => updateNested("bottom", "label", value)}
            />

            <TextField
              label="Bottom Description"
              value={formData.bottom.description}
              onChange={(value) =>
                updateNested("bottom", "description", value)
              }
            />
          </div>
        </section>

        {/* SAVE BAR */}

        <div className="admin-about-save-bar">
          <p>Save to update the Education content stored in your database.</p>

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

function Field({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
}) {
  const id = `education-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="admin-about-field">
      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        type="text"
        value={value ?? ""}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </div>
  );
}

function TextField({ label, value, onChange }) {
  const id = `education-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="admin-about-field full">
      <label htmlFor={id}>{label}</label>

      <textarea
        id={id}
        rows={4}
        value={value ?? ""}
        placeholder={`Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default AdminEducation;
