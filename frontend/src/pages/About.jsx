import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import heroImage from "../assets/hero.png";

import api from "../services/api";


import "./About.css";


// =========================================================
// ABOUT COMPONENT
// =========================================================

function About() {

  // =======================================================
  // STATE
  // =======================================================

  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  // =======================================================
  // SECTION REFERENCE
  // =======================================================

  const sectionRef = useRef(null);


  // =======================================================
  // FETCH ABOUT DATA
  // =======================================================

  useEffect(() => {

    const fetchAbout = async () => {

      try {

        const response = await api.get("/about");

        if (response.data.success) {
          setAboutData(response.data.data);
        }

      } catch (error) {

        console.error("Failed to fetch About data:", error);

        setError(true);

      } finally {

        setLoading(false);

      }

    };


    fetchAbout();

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
            entry.target.classList.add("about-visible");
          }

        });

      },
      {
        threshold: 0.15,
      }
    );


    const elements =
      section.querySelectorAll(".about-reveal");


    elements.forEach((element) => {
      observer.observe(element);
    });


    return () => observer.disconnect();

  }, [aboutData]);


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <section className="about-section">
        <div className="about-grid"></div>
      </section>
    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error || !aboutData) {

    return (
      <section className="about-section">
        <div className="about-grid"></div>

        <div className="about-container">
          <p>
            Failed to load About content.
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
    profile,
    about,
    link,
    philosophy,
    stack,
  } = aboutData;


  // =======================================================
  // COMPONENT UI
  // =======================================================

  return (

    <section
      ref={sectionRef}
      className="about-section"
    >

      {/* ==================================================
          BACKGROUND GRID
          ================================================== */}

      <div className="about-grid"></div>


      {/* ==================================================
          SECTION HEADER
          ================================================== */}

      <div className="about-header about-reveal">

        <span className="section-index">
          {section.label} / {section.index}
        </span>

        <span className="section-line"></span>

        <span className="section-label">
          PROFILE
        </span>

      </div>


      {/* ==================================================
          ABOUT CONTAINER
          ================================================== */}

      <div className="about-container">


        {/* ==================================================
            TITLE / INTRO
            ================================================== */}

        <div className="about-intro about-reveal">

          <p className="about-eyebrow">
            {intro.eyebrow}
          </p>


          <h1>

            {intro.title.line1}

            <br />

            {intro.title.line2}

            <br />

            <span>
              {intro.title.line3}
            </span>

          </h1>

        </div>


        {/* ==================================================
            MAIN CONTENT
            ================================================== */}

        <div className="about-main">


          {/* ==================================================
              PROFILE IMAGE
              ================================================== */}

          <div className="about-profile about-reveal">

            <div className="profile-frame">

              <span className="profile-corner top-left"></span>

              <span className="profile-corner top-right"></span>

              <span className="profile-corner bottom-left"></span>

              <span className="profile-corner bottom-right"></span>


              {/* Profile image */}

              <img
                src={heroImage}
                alt={profile.name}
              />


              {/* Profile number */}

              <div className="profile-number">
                {profile.number}
              </div>

            </div>


            {/* Profile caption */}

            <p className="profile-caption">
              {profile.caption}
            </p>

          </div>


          {/* ==================================================
              ABOUT TEXT
              ================================================== */}

          <div className="about-copy about-reveal">

            <span className="copy-number">
              {about.number}
            </span>


            <h2>
              {about.heading}
            </h2>


            <p>
              {about.introduction}
            </p>


            <p>
              {about.technicalFocus}
            </p>


            <Link
              to={link.url}
              className="about-link"
            >

              {link.text}

              <span>
                ↗
              </span>

            </Link>

          </div>

        </div>


        {/* ==================================================
            PHILOSOPHY / ENGINEERING
            ================================================== */}

        <div className="about-philosophy about-reveal">


          {/* Philosophy title */}

          <div className="philosophy-title">

            <span>
              {philosophy.sectionNumber}
            </span>

            <h2>
              {philosophy.title}
            </h2>

          </div>


          {/* Philosophy content */}

          <div className="philosophy-content">

            <p>
              {philosophy.introduction}
            </p>


            {/* Engineering principles */}

            <div className="philosophy-items">

              {philosophy.principles.map((principle) => (

                <div key={principle.number}>

                  <span>
                    {principle.number}
                  </span>

                  <strong>
                    {principle.title}
                  </strong>

                  <p>
                    {principle.description}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>


        {/* ==================================================
            TECH STACK
            ================================================== */}

        <div className="about-stack about-reveal">


          {/* Stack heading */}

          <div className="stack-heading">

            <span>
              03 — STACK
            </span>

            <h2>
              TOOLS I BUILD WITH
            </h2>

          </div>


          {/* Technology list */}

          <div className="stack-list">

            {stack.map((technology) => (

              <span key={technology.id}>
                {technology.name}
              </span>

            ))}

          </div>

        </div>

      </div>

    </section>

  );
}


// =========================================================
// EXPORT
// =========================================================

export default About;