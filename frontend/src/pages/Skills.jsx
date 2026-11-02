import { useEffect, useState } from "react";
import api from "../services/api";
import "./Skills.css";

// =========================================================
// SKILLS COMPONENT
// =========================================================

function Skills() {
  // ---------------------------------------------------------
  // API STATE
  // ---------------------------------------------------------

  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------------------
  // ACTIVE STATE
  // ---------------------------------------------------------

  const [activeGroup, setActiveGroup] = useState(0);
  const [activeSkill, setActiveSkill] = useState(0);

  // ---------------------------------------------------------
  // FETCH SKILLS
  // ---------------------------------------------------------

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);

        const response = await api.get("/skills");

        setSkillsData(response.data.data);
        setError("");
      } catch (err) {
        console.error("Failed to fetch skills:", err);

        setError("Unable to load skills.");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // ---------------------------------------------------------
  // SCROLL REVEAL ANIMATION
  // ---------------------------------------------------------

  useEffect(() => {
    const elements = document.querySelectorAll(".skills-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("skills-visible");
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [skillsData]);

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <section className="skills-section">
        <div className="skills-container">
          <div className="skills-reveal skills-visible">
            <p>LOADING SKILLS...</p>
          </div>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error || !skillsData) {
    return (
      <section className="skills-section">
        <div className="skills-container">
          <div className="skills-reveal skills-visible">
            <p>{error || "Skills data unavailable."}</p>
          </div>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------
  // CURRENT GROUP
  // ---------------------------------------------------------

  const currentGroup = skillsData.categories[activeGroup];

  const selectedSkill =
    currentGroup?.skills?.[activeSkill];

  // ---------------------------------------------------------
  // CHANGE ACTIVE CATEGORY
  // ---------------------------------------------------------

  const changeGroup = (index) => {
    setActiveGroup(index);
    setActiveSkill(0);
  };

  // Safety check
  if (!currentGroup || !selectedSkill) {
    return null;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="skills-section">
      <div className="skills-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="skills-header skills-reveal">
          <div className="skills-label">
            <span>{skillsData.section.number}</span>
            <span>{skillsData.section.label}</span>
          </div>

          <div className="skills-header-right">
            {skillsData.section.headerRight}
          </div>
        </div>

        {/* =====================================================
            INTRO
        ===================================================== */}

        <div className="skills-intro skills-reveal">
          <div>
            <p className="skills-kicker">
              {skillsData.intro.kicker}
            </p>

            <h1>
              {skillsData.intro.title.line1}
              <br />
              <span>
                {skillsData.intro.title.line2}
              </span>
            </h1>
          </div>

          <p className="skills-intro-text">
            {skillsData.intro.description}
          </p>
        </div>

        {/* =====================================================
            MAIN SYSTEM
        ===================================================== */}

        <div className="skills-system skills-reveal">

          {/* ---------------------------------------------------
              CATEGORY NAVIGATION
          --------------------------------------------------- */}

          <aside className="skills-categories">
            <div className="categories-title">
              CATEGORIES
            </div>

            {skillsData.categories.map((group, index) => (
              <button
                key={group.id}
                className={`category-button ${
                  activeGroup === index ? "active" : ""
                }`}
                onClick={() => changeGroup(index)}
              >
                <span>{group.number}</span>

                <strong>{group.name}</strong>

                <span className="category-arrow">
                  →
                </span>
              </button>
            ))}
          </aside>

          {/* ---------------------------------------------------
              TECHNOLOGY MATRIX
          --------------------------------------------------- */}

          <div className="skills-matrix">

            {/* MATRIX HEADER */}

            <div className="matrix-header">
              <span>
                SYSTEM / {currentGroup.name}
              </span>

              <span>
                {currentGroup.skills.length
                  .toString()
                  .padStart(2, "0")}{" "}
                MODULES
              </span>
            </div>

            {/* TECHNOLOGY GRID */}

            <div className="technology-grid">
              {currentGroup.skills.map((skill, index) => (
                <button
                  key={skill.id}
                  className={`technology-card ${
                    activeSkill === index ? "active" : ""
                  }`}
                  onMouseEnter={() =>
                    setActiveSkill(index)
                  }
                  onClick={() =>
                    setActiveSkill(index)
                  }
                >
                  <span className="technology-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="technology-short">
                    {skill.short}
                  </span>

                  <span className="technology-name">
                    {skill.name}
                  </span>

                  <span className="technology-arrow">
                    ↗
                  </span>
                </button>
              ))}
            </div>

            {/* -------------------------------------------------
                DETAIL PANEL
            ------------------------------------------------- */}

            <div className="skill-detail">
              <div className="detail-number">
                {String(activeSkill + 1).padStart(2, "0")}
              </div>

              <div className="detail-content">
                <p>
                  SELECTED TECHNOLOGY
                </p>

                <h2>
                  {selectedSkill.name}
                </h2>

                <span className="detail-category">
                  {currentGroup.name}
                </span>

                <div className="detail-line"></div>

                <p className="detail-description">
                  {selectedSkill.description}
                </p>
              </div>

              <div className="detail-symbol">
                +
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SKILL FOOTER
        ===================================================== */}

        <div className="skills-footer skills-reveal">

          {/* CORE AREAS */}

          <div className="skills-stat">
            <strong>
              {skillsData.footer.coreAreas}
            </strong>

            <span>
              CORE AREAS
            </span>
          </div>

          {/* TECHNOLOGIES */}

          <div className="skills-stat">
            <strong>
              {skillsData.footer.technologies}
            </strong>

            <span>
              TECHNOLOGIES
            </span>
          </div>

          {/* ENGINEERING MINDSET */}

          <div className="skills-stat">
            <strong>
              {skillsData.footer.mindset}
            </strong>

            <span>
              ENGINEERING MINDSET
            </span>
          </div>

          {/* FOOTER STATEMENT */}

          <div className="skills-footer-text">
            {skillsData.footer.statement.map(
              (text, index) => (
                <span key={index}>
                  {text}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Skills;