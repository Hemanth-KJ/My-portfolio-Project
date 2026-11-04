import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./AdminDashboard.css";

const managementSections = [
  {
    number: "01",
    title: "Home",
    description: "Manage your portfolio introduction and hero content.",
    status: "CONTENT MANAGEMENT",
    path: "/admin/home",
  },
  {
    number: "02",
    title: "About",
    description: "Update your profile, biography and personal details.",
    status: "CONTENT MANAGEMENT",
  },
  {
    number: "03",
    title: "Education",
    description: "Manage academic qualifications and education history.",
    status: "CONTENT MANAGEMENT",
  },
  {
    number: "04",
    title: "Skills",
    description: "Update technical skills and proficiency information.",
    status: "CONTENT MANAGEMENT",
  },
  {
    number: "05",
    title: "Projects",
    description: "Add, edit and organize your portfolio projects.",
    status: "CONTENT MANAGEMENT",
  },
  {
    number: "06",
    title: "Resume",
    description: "Manage your professional resume information.",
    status: "CONTENT MANAGEMENT",
  },
  {
    number: "07",
    title: "Contact",
    description: "Review and update your contact information.",
    status: "CONTENT MANAGEMENT",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const token = sessionStorage.getItem("adminToken");
  const storedAdmin = sessionStorage.getItem("adminUser");

  const admin = (() => {
    try {
      return storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch {
      return null;
    }
  })();

  const hasValidStoredAdmin =
    Boolean(token) &&
    Boolean(admin) &&
    typeof admin === "object" &&
    typeof admin.email === "string" &&
    admin.email.length > 0;

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    setLogoutLoading(true);
    navigate("/admin", { replace: true });
  };

  if (!hasValidStoredAdmin) {
    return (
      <main className="admin-dashboard-redirect">
        <h1>Access required.</h1>
        <p>Your admin session is missing. Please sign in to continue.</p>

        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("adminToken");
            sessionStorage.removeItem("adminUser");
            navigate("/admin", { replace: true });
          }}
        >
          RETURN TO LOGIN
        </button>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <Link to="/" className="admin-dashboard-logo">
          HKJ<span>.</span>
        </Link>

        <div className="admin-sidebar-label">WORKSPACE</div>

        <nav className="admin-sidebar-nav">
          <a href="#overview" className="admin-sidebar-link active">
            <span className="admin-nav-number">01</span>
            Overview
          </a>

          <a href="#management" className="admin-sidebar-link">
            <span className="admin-nav-number">02</span>
            Portfolio content
          </a>
        </nav>

        <div className="admin-sidebar-bottom">
          <span className="admin-sidebar-status-dot" />

          <div>
            <p>ADMIN SESSION</p>
            <span>Authenticated</span>
          </div>
        </div>
      </aside>

      <section className="admin-dashboard-main">
        <header className="admin-dashboard-topbar">
          <div>
            <p className="admin-dashboard-breadcrumb">WORKSPACE / OVERVIEW</p>

            <h1>
              Dashboard<span>.</span>
            </h1>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            {logoutLoading ? "LOGGING OUT..." : "LOG OUT"}
            <span>↗</span>
          </button>
        </header>

        <section className="admin-welcome-panel" id="overview">
          <div>
            <p className="admin-section-kicker">PORTFOLIO MANAGEMENT SYSTEM</p>

            <h2>
              Welcome back,
              <br />
              <span>{admin.email}</span>
            </h2>

            <p className="admin-welcome-description">
              Your workspace is ready. Manage your portfolio content from one
              central location.
            </p>
          </div>

          <div className="admin-welcome-index">
            <span>HKJ</span>
            <span>ADMIN / 001</span>
          </div>
        </section>

        <section className="admin-dashboard-stats">
          <article className="admin-stat-card">
            <span>WORKSPACE</span>
            <strong>ACTIVE</strong>
            <p>Admin session</p>
          </article>

          <article className="admin-stat-card">
            <span>CONTENT AREAS</span>
            <strong>
              {String(managementSections.length).padStart(2, "0")}
            </strong>
            <p>Portfolio sections</p>
          </article>

          <article className="admin-stat-card">
            <span>ACCESS LEVEL</span>
            <strong>{admin.role?.toUpperCase() || "ADMIN"}</strong>
            <p>Current account role</p>
          </article>
        </section>

        <section className="admin-management-section" id="management">
          <div className="admin-management-heading">
            <div>
              <p className="admin-section-kicker">CONTENT / DIRECTORY</p>

              <h2>Manage your portfolio.</h2>
            </div>

            <span>07 MODULES</span>
          </div>

          <div className="admin-management-grid">
            {managementSections.map((section) => (
              <article className="admin-management-card" key={section.number}>
                <div className="admin-management-card-top">
                  <span>{section.number}</span>

                  <span className="admin-management-indicator">↗</span>
                </div>

                <h3>{section.title}</h3>

                <p>{section.description}</p>

                <div className="admin-management-card-footer">
                  <span>{section.status}</span>

                  {section.path ? (
                    <Link to={section.path} className="admin-module-link">
                      MANAGE CONTENT ↗
                    </Link>
                  ) : (
                    <span className="admin-module-pending">SETUP PENDING</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="admin-dashboard-footer">
          <span>HKJ / ADMIN WORKSPACE</span>

          <span>© {new Date().getFullYear()} HEMANTH K J</span>
        </footer>
      </section>
    </main>
  );
}

export default AdminDashboard;
