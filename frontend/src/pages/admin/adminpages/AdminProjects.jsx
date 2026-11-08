import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminProjects.css";

const emptyData = {
  section: {
    number: "",
    label: "",
    headerRight: "",
  },
  intro: {
    kicker: "",
    title: {
      line1: "",
      line2: "",
    },
    description: "",
  },
  projects: [],
  bottom: {
    projectCount: "",
    projectLabel: "",
    focusValue: "",
    focusLabel: "",
    architectureValue: "",
    architectureLabel: "",
  },
};

const numberLabel = (index) => String(index + 1).padStart(2, "0");

const normalizeData = (data) => ({
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
  projects: Array.isArray(data.projects)
    ? data.projects.map((project) => ({
        ...project,
        technologies: Array.isArray(project.technologies)
          ? project.technologies
          : [],
        highlights: Array.isArray(project.highlights) ? project.highlights : [],
      }))
    : [],
  bottom: {
    ...emptyData.bottom,
    ...data.bottom,
  },
});

function AdminProjects() {
  const [formData, setFormData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/projects");

        if (!response.data?.success || !response.data?.data) {
          throw new Error("Projects content was not returned by the server.");
        }

        setFormData(normalizeData(response.data.data));
        setLoaded(true);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load Projects content.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // =========================================================
  // PAGE CONTENT
  // =========================================================

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

  const updateTitle = (field, value) => {
    clearMessages();

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
  };

  // =========================================================
  // PROJECT CRUD
  // =========================================================

  const updateProject = (index, field, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: current.projects.map((project, i) =>
        i === index ? { ...project, [field]: value } : project,
      ),
    }));
  };

  const addProject = () => {
    if (formData.projects.length >= 30) {
      setError("You can add a maximum of 30 projects.");
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: [
        ...current.projects,
        {
          number: numberLabel(current.projects.length),
          category: "",
          title: "",
          description: "",
          technologies: [],
          highlights: [],
          github: "",
          live: "",
          visualStatus: "SYSTEM / ACTIVE",
          visualYear: String(new Date().getFullYear()),
        },
      ],
    }));
  };

  const removeProject = (index) => {
    if (!window.confirm("Remove this project from your public portfolio?")) {
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: current.projects.filter((_, i) => i !== index),
    }));
  };

  const moveProject = (index, direction) => {
    clearMessages();

    setFormData((current) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= current.projects.length) {
        return current;
      }

      const projects = [...current.projects];

      [projects[index], projects[nextIndex]] = [
        projects[nextIndex],
        projects[index],
      ];

      return { ...current, projects };
    });
  };

  // =========================================================
  // TECHNOLOGIES AND HIGHLIGHTS
  // =========================================================

  const updateItem = (projectIndex, field, itemIndex, value) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: current.projects.map((project, index) => {
        if (index !== projectIndex) return project;

        return {
          ...project,
          [field]: project[field].map((item, i) =>
            i === itemIndex ? value : item,
          ),
        };
      }),
    }));
  };

  const addItem = (projectIndex, field) => {
    const project = formData.projects[projectIndex];

    if (project[field].length >= 50) {
      setError(`Maximum 50 ${field} per project.`);
      return;
    }

    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: current.projects.map((project, index) =>
        index === projectIndex
          ? {
              ...project,
              [field]: [...project[field], ""],
            }
          : project,
      ),
    }));
  };

  const removeItem = (projectIndex, field, itemIndex) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: current.projects.map((project, index) =>
        index === projectIndex
          ? {
              ...project,
              [field]: project[field].filter((_, i) => i !== itemIndex),
            }
          : project,
      ),
    }));
  };

  const moveItem = (projectIndex, field, itemIndex, direction) => {
    clearMessages();

    setFormData((current) => ({
      ...current,
      projects: current.projects.map((project, index) => {
        if (index !== projectIndex) return project;

        const items = [...project[field]];
        const nextIndex = itemIndex + direction;

        if (nextIndex < 0 || nextIndex >= items.length) {
          return project;
        }

        [items[itemIndex], items[nextIndex]] = [
          items[nextIndex],
          items[itemIndex],
        ];

        return {
          ...project,
          [field]: items,
        };
      }),
    }));
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!loaded) {
      setError("Projects content has not loaded successfully.");
      return;
    }

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setError("Your admin session has expired. Please log in again.");
      return;
    }

    if (
      formData.projects.some(
        (project) =>
          !project.number.trim() ||
          !project.category.trim() ||
          !project.title.trim() ||
          !project.description.trim() ||
          !project.visualStatus.trim() ||
          !project.visualYear.trim() ||
          project.technologies.some((item) => !item.trim()) ||
          project.highlights.some((item) => !item.trim()),
      )
    ) {
      setError(
        "Complete all required project fields and remove empty technologies or highlights.",
      );
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const response = await api.put("/projects", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data?.success) {
        throw new Error("Server did not confirm the save.");
      }

      // Reload database-generated IDs after adding projects.
      const refreshed = await api.get("/projects");

      if (refreshed.data?.success && refreshed.data?.data) {
        setFormData(normalizeData(refreshed.data.data));
      }

      setSuccess("Projects page content saved successfully.");

      // Smooth scroll to top to display the error
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save Projects content.",
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

  if (loading) {
    return (
      <div className="admin-projects-state">
        <div className="admin-projects-loader" />
        <p>Loading Projects content...</p>
      </div>
    );
  }

  return (
    <div className="admin-projects">
      <header className="admin-projects-header">
        <div>
          <Link to="/admin/dashboard" className="admin-projects-back">
            ← Back to Dashboard
          </Link>

          <p className="admin-projects-eyebrow">CONTENT MANAGEMENT / 05</p>

          <h1>Projects Page Editor</h1>

          <p className="admin-projects-subtitle">
            Manage your projects, technologies, engineering highlights and
            portfolio statistics.
          </p>
        </div>

        <Link
          to="/projects"
          target="_blank"
          rel="noreferrer"
          className="admin-projects-preview"
        >
          Preview Projects ↗
        </Link>
      </header>

      {error && (
        <div className="admin-projects-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-projects-alert success" role="status">
          {success}
        </div>
      )}

      <form className="admin-projects-form" onSubmit={handleSubmit}>
        {/* ===================================================
            SECTION INFORMATION
        =================================================== */}

        <section className="admin-projects-panel">
          <SectionHeading
            number="01"
            title="Section Information"
            description="Section labels and header information."
          />

          <div className="admin-projects-fields">
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

            <Field
              label="Header Right"
              value={formData.section.headerRight}
              maxLength={100}
              onChange={(value) =>
                updateSection("section", "headerRight", value)
              }
            />
          </div>
        </section>

        {/* ===================================================
            INTRODUCTION
        =================================================== */}

        <section className="admin-projects-panel">
          <SectionHeading
            number="02"
            title="Projects Introduction"
            description="Manage the main heading and introduction."
          />

          <div className="admin-projects-fields">
            <Field
              label="Kicker Text"
              value={formData.intro.kicker}
              maxLength={200}
              onChange={(value) => updateSection("intro", "kicker", value)}
            />

            <Field
              label="Title Line 1"
              value={formData.intro.title.line1}
              maxLength={150}
              onChange={(value) => updateTitle("line1", value)}
            />

            <Field
              label="Title Line 2"
              value={formData.intro.title.line2}
              maxLength={150}
              onChange={(value) => updateTitle("line2", value)}
            />

            <TextField
              label="Introduction Description"
              value={formData.intro.description}
              onChange={(value) => updateSection("intro", "description", value)}
            />
          </div>
        </section>

        {/* ===================================================
            PROJECTS
        =================================================== */}

        <section className="admin-projects-panel">
          <SectionHeading
            number="03"
            title="Portfolio Projects"
            description="Add, edit, remove and reorder your projects."
          />

          <div className="admin-projects-list-heading">
            <div>
              <h3>Projects</h3>
              <p>Manage projects displayed on your public page.</p>
            </div>

            <button
              type="button"
              onClick={addProject}
              disabled={formData.projects.length >= 30}
            >
              + Add Project
            </button>
          </div>

          <div className="admin-projects-repeat-list">
            {formData.projects.map((project, projectIndex) => (
              <article
                className="admin-projects-repeat-item"
                key={project.id ?? `new-${projectIndex}`}
              >
                <div className="admin-projects-repeat-top">
                  <div>
                    <strong>PROJECT {numberLabel(projectIndex)}</strong>
                    <h3>{project.title || "New Project"}</h3>
                  </div>

                  <div className="admin-projects-repeat-actions">
                    <button
                      type="button"
                      disabled={projectIndex === 0}
                      onClick={() => moveProject(projectIndex, -1)}
                      title="Move project up"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={projectIndex === formData.projects.length - 1}
                      onClick={() => moveProject(projectIndex, 1)}
                      title="Move project down"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="remove"
                      onClick={() => removeProject(projectIndex)}
                      title="Remove project"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <div className="admin-projects-fields">
                  <Field
                    label="Project Number"
                    value={project.number}
                    maxLength={20}
                    onChange={(value) =>
                      updateProject(projectIndex, "number", value)
                    }
                  />

                  <Field
                    label="Project Category"
                    value={project.category}
                    maxLength={150}
                    onChange={(value) =>
                      updateProject(projectIndex, "category", value)
                    }
                  />

                  <TextField
                    label="Project Title"
                    value={project.title}
                    rows={2}
                    maxLength={250}
                    onChange={(value) =>
                      updateProject(projectIndex, "title", value)
                    }
                    hint="Use a new line to split the title on the public page."
                  />

                  <TextField
                    label="Project Description"
                    value={project.description}
                    onChange={(value) =>
                      updateProject(projectIndex, "description", value)
                    }
                  />

                  <Field
                    label="GitHub URL"
                    value={project.github}
                    maxLength={500}
                    onChange={(value) =>
                      updateProject(projectIndex, "github", value)
                    }
                  />

                  <Field
                    label="Live Demo URL"
                    value={project.live}
                    maxLength={500}
                    onChange={(value) =>
                      updateProject(projectIndex, "live", value)
                    }
                  />

                  <Field
                    label="Visual Status"
                    value={project.visualStatus}
                    maxLength={100}
                    onChange={(value) =>
                      updateProject(projectIndex, "visualStatus", value)
                    }
                  />

                  <Field
                    label="Visual Year"
                    value={project.visualYear}
                    maxLength={20}
                    onChange={(value) =>
                      updateProject(projectIndex, "visualYear", value)
                    }
                  />
                </div>

                <ProjectItemsEditor
                  title="Technologies"
                  description="Technologies shown as badges."
                  items={project.technologies}
                  onAdd={() => addItem(projectIndex, "technologies")}
                  onChange={(index, value) =>
                    updateItem(projectIndex, "technologies", index, value)
                  }
                  onRemove={(index) =>
                    removeItem(projectIndex, "technologies", index)
                  }
                  onMove={(index, direction) =>
                    moveItem(projectIndex, "technologies", index, direction)
                  }
                />

                <ProjectItemsEditor
                  title="Engineering Highlights"
                  description="Technical achievements and architecture decisions."
                  items={project.highlights}
                  onAdd={() => addItem(projectIndex, "highlights")}
                  onChange={(index, value) =>
                    updateItem(projectIndex, "highlights", index, value)
                  }
                  onRemove={(index) =>
                    removeItem(projectIndex, "highlights", index)
                  }
                  onMove={(index, direction) =>
                    moveItem(projectIndex, "highlights", index, direction)
                  }
                  multiline
                />
              </article>
            ))}

            {formData.projects.length === 0 && (
              <p className="admin-projects-empty">No projects added yet.</p>
            )}
          </div>
        </section>

        {/* ===================================================
            BOTTOM STATISTICS
        =================================================== */}

        <section className="admin-projects-panel">
          <SectionHeading
            number="04"
            title="Bottom Statistics"
            description="Manage the three statistics displayed below your projects."
          />

          <div className="admin-projects-fields">
            <Field
              label="Project Count"
              value={formData.bottom.projectCount}
              maxLength={20}
              onChange={(value) =>
                updateSection("bottom", "projectCount", value)
              }
            />

            <Field
              label="Project Count Label"
              value={formData.bottom.projectLabel}
              maxLength={100}
              onChange={(value) =>
                updateSection("bottom", "projectLabel", value)
              }
            />

            <Field
              label="Engineering Focus Value"
              value={formData.bottom.focusValue}
              maxLength={100}
              onChange={(value) => updateSection("bottom", "focusValue", value)}
            />

            <Field
              label="Engineering Focus Label"
              value={formData.bottom.focusLabel}
              maxLength={100}
              onChange={(value) => updateSection("bottom", "focusLabel", value)}
            />

            <Field
              label="Architecture Value"
              value={formData.bottom.architectureValue}
              maxLength={100}
              onChange={(value) =>
                updateSection("bottom", "architectureValue", value)
              }
            />

            <Field
              label="Architecture Label"
              value={formData.bottom.architectureLabel}
              maxLength={100}
              onChange={(value) =>
                updateSection("bottom", "architectureLabel", value)
              }
            />
          </div>
        </section>

        <div className="admin-projects-save-bar">
          <p>Save to update the Projects content stored in your database.</p>

          <button type="submit" disabled={saving || !loaded}>
            {saving ? "Saving..." : "Save Changes"}
            {!saving && " ↗"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SectionHeading({ number, title, description }) {
  return (
    <div className="admin-projects-section-heading">
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
    <label className="admin-projects-field">
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

function TextField({ label, value, onChange, rows = 4, maxLength, hint }) {
  return (
    <label className="admin-projects-field full">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value ?? ""}
        maxLength={maxLength}
        placeholder={`Enter ${label.toLowerCase()}`}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <small className="admin-projects-hint">{hint}</small>}
    </label>
  );
}

function ProjectItemsEditor({
  title,
  description,
  items,
  onAdd,
  onChange,
  onRemove,
  onMove,
  multiline = false,
}) {
  return (
    <div className="admin-projects-subsection">
      <div className="admin-projects-list-heading">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>

        <button type="button" onClick={onAdd} disabled={items.length >= 50}>
          + Add {multiline ? "Highlight" : "Technology"}
        </button>
      </div>

      <div className="admin-projects-item-list">
        {items.map((item, index) => (
          <div className="admin-projects-item-row" key={index}>
            <span className="admin-projects-item-number">
              {numberLabel(index)}
            </span>

            <div className="admin-projects-item-input">
              {multiline ? (
                <textarea
                  rows={2}
                  value={item}
                  placeholder={`Enter ${title.toLowerCase()}`}
                  onChange={(event) => onChange(index, event.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={item}
                  placeholder="Technology name"
                  onChange={(event) => onChange(index, event.target.value)}
                />
              )}
            </div>

            <div className="admin-projects-repeat-actions">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onMove(index, -1)}
                title="Move up"
              >
                ↑
              </button>

              <button
                type="button"
                disabled={index === items.length - 1}
                onClick={() => onMove(index, 1)}
                title="Move down"
              >
                ↓
              </button>

              <button
                type="button"
                className="remove"
                onClick={() => onRemove(index)}
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="admin-projects-empty">
            No {title.toLowerCase()} added yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminProjects;
