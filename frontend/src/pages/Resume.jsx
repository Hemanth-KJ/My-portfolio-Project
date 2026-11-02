import { useEffect, useState } from "react";
import api from "../services/api";
import "./Resume.css";


/* =========================================================
   RESUME COMPONENT
========================================================= */

function Resume() {

  /* =======================================================
     API STATE
  ======================================================= */

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* =======================================================
     FETCH RESUME DATA
  ======================================================= */

  useEffect(() => {

    const fetchResume = async () => {

      try {

        setLoading(true);
        setError("");

        const response = await api.get("/resume");

        if (response.data.success) {
          setResume(response.data.data);
        } else {
          setError("Failed to load resume");
        }

      } catch (error) {

        console.error("Resume API error:", error);

        setError("Failed to load resume");

      } finally {

        setLoading(false);

      }
    };


    fetchResume();

  }, []);


  /* =======================================================
     SCROLL REVEAL ANIMATION
  ======================================================= */

  useEffect(() => {

    if (!resume) {
      return;
    }

    const elements = document.querySelectorAll(".resume-reveal");

    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {
            entry.target.classList.add("resume-visible");
          }

        });

      },
      {
        threshold: 0.1,
      }
    );


    elements.forEach((element) => {
      observer.observe(element);
    });


    return () => observer.disconnect();

  }, [resume]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="resume-section">

        <div className="resume-container">

          <div className="resume-header">
            <div className="resume-label">
              <span>RESUME</span>
              <span>/ 06</span>
            </div>
          </div>

        </div>

      </section>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !resume) {
    return (
      <section className="resume-section">

        <div className="resume-container">

          <div className="resume-header">

            <div className="resume-label">
              <span>RESUME</span>
              <span>/ 06</span>
            </div>

          </div>

          <div className="resume-block">

            <div className="resume-block-content">
              <p>{error || "Resume content unavailable."}</p>
            </div>

          </div>

        </div>

      </section>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="resume-section">

      <div className="resume-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="resume-header resume-reveal">

          <div className="resume-label">

            <span>
              {resume.section.label}
            </span>

            <span>
              / {resume.section.number}
            </span>

          </div>


          <a
            href={resume.resumePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="resume-download-top"
          >
            DOWNLOAD CV
            <span>↗</span>
          </a>

        </div>


        {/* =================================================
            HERO
        ================================================= */}

        <div className="resume-hero resume-reveal">


          {/* HERO LEFT */}

          <div className="resume-hero-left">

            <p className="resume-kicker">
              {resume.hero.kicker}
            </p>


            <h1>

              {resume.hero.name.line1}

              <br />

              <span>
                {resume.hero.name.line2}
              </span>

            </h1>

          </div>


          {/* HERO RIGHT */}

          <div className="resume-hero-right">

            <p>
              {resume.hero.description}
            </p>


            <div className="resume-status">

              <span className="status-dot"></span>

              {resume.hero.availability}

            </div>

          </div>

        </div>


        {/* =================================================
            EXPERIENCE
        ================================================= */}

        <section className="resume-block resume-reveal">

          <div className="resume-block-title">

            <span>01</span>

            <h2>
              EXPERIENCE
            </h2>

          </div>


          <div className="resume-block-content">

            {resume.experience.map((item) => (

              <div
                className="resume-experience"
                key={item.id}
              >

                <div className="resume-year">
                  {item.year}
                </div>


                <div>

                  <h3>
                    {item.role}
                  </h3>


                  <span className="resume-type">
                    {item.type}
                  </span>


                  <p>
                    {item.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            EDUCATION
        ================================================= */}

        <section className="resume-block resume-reveal">

          <div className="resume-block-title">

            <span>02</span>

            <h2>
              EDUCATION
            </h2>

          </div>


          <div className="resume-block-content">

            {resume.education.map((item) => (

              <div
                className="resume-education"
                key={item.id}
              >

                <div className="resume-year">
                  {item.year}
                </div>


                <div>

                  <h3>
                    {item.degree}
                  </h3>

                  <p>
                    {item.institution}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            PROJECTS
        ================================================= */}

        <section className="resume-block resume-reveal">

          <div className="resume-block-title">

            <span>03</span>

            <h2>
              PROJECTS
            </h2>

          </div>


          <div className="resume-block-content">

            {resume.projects.map((project) => (

              <div
                className="resume-project"
                key={project.id}
              >

                <span className="resume-project-number">
                  {project.number}
                </span>


                <div>

                  <h3>
                    {project.name}
                  </h3>

                  <p>
                    {project.stack}
                  </p>

                </div>


                <span className="resume-project-arrow">
                  ↗
                </span>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            TECHNICAL SKILLS
        ================================================= */}

        <section className="resume-block resume-reveal">

          <div className="resume-block-title">

            <span>04</span>

            <h2>
              TECHNICAL SKILLS
            </h2>

          </div>


          <div className="resume-skills">

            {resume.skills.map((skill, index) => (

              <div
                className="resume-skill"
                key={skill}
              >

                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>


                <strong>
                  {skill}
                </strong>

              </div>

            ))}

          </div>

        </section>


        {/* =================================================
            CALL TO ACTION
        ================================================= */}

        <div className="resume-cta resume-reveal">


          <div>

            <span className="resume-cta-small">
              {resume.cta.label}
            </span>


            <h2>

              {resume.cta.title.line1}

              <br />

              {resume.cta.title.line2}

            </h2>

          </div>


          <a
            href={resume.resumePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="resume-download-button"
          >

            DOWNLOAD
            <br />
            RESUME

            <span>↗</span>

          </a>

        </div>


      </div>

    </section>
  );
}


/* =========================================================
   EXPORT
========================================================= */

export default Resume;