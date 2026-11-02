import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import heroImage from "../assets/hero.png";

import api from "../services/api";

import "./Home.css";

function Home() {
  // --------------------------------------------------
  // Mouse position
  // --------------------------------------------------

  const [mouse, setMouse] = useState({
    x: 0,
    y: 0,
  });

  // --------------------------------------------------
  // Home API data
  // --------------------------------------------------

  const [homeData, setHomeData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  // --------------------------------------------------
  // Fetch Home data
  // --------------------------------------------------

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await api.get("/home");

        setHomeData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch home data:", error);

        setError("Failed to load portfolio content.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // --------------------------------------------------
  // Mouse movement
  // --------------------------------------------------

  const handleMouseMove = (e) => {
    const x =
      (e.clientX / window.innerWidth - 0.5) * 2;

    const y =
      (e.clientY / window.innerHeight - 0.5) * 2;

    setMouse({
      x,
      y,
    });
  };

  // --------------------------------------------------
  // Loading state
  // --------------------------------------------------

  if (loading) {
    return (
      <section className="home-section">
        <div className="home-container">
          Loading...
        </div>
      </section>
    );
  }

  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  if (error || !homeData) {
    return (
      <section className="home-section">
        <div className="home-container">
          {error || "Home content unavailable."}
        </div>
      </section>
    );
  }

  return (
    <section
      className="home-section"
      onMouseMove={handleMouseMove}
    >
      {/* ==================================================
          BACKGROUND GRID
      ================================================== */}

      <div className="home-grid" />

      {/* ==================================================
          TOP META
      ================================================== */}

      <div className="home-meta">
        <span>
          {homeData.topLabel}
        </span>

        <span>
          {homeData.sectionNumber}
        </span>
      </div>

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}

      <div className="home-container">

        {/* ==================================================
            LEFT CONTENT
        ================================================== */}

        <div className="home-content">

          {/* Index */}

          <div className="home-index">
            <span>
              {homeData.indexNumber}
            </span>

            <span>
              {homeData.indexLabel}
            </span>
          </div>

          {/* Eyebrow */}

          <p className="home-eyebrow">
            {homeData.eyebrow}
          </p>

          {/* Title */}

          <h1 className="home-title">

            <span>
              {homeData.title.line1}
            </span>

            <span>
              {homeData.title.line2}
            </span>

            <span className="outline-text">
              {homeData.title.line3}
            </span>

          </h1>

          {/* Description */}

          <p className="home-description">
            {homeData.description}
          </p>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="home-actions">

            <Link
              to={homeData.buttons.primary.link}
              className="home-button primary"
            >
              <span>
                {homeData.buttons.primary.text}
              </span>

              <span className="button-arrow">
                ↗
              </span>
            </Link>

            <Link
              to={homeData.buttons.secondary.link}
              className="home-button secondary"
            >
              <span>
                {homeData.buttons.secondary.text}
              </span>

              <span className="button-arrow">
                ↗
              </span>
            </Link>

          </div>

          {/* ==================================================
              TECHNOLOGY STRIP
          ================================================== */}

          <div className="home-tech-strip">

            {homeData.technologies.map(
              (technology, index) => (
                <span key={index}>
                  {technology}
                </span>
              )
            )}

          </div>

        </div>

        {/* ==================================================
            RIGHT VISUAL
        ================================================== */}

        <div className="home-visual">

          {/* Top HUD */}

          <div className="hud hud-top">

            <span>
              LAT 12.9716°
            </span>

            <span>
              LNG 77.5946°
            </span>

          </div>

          {/* Visual Frame */}

          <div className="visual-frame">

            {/* Number */}

            <div className="visual-number">
              {homeData.visual.number}
            </div>

            {/* Image */}

            <div className="visual-image-wrapper">

              <img
                src={heroImage}
                alt={homeData.eyebrow}
                className="hero-image"
                style={{
                  transform: `
                    translate(
                      ${mouse.x * 8}px,
                      ${mouse.y * 8}px
                    )
                    scale(1.04)
                  `,
                }}
              />

            </div>

            {/* Label */}

            <div className="visual-label">

              <span>
                {homeData.visual.labelLine1}
              </span>

              <span>
                {homeData.visual.labelLine2}
              </span>

            </div>

            {/* Corners */}

            <span className="frame-corner top-left" />
            <span className="frame-corner top-right" />
            <span className="frame-corner bottom-left" />
            <span className="frame-corner bottom-right" />

          </div>

          {/* Bottom HUD */}

          <div className="hud hud-bottom">

            <span>
              BUILD / {homeData.visual.buildYear}
            </span>

            <span>
              STATUS / {homeData.visual.status}
            </span>

          </div>

        </div>

      </div>

      {/* ==================================================
          SCROLL INDICATOR
      ================================================== */}

      <div className="scroll-indicator">

        <span className="scroll-line" />

        <span>
          SCROLL TO EXPLORE
        </span>

      </div>

      {/* ==================================================
          SIDE LABEL
      ================================================== */}

      <div className="home-side-label">
        FULL STACK / DISTRIBUTED / SYSTEMS
      </div>

    </section>
  );
}

export default Home;