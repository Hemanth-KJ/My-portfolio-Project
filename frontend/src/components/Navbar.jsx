import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import "./Navbar.css";

// =========================================================
// NAVIGATION ITEMS
// =========================================================

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Education", path: "/education" },
  { name: "Skills", path: "/skills" },
  { name: "Projects", path: "/projects" },
  { name: "Resume", path: "/resume" },
  { name: "Contact", path: "/contact" },
];

// =========================================================
// NAVBAR COMPONENT
// =========================================================

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`navbar ${menuOpen ? "is-open" : ""}`}>
      <div className="navbar-inner">

        {/* LOGO */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          <span className="logo-box">H</span>

          <span className="logo-text">
            HEMANTH K J
          </span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="navbar-links">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="navbar-actions">

          {/* ADMIN ICON */}
          <Link
            to="/admin"
            className="admin-nav-link"
            onClick={closeMenu}
            aria-label="Admin Login"
            title="Admin Login"
          >
            <ShieldCheck size={19} strokeWidth={1.8} />
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            className={`menu-button ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="menu-label">
              {menuOpen ? "CLOSE" : "MENU"}
            </span>

            <span className="menu-icon">
              <i />
              <i />
            </span>
          </button>

        </div>
      </div>

      {/* MOBILE MENU */}
      <div className="mobile-menu">
        <div className="mobile-menu-content">

          {/* MOBILE HEADER */}
          <div className="mobile-menu-header">
            <span>INDEX / 00</span>
            <span>PORTFOLIO / 2026</span>
          </div>

          {/* MOBILE NAVIGATION */}
          <nav className="mobile-navigation">
            {navItems.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeMenu}
                style={{
                  "--delay": `${index * 0.07}s`,
                }}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="mobile-index">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="mobile-name">
                  {item.name}
                </span>

                <span className="mobile-line" />

                <span className="mobile-arrow">
                  ↗
                </span>
              </NavLink>
            ))}
          </nav>

          {/* MOBILE FOOTER */}
          <div className="mobile-menu-footer">
            <div>
              <span>SOFTWARE ENGINEER</span>
              <span>FULL STACK DEVELOPER</span>
            </div>

            <div>
              <span>INDIA</span>
              <span>2026</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;