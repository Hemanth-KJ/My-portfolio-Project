import { useEffect, useRef, useState } from "react";
import api from "../services/api";

import "./Education.css";


// =========================================================
// EDUCATION COMPONENT
// =========================================================

function Education() {

  // =======================================================
  // STATE
  // =======================================================

  const [educationData, setEducationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  // =======================================================
  // SECTION REFERENCE
  // =======================================================

  const sectionRef = useRef(null);


  // =======================================================
  // FETCH EDUCATION DATA
  // =======================================================

  useEffect(() => {

    const fetchEducation = async () => {

      try {

        const response = await api.get("/education");

        if (response.data.success) {
          setEducationData(response.data.data);
        }

      } catch (error) {

        console.error(
          "Failed to fetch Education data:",
          error
        );

        setError(true);

      } finally {

        setLoading(false);

      }

    };


    fetchEducation();

  }, []);


  // =======================================================
  // INTERSECTION OBSERVER
  // =======================================================

  useEffect(() => {

    const section = sectionRef.current;

    if (!section) return;


    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {
            entry.target.classList.add(
              "education-visible"
            );
          }

        });

      },
      {
        threshold: 0.15,
      }
    );


    const elements =
      section.querySelectorAll(".education-reveal");


    elements.forEach((element) => {
      observer.observe(element);
    });


    return () => observer.disconnect();

  }, [educationData]);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <section className="education-section">

        <div className="education-grid"></div>

      </section>
    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error || !educationData) {

    return (
      <section className="education-section">

        <div className="education-grid"></div>

        <div className="education-container">

          <p>
            Failed to load Education content.
          </p>

        </div>

      </section>
    );

  }


  // =======================================================
  // DATA
  // =======================================================

  const {
    section,
    intro,
    timeline,
    bottom,
  } = educationData;


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <section
      ref={sectionRef}
      className="education-section"
    >

      {/* ===================================================
          BACKGROUND
          =================================================== */}

      <div className="education-grid"></div>


      {/* ===================================================
          SECTION HEADER
          =================================================== */}

      <div className="education-header education-reveal">

        <span>
          {section.label} / {section.number}
        </span>

        <div className="education-header-line"></div>

        <span>
          ACADEMIC JOURNEY
        </span>

      </div>


      {/* ===================================================
          MAIN CONTAINER
          =================================================== */}

      <div className="education-container">


        {/* =================================================
            INTRO
            ================================================= */}

        <div className="education-intro education-reveal">

          <p>
            {intro.eyebrow}
          </p>

          <h1>

            {intro.title.line1}

            <br />

            <span>
              {intro.title.line2}
            </span>

          </h1>

        </div>


        {/* =================================================
            EDUCATION TIMELINE
            ================================================= */}

        <div className="education-timeline">

          {/* Timeline Line */}

          <div className="timeline-line"></div>


          {/* Education Items */}

          {timeline.map((item, index) => (

            <article
              className="education-item education-reveal"
              key={item.id}
              style={{
                transitionDelay: `${index * 120}ms`,
              }}
            >

              {/* ===========================================
                  TIMELINE POINT
                  =========================================== */}

              <div className="timeline-point">

                <span></span>

              </div>


              {/* ===========================================
                  YEAR
                  =========================================== */}

              <div className="education-year">

                {item.year}

              </div>


              {/* ===========================================
                  NUMBER
                  =========================================== */}

              <div className="education-number">

                {item.number}

              </div>


              {/* ===========================================
                  EDUCATION CONTENT
                  =========================================== */}

              <div className="education-content">

                {/* Status */}

                <div className="education-status">

                  {item.status}

                </div>


                {/* Title */}

                <h2>

                  {item.title}

                </h2>


                {/* Institution */}

                <h3>

                  {item.institution}

                </h3>


                {/* Description */}

                <p>

                  {item.description}

                </p>

              </div>


              {/* ===========================================
                  ARROW
                  =========================================== */}

              <div className="education-arrow">

                ↗

              </div>

            </article>

          ))}

        </div>


        {/* =================================================
            BOTTOM STATEMENT
            ================================================= */}

        <div className="education-bottom education-reveal">

          <span>

            {bottom.label}

          </span>

          <p>

            {bottom.description}

          </p>

        </div>

      </div>

    </section>

  );
}


// =========================================================
// EXPORT
// =========================================================

export default Education;