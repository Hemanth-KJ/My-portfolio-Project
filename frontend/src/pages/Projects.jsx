import { useEffect, useState } from "react";
import api from "../services/api";
import "./Project.css";

// =========================================================
// PROJECTS COMPONENT
// =========================================================

function Projects() {
  // ---------------------------------------------------------
  // PROJECT DATA STATE
  // ---------------------------------------------------------

  const [projects, setProjects] = useState([]);

  // ---------------------------------------------------------
  // PAGE CONTENT STATE
  // ---------------------------------------------------------

  const [pageContent, setPageContent] = useState(null);

  // ---------------------------------------------------------
  // ACTIVE PROJECT STATE
  // ---------------------------------------------------------

  const [activeProject, setActiveProject] = useState(0);

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------

  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------

  const [error, setError] = useState("");

  // =========================================================
  // FETCH PROJECTS
  // =========================================================

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/projects");

        const data = response.data.data;

        setPageContent(data);
        setProjects(data.projects || []);

      } catch (error) {
        console.error("Failed to fetch projects:", error);

        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // =========================================================
  // SCROLL REVEAL ANIMATION
  // =========================================================

  useEffect(() => {
    if (loading) return;

    const elements = document.querySelectorAll(".project-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("project-visible");
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [loading]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <section className="projects-section">
        <div className="projects-container">
          <div className="project-reveal">
            LOADING PROJECTS...
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // ERROR STATE
  // =========================================================

  if (error || !pageContent || projects.length === 0) {
    return (
      <section className="projects-section">
        <div className="projects-container">
          <div className="project-reveal">
            {error || "No projects found."}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================
  // CURRENT PROJECT
  // =========================================================

  const project = projects[activeProject];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="projects-section">
      <div className="projects-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="projects-top project-reveal">

          <div className="projects-label">
            <span>{pageContent.section.label}</span>
            <span>/ {pageContent.section.number}</span>
          </div>

          <div className="projects-index">
            {pageContent.section.headerRight}
          </div>

        </div>

        {/* =====================================================
            INTRO
        ===================================================== */}

        <div className="projects-intro project-reveal">

          <p className="projects-kicker">
            {pageContent.intro.kicker}
          </p>

          <h1>
            {pageContent.intro.title.line1}
            <br />
            <span>{pageContent.intro.title.line2}</span>
          </h1>

          <p className="projects-description">
            {pageContent.intro.description}
          </p>

        </div>

        {/* =====================================================
            PROJECT SELECTOR
        ===================================================== */}

        <div className="project-selector project-reveal">

          {projects.map((item, index) => (

            <button
              key={item.id}
              className={`project-selector-item ${
                activeProject === index ? "active" : ""
              }`}
              onClick={() => setActiveProject(index)}
            >

              <span>
                {item.number}
              </span>

              <span>
                {item.title.replace("\n", " ")}
              </span>

            </button>

          ))}

        </div>

        {/* =====================================================
            FEATURED PROJECT
        ===================================================== */}

        <div className="featured-project project-reveal">

          {/* ---------------------------------------------------
              PROJECT VISUAL
          --------------------------------------------------- */}

          <div className="project-visual">

            <div className="visual-grid"></div>

            <div className="visual-number">
              {project.number}
            </div>

            <div className="visual-center">

              <div className="visual-circle">

                <div className="visual-circle-inner">
                  {project.number}
                </div>

              </div>

            </div>

            <div className="visual-label visual-label-top">
              {project.visualStatus}
            </div>

            <div className="visual-label visual-label-bottom">
              {project.visualYear}
            </div>

            <div className="visual-line line-one"></div>

            <div className="visual-line line-two"></div>

          </div>

          {/* ---------------------------------------------------
              PROJECT CONTENT
          --------------------------------------------------- */}

          <div className="project-content">

            {/* PROJECT CONTENT HEADER */}

            <div className="project-content-header">

              <span>
                {project.category}
              </span>

              <span>
                {project.number} /{" "}
                {String(projects.length).padStart(2, "0")}
              </span>

            </div>

            {/* PROJECT TITLE */}

            <h2>

              {project.title.split("\n").map((line, index) => (

                <span key={index}>
                  {line}
                  <br />
                </span>

              ))}

            </h2>

            {/* PROJECT DESCRIPTION */}

            <p className="project-description">
              {project.description}
            </p>

            {/* =================================================
                TECHNOLOGIES
            ================================================= */}

            <div className="project-tech">

              {project.technologies.map((technology) => (

                <span key={technology}>
                  {technology}
                </span>

              ))}

            </div>

            {/* =================================================
                ENGINEERING HIGHLIGHTS
            ================================================= */}

            <div className="project-highlights">

              <div className="highlights-title">
                ENGINEERING HIGHLIGHTS
              </div>

              {project.highlights.map((highlight, index) => (

                <div
                  className="highlight-item"
                  key={highlight}
                >

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p>
                    {highlight}
                  </p>

                </div>

              ))}

            </div>

            {/* =================================================
                PROJECT ACTIONS
            ================================================= */}

            <div className="project-actions">

              {/* GITHUB */}

              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="project-button primary"
              >
                VIEW GITHUB
                <span>↗</span>
              </a>

              {/* LIVE DEMO */}

              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="project-button secondary"
              >
                LIVE DEMO
                <span>↗</span>
              </a>

            </div>

          </div>

        </div>

        {/* =====================================================
            BOTTOM STATEMENT
        ===================================================== */}

        <div className="projects-bottom project-reveal">

          {/* FEATURED PROJECTS */}

          <div>
            <span>
              {pageContent.bottom.projectCount}
            </span>

            <p>
              {pageContent.bottom.projectLabel}
            </p>
          </div>

          {/* ENGINEERING FOCUS */}

          <div>
            <span>
              {pageContent.bottom.focusValue}
            </span>

            <p>
              {pageContent.bottom.focusLabel}
            </p>
          </div>

          {/* ARCHITECTURE */}

          <div>
            <span>
              {pageContent.bottom.architectureValue}
            </span>

            <p>
              {pageContent.bottom.architectureLabel}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Projects;