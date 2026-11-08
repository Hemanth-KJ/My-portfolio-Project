import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import "./AdminSkills.css";

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
  categories: [],
  footer: {
    coreAreas: "",
    technologies: "",
    mindset: "",
    statement: ["", "", ""],
  },
};

const numberLabel = (index) => String(index + 1).padStart(2, "0");

function AdminSkills() {
  const [formData, setFormData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await api.get("/skills");

        if (response.data.success) {
          const data = response.data.data;

          setFormData({
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
            categories: Array.isArray(data.categories)
              ? data.categories.map((category) => ({
                  ...category,
                  skills: Array.isArray(category.skills) ? category.skills : [],
                }))
              : [],
            footer: {
              ...emptyData.footer,
              ...data.footer,
              statement: Array.from(
                { length: 3 },
                (_, index) => data.footer?.statement?.[index] ?? "",
              ),
            },
          });
        }
      } catch (err) {
        console.error("Failed to load Skills:", err);
        setError(
          err.response?.data?.message || "Failed to load Skills content.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const updateSection = (field, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      section: {
        ...previous.section,
        [field]: value,
      },
    }));
  };

  const updateIntro = (field, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      intro: {
        ...previous.intro,
        [field]: value,
      },
    }));
  };

  const updateTitle = (field, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      intro: {
        ...previous.intro,
        title: {
          ...previous.intro.title,
          [field]: value,
        },
      },
    }));
  };

  const updateFooter = (field, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      footer: {
        ...previous.footer,
        [field]: value,
      },
    }));
  };

  const updateStatement = (index, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      footer: {
        ...previous.footer,
        statement: previous.footer.statement.map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      },
    }));
  };

  const updateCategory = (index, field, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: previous.categories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, [field]: value } : category,
      ),
    }));
  };

  const addCategory = () => {
    if (formData.categories.length >= 30) {
      setError("Maximum 30 categories allowed.");
      return;
    }

    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: [
        ...previous.categories,
        {
          number: numberLabel(previous.categories.length),
          name: "",
          skills: [],
        },
      ],
    }));
  };

  const removeCategory = (index) => {
    if (!window.confirm("Remove this category and all its skills?")) {
      return;
    }

    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: previous.categories
        .filter((_, categoryIndex) => categoryIndex !== index)
        .map((category, categoryIndex) => ({
          ...category,
          number: numberLabel(categoryIndex),
        })),
    }));
  };

  const moveCategory = (index, direction) => {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= formData.categories.length) {
      return;
    }

    clearMessages();

    setFormData((previous) => {
      const categories = [...previous.categories];

      [categories[index], categories[nextIndex]] = [
        categories[nextIndex],
        categories[index],
      ];

      return {
        ...previous,
        categories: categories.map((category, categoryIndex) => ({
          ...category,
          number: numberLabel(categoryIndex),
        })),
      };
    });
  };

  const addSkill = (categoryIndex) => {
    const category = formData.categories[categoryIndex];

    if (category.skills.length >= 100) {
      setError("Maximum 100 skills per category allowed.");
      return;
    }

    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: previous.categories.map((item, index) =>
        index === categoryIndex
          ? {
              ...item,
              skills: [
                ...item.skills,
                {
                  name: "",
                  short: "",
                  description: "",
                },
              ],
            }
          : item,
      ),
    }));
  };

  const updateSkill = (categoryIndex, skillIndex, field, value) => {
    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: previous.categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              skills: category.skills.map((skill, index2) =>
                index2 === skillIndex ? { ...skill, [field]: value } : skill,
              ),
            }
          : category,
      ),
    }));
  };

  const removeSkill = (categoryIndex, skillIndex) => {
    if (!window.confirm("Remove this skill?")) return;

    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: previous.categories.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              skills: category.skills.filter(
                (_, index2) => index2 !== skillIndex,
              ),
            }
          : category,
      ),
    }));
  };

  const moveSkill = (categoryIndex, skillIndex, direction) => {
    const category = formData.categories[categoryIndex];
    const nextIndex = skillIndex + direction;

    if (nextIndex < 0 || nextIndex >= category.skills.length) {
      return;
    }

    clearMessages();

    setFormData((previous) => ({
      ...previous,
      categories: previous.categories.map((item, index) => {
        if (index !== categoryIndex) return item;

        const skills = [...item.skills];

        [skills[skillIndex], skills[nextIndex]] = [
          skills[nextIndex],
          skills[skillIndex],
        ];

        return { ...item, skills };
      }),
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    clearMessages();

    const token = sessionStorage.getItem("adminToken");

    if (!token) {
      setError("Admin session not found. Please log in again.");
      return;
    }

    if (
      formData.categories.length === 0 ||
      formData.categories.some((category) => category.skills.length === 0)
    ) {
      setError("Every category must contain at least one skill.");
      return;
    }

    setSaving(true);

    try {
      const response = await api.put("/skills", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Reload IDs assigned by PostgreSQL to new entries.
        const refreshed = await api.get("/skills");
        const data = refreshed.data.data;

        setFormData({
          section: data.section,
          intro: data.intro,
          categories: data.categories,
          footer: data.footer,
        });

        setSuccess("Skills content saved successfully.");

        // Smooth scroll to top to display the error
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    } catch (err) {
      console.error("Failed to save Skills:", err);
      setError(err.response?.data?.message || "Failed to save Skills content.");
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
      <div className="admin-skills-loading">
        <div className="admin-skills-spinner" />
        <p>Loading Skills editor...</p>
      </div>
    );
  }

  return (
    <div className="admin-skills-page">
      <div className="admin-skills-container">
        <header className="admin-skills-header">
          <div>
            <Link to="/admin/dashboard" className="admin-skills-back">
              ← Back to Dashboard
            </Link>

            <p className="admin-skills-eyebrow">CONTENT MANAGEMENT / 04</p>

            <h1>Skills Page Editor</h1>

            <p className="admin-skills-subtitle">
              Manage your skills, technology categories, descriptions and page
              content.
            </p>
          </div>

          <Link
            to="/skills"
            target="_blank"
            rel="noreferrer"
            className="admin-skills-preview"
          >
            Preview Skills ↗
          </Link>
        </header>

        {error && (
          <div className="admin-skills-alert error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-skills-alert success" role="status">
            {success}
          </div>
        )}

        <form className="admin-skills-form" onSubmit={handleSave}>
          <section className="admin-skills-card">
            <SectionHeading
              number="01"
              label="SECTION SETTINGS"
              title="Section Header"
            />

            <div className="admin-skills-fields two-columns">
              <Field
                label="Section Number"
                value={formData.section.number}
                maxLength={20}
                onChange={(value) => updateSection("number", value)}
              />

              <Field
                label="Section Label"
                value={formData.section.label}
                maxLength={100}
                onChange={(value) => updateSection("label", value)}
              />

              <Field
                label="Header Right"
                value={formData.section.headerRight}
                maxLength={100}
                onChange={(value) => updateSection("headerRight", value)}
              />
            </div>
          </section>

          <section className="admin-skills-card">
            <SectionHeading
              number="02"
              label="INTRODUCTION"
              title="Skills Introduction"
            />

            <div className="admin-skills-fields">
              <Field
                label="Kicker Text"
                value={formData.intro.kicker}
                maxLength={200}
                onChange={(value) => updateIntro("kicker", value)}
              />

              <div className="admin-skills-fields two-columns">
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
              </div>

              <TextField
                label="Introduction Description"
                value={formData.intro.description}
                onChange={(value) => updateIntro("description", value)}
              />
            </div>
          </section>

          <section className="admin-skills-card">
            <SectionHeading
              number="03"
              label="TECHNOLOGY CATEGORIES"
              title="Skills & Categories"
              description="Add, edit, remove and reorder categories and technologies."
              action={
                <button
                  type="button"
                  className="admin-skills-add"
                  onClick={addCategory}
                  disabled={formData.categories.length >= 30}
                >
                  + Add Category
                </button>
              }
            />

            {formData.categories.length === 0 ? (
              <div className="admin-skills-empty">
                No categories yet. Add your first category.
              </div>
            ) : (
              <div className="admin-skills-category-list">
                {formData.categories.map((category, categoryIndex) => (
                  <article
                    className="admin-skills-category"
                    key={category.id ?? `new-${categoryIndex}`}
                  >
                    <div className="admin-skills-item-heading">
                      <div>
                        <span>CATEGORY {numberLabel(categoryIndex)}</span>
                        <h3>{category.name || "New Category"}</h3>
                      </div>

                      <div className="admin-skills-item-actions">
                        <button
                          type="button"
                          onClick={() => moveCategory(categoryIndex, -1)}
                          disabled={categoryIndex === 0}
                          title="Move category up"
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          onClick={() => moveCategory(categoryIndex, 1)}
                          disabled={
                            categoryIndex === formData.categories.length - 1
                          }
                          title="Move category down"
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          className="remove"
                          onClick={() => removeCategory(categoryIndex)}
                          title="Remove category"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <div className="admin-skills-fields two-columns">
                      <Field
                        label="Category Number"
                        value={category.number}
                        maxLength={20}
                        onChange={(value) =>
                          updateCategory(categoryIndex, "number", value)
                        }
                      />

                      <Field
                        label="Category Name"
                        value={category.name}
                        maxLength={100}
                        onChange={(value) =>
                          updateCategory(categoryIndex, "name", value)
                        }
                      />
                    </div>

                    <div className="admin-skills-subheading">
                      <div>
                        <span>TECHNOLOGIES</span>
                        <p>{category.skills.length} skill(s)</p>
                      </div>

                      <button
                        type="button"
                        className="admin-skills-add"
                        onClick={() => addSkill(categoryIndex)}
                        disabled={category.skills.length >= 100}
                      >
                        + Add Skill
                      </button>
                    </div>

                    {category.skills.length === 0 ? (
                      <div className="admin-skills-empty">
                        Add at least one skill to this category.
                      </div>
                    ) : (
                      <div className="admin-skills-skill-list">
                        {category.skills.map((skill, skillIndex) => (
                          <div
                            className="admin-skills-skill"
                            key={
                              skill.id ?? `new-${categoryIndex}-${skillIndex}`
                            }
                          >
                            <div className="admin-skills-item-heading">
                              <div>
                                <span>SKILL {numberLabel(skillIndex)}</span>
                                <h4>{skill.name || "New Skill"}</h4>
                              </div>

                              <div className="admin-skills-item-actions">
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveSkill(categoryIndex, skillIndex, -1)
                                  }
                                  disabled={skillIndex === 0}
                                  title="Move skill up"
                                >
                                  ↑
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    moveSkill(categoryIndex, skillIndex, 1)
                                  }
                                  disabled={
                                    skillIndex === category.skills.length - 1
                                  }
                                  title="Move skill down"
                                >
                                  ↓
                                </button>

                                <button
                                  type="button"
                                  className="remove"
                                  onClick={() =>
                                    removeSkill(categoryIndex, skillIndex)
                                  }
                                  title="Remove skill"
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            <div className="admin-skills-fields two-columns">
                              <Field
                                label="Skill Name"
                                value={skill.name}
                                maxLength={100}
                                onChange={(value) =>
                                  updateSkill(
                                    categoryIndex,
                                    skillIndex,
                                    "name",
                                    value,
                                  )
                                }
                              />

                              <Field
                                label="Short Code"
                                value={skill.short}
                                maxLength={20}
                                onChange={(value) =>
                                  updateSkill(
                                    categoryIndex,
                                    skillIndex,
                                    "short",
                                    value,
                                  )
                                }
                              />

                              <div className="full-width">
                                <TextField
                                  label="Skill Description"
                                  value={skill.description}
                                  onChange={(value) =>
                                    updateSkill(
                                      categoryIndex,
                                      skillIndex,
                                      "description",
                                      value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="admin-skills-card">
            <SectionHeading
              number="04"
              label="FOOTER SETTINGS"
              title="Skills Statistics"
            />

            <div className="admin-skills-fields three-columns">
              <Field
                label="Core Areas"
                value={formData.footer.coreAreas}
                maxLength={20}
                onChange={(value) => updateFooter("coreAreas", value)}
              />

              <Field
                label="Technologies"
                value={formData.footer.technologies}
                maxLength={20}
                onChange={(value) => updateFooter("technologies", value)}
              />

              <Field
                label="Engineering Mindset"
                value={formData.footer.mindset}
                maxLength={20}
                onChange={(value) => updateFooter("mindset", value)}
              />
            </div>
          </section>

          <section className="admin-skills-card">
            <SectionHeading
              number="05"
              label="CLOSING STATEMENT"
              title="Footer Statement"
            />

            <div className="admin-skills-fields three-columns">
              {formData.footer.statement.map((statement, index) => (
                <Field
                  key={index}
                  label={`Statement Line ${index + 1}`}
                  value={statement}
                  maxLength={50}
                  onChange={(value) => updateStatement(index, value)}
                />
              ))}
            </div>
          </section>

          <div className="admin-skills-save-bar">
            <span>Changes are published after saving.</span>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeading({ number, title, description, action }) {
  return (
    <div className="admin-skills-card-heading">
      <span>{number}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {action && <div className="admin-skills-heading-action">{action}</div>}
    </div>
  );
}

function Field({ label, value, onChange, maxLength }) {
  return (
    <label className="admin-skills-field">
      <span>{label}</span>
      <input
        type="text"
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </label>
  );
}

function TextField({ label, value, onChange }) {
  return (
    <label className="admin-skills-field">
      <span>{label}</span>
      <textarea
        rows={4}
        maxLength={10000}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </label>
  );
}

export default AdminSkills;
