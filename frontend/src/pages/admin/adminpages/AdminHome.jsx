
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminHome.css";

const emptyHome = {
  topLabel: "",
  sectionNumber: "",
  totalSections: 7,
  portfolioYear: new Date().getFullYear(),
  indexNumber: "",
  indexLabel: "",
  eyebrow: "",
  title: {
    line1: "",
    line2: "",
    line3: "",
  },
  description: "",
  buttons: {
    primary: { text: "", link: "" },
    secondary: { text: "", link: "" },
  },
  technologies: [],
  visual: {
    number: "",
    labelLine1: "",
    labelLine2: "",
    buildYear: new Date().getFullYear(),
    status: "",
  },
  heroImage: "",
};

function normalizeHome(data) {
  return {
    ...emptyHome,
    ...data,
    title: {
      ...emptyHome.title,
      ...(data.title || {}),
    },
    buttons: {
      primary: {
        ...emptyHome.buttons.primary,
        ...(data.buttons?.primary || {}),
      },
      secondary: {
        ...emptyHome.buttons.secondary,
        ...(data.buttons?.secondary || {}),
      },
    },
    visual: {
      ...emptyHome.visual,
      ...(data.visual || {}),
    },
    technologies: Array.isArray(data.technologies)
      ? data.technologies.map((item) =>
          typeof item === "string" ? item : item.technologyName
        )
      : [],
    heroImage: data.heroImage || "",
  };
}

function AdminHome() {
  const [formData, setFormData] = useState(emptyHome);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newTechnology, setNewTechnology] = useState("");

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/home");
        const data = response.data?.data;

        if (!data) {
          throw new Error("Home content was not returned by the server.");
        }

        setFormData(normalizeHome(data));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load Home content."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
    setSuccess("");
  };

  const updateNestedField = (section, field, value) => {
    setFormData((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
    setSuccess("");
  };

  const updateButton = (button, field, value) => {
    setFormData((current) => ({
      ...current,
      buttons: {
        ...current.buttons,
        [button]: {
          ...current.buttons[button],
          [field]: value,
        },
      },
    }));
    setSuccess("");
  };

  const addTechnology = () => {
    const technology = newTechnology.trim();

    if (!technology) return;

    const alreadyExists = formData.technologies.some(
      (item) => item.toLowerCase() === technology.toLowerCase()
    );

    if (alreadyExists) {
      setError("This technology is already in the list.");
      return;
    }

    if (formData.technologies.length >= 20) {
      setError("You can add a maximum of 20 technologies.");
      return;
    }

    setFormData((current) => ({
      ...current,
      technologies: [...current.technologies, technology],
    }));

    setNewTechnology("");
    setError("");
    setSuccess("");
  };

  const removeTechnology = (index) => {
    setFormData((current) => ({
      ...current,
      technologies: current.technologies.filter(
        (_, itemIndex) => itemIndex !== index
      ),
    }));
    setSuccess("");
  };

  const moveTechnology = (index, direction) => {
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex >= formData.technologies.length) return;

    setFormData((current) => {
      const technologies = [...current.technologies];
      [technologies[index], technologies[newIndex]] = [
        technologies[newIndex],
        technologies[index],
      ];

      return { ...current, technologies };
    });

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

      await api.put("/home", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Home page content saved successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save Home content."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-home-state">
        <div className="admin-home-loader" />
        <p>Loading Home content...</p>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <header className="admin-home-header">
        <div>
          <Link to="/admin/dashboard" className="admin-home-back">
            <span aria-hidden="true">←</span> Back to Dashboard
          </Link>
          <p className="admin-home-eyebrow">CONTENT MANAGEMENT / 01</p>
          <h1>Home Page Editor</h1>
          <p className="admin-home-subtitle">
            Manage the content displayed on your portfolio homepage.
          </p>
        </div>

        <Link
          to="/home"
          target="_blank"
          rel="noreferrer"
          className="admin-home-preview"
        >
          Preview Home <span aria-hidden="true">↗</span>
        </Link>
      </header>

      {error && (
        <div className="admin-home-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-home-alert success" role="status">
          {success}
        </div>
      )}

      <form className="admin-home-form" onSubmit={handleSubmit}>
        <section className="admin-home-panel">
          <div className="admin-home-section-heading">
            <span>01</span>
            <div>
              <h2>Section Information</h2>
              <p>Homepage labels and section details.</p>
            </div>
          </div>

          <div className="admin-home-fields">
            <Field
              label="Top Label"
              value={formData.topLabel}
              onChange={(value) => updateField("topLabel", value)}
            />
            <Field
              label="Section Number"
              value={formData.sectionNumber}
              onChange={(value) => updateField("sectionNumber", value)}
            />
            <Field
              label="Total Sections"
              type="number"
              value={formData.totalSections}
              onChange={(value) =>
                updateField("totalSections", Number(value))
              }
            />
            <Field
              label="Portfolio Year"
              type="number"
              value={formData.portfolioYear}
              onChange={(value) =>
                updateField("portfolioYear", Number(value))
              }
            />
            <Field
              label="Index Number"
              value={formData.indexNumber}
              onChange={(value) => updateField("indexNumber", value)}
            />
            <Field
              label="Index Label"
              value={formData.indexLabel}
              onChange={(value) => updateField("indexLabel", value)}
            />
            <Field
              label="Eyebrow Text"
              value={formData.eyebrow}
              onChange={(value) => updateField("eyebrow", value)}
            />
          </div>
        </section>

        <section className="admin-home-panel">
          <div className="admin-home-section-heading">
            <span>02</span>
            <div>
              <h2>Hero Content</h2>
              <p>Main heading and introduction.</p>
            </div>
          </div>

          <div className="admin-home-fields">
            <Field
              label="Title Line 1"
              value={formData.title.line1}
              onChange={(value) =>
                updateNestedField("title", "line1", value)
              }
            />
            <Field
              label="Title Line 2"
              value={formData.title.line2}
              onChange={(value) =>
                updateNestedField("title", "line2", value)
              }
            />
            <Field
              label="Title Line 3"
              value={formData.title.line3}
              onChange={(value) =>
                updateNestedField("title", "line3", value)
              }
            />
            <div className="admin-home-field full">
              <label htmlFor="home-description">Description</label>
              <textarea
                id="home-description"
                value={formData.description}
                placeholder={formData.description || "Enter homepage description"}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                rows={4}
              />
            </div>
          </div>
        </section>

        <section className="admin-home-panel">
          <div className="admin-home-section-heading">
            <span>03</span>
            <div>
              <h2>Action Buttons</h2>
              <p>Configure the two buttons shown on the homepage.</p>
            </div>
          </div>

          <div className="admin-home-subpanel">
            <h3>Primary Button</h3>
            <div className="admin-home-fields">
              <Field
                label="Button Text"
                value={formData.buttons.primary.text}
                onChange={(value) =>
                  updateButton("primary", "text", value)
                }
              />
              <Field
                label="Button Link"
                value={formData.buttons.primary.link}
                onChange={(value) =>
                  updateButton("primary", "link", value)
                }
              />
            </div>
          </div>

          <div className="admin-home-subpanel">
            <h3>Secondary Button</h3>
            <div className="admin-home-fields">
              <Field
                label="Button Text"
                value={formData.buttons.secondary.text}
                onChange={(value) =>
                  updateButton("secondary", "text", value)
                }
              />
              <Field
                label="Button Link"
                value={formData.buttons.secondary.link}
                onChange={(value) =>
                  updateButton("secondary", "link", value)
                }
              />
            </div>
          </div>
        </section>

        <section className="admin-home-panel">
          <div className="admin-home-section-heading">
            <span>04</span>
            <div>
              <h2>Technologies</h2>
              <p>Add, remove, and change the display order.</p>
            </div>
          </div>

          <div className="admin-home-add-tech">
            <input
              type="text"
              value={newTechnology}
              placeholder="Enter a technology, e.g. React"
              onChange={(event) => setNewTechnology(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTechnology();
                }
              }}
            />
            <button type="button" onClick={addTechnology}>
              Add Technology +
            </button>
          </div>

          <div className="admin-home-tech-list">
            {formData.technologies.length === 0 ? (
              <p className="admin-home-empty">No technologies added yet.</p>
            ) : (
              formData.technologies.map((technology, index) => (
                <div className="admin-home-tech-item" key={`${technology}-${index}`}>
                  <span className="admin-home-tech-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong>{technology}</strong>
                  <div className="admin-home-tech-actions">
                    <button
                      type="button"
                      aria-label={`Move ${technology} up`}
                      disabled={index === 0}
                      onClick={() => moveTechnology(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${technology} down`}
                      disabled={index === formData.technologies.length - 1}
                      onClick={() => moveTechnology(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      className="remove"
                      aria-label={`Remove ${technology}`}
                      onClick={() => removeTechnology(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-home-panel">
          <div className="admin-home-section-heading">
            <span>05</span>
            <div>
              <h2>Visual Information</h2>
              <p>Text displayed around the hero image.</p>
            </div>
          </div>

          <div className="admin-home-fields">
            <Field
              label="Visual Number"
              value={formData.visual.number}
              onChange={(value) =>
                updateNestedField("visual", "number", value)
              }
            />
            <Field
              label="Visual Label Line 1"
              value={formData.visual.labelLine1}
              onChange={(value) =>
                updateNestedField("visual", "labelLine1", value)
              }
            />
            <Field
              label="Visual Label Line 2"
              value={formData.visual.labelLine2}
              onChange={(value) =>
                updateNestedField("visual", "labelLine2", value)
              }
            />
            <Field
              label="Build Year"
              type="number"
              value={formData.visual.buildYear}
              onChange={(value) =>
                updateNestedField("visual", "buildYear", Number(value))
              }
            />
            <Field
              label="Status"
              value={formData.visual.status}
              onChange={(value) =>
                updateNestedField("visual", "status", value)
              }
            />
            <Field
              label="Hero Image URL / Path"
              value={formData.heroImage}
              onChange={(value) => updateField("heroImage", value)}
            />
          </div>

          {formData.heroImage && (
            <div className="admin-home-image-preview">
              <p>Current image preview</p>
              <img
                src={formData.heroImage}
                alt="Homepage hero preview"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </section>

        <div className="admin-home-save-bar">
          <p>Changes are applied to the public Home page after saving.</p>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
            {!saving && <span aria-hidden="true"> ↗</span>}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  const id = `home-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="admin-home-field">
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

export default AdminHome;
