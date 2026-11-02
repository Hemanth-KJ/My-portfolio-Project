import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

 const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");

  const email = formData.email.trim().toLowerCase();
  const password = formData.password;

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  setLoading(true);

  try {
    const response = await api.post("/admin/login", {
      email,
      password,
    });

    const { token, admin } = response.data.data;

    if (!token || !admin) {
      throw new Error("Invalid response received from the server.");
    }

    // Keep the token for this browser session.
    sessionStorage.setItem("adminToken", token);
    sessionStorage.setItem("adminUser", JSON.stringify(admin));

    // Temporary success feedback until we confirm your dashboard route.
    setError("");
    navigate("/admin/dashboard");
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Unable to sign in. Please try again.";

    setError(message);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="admin-login-page">
      {/* Background grid */}
      <div className="admin-login-grid" aria-hidden="true" />

      {/* Top navigation */}
      <header className="admin-login-topbar">
        <Link to="/" className="admin-login-logo">
          HKJ<span>.</span>
        </Link>

        <span className="admin-login-top-label">
          ADMIN / 001
        </span>
      </header>

      {/* Login content */}
      <section className="admin-login-container">
        <div className="admin-login-intro">
          <div className="admin-login-index">
            <span>001</span>
            <span>PRIVATE ACCESS / AUTHENTICATION</span>
          </div>

          <p className="admin-login-eyebrow">
            PORTFOLIO MANAGEMENT SYSTEM
          </p>

          <h1 className="admin-login-title">
            <span>CONTROL</span>
            <span className="admin-login-outline">
              PANEL.
            </span>
          </h1>

          <p className="admin-login-description">
            Manage your portfolio, projects, education,
            skills and professional experience from one place.
          </p>

          <div className="admin-login-status">
            <span className="admin-login-status-dot" />
            AUTHORIZED PERSONNEL ONLY
          </div>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-card-heading">
            <div>
              <p className="admin-login-card-kicker">
                AUTHENTICATION / 01
              </p>

              <h2>Sign in.</h2>
            </div>

            <span className="admin-login-card-number">
              HKJ / ADMIN
            </span>
          </div>

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="admin-login-field">
              <label htmlFor="admin-email">
                EMAIL ADDRESS
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
                disabled={loading}
              />
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                PASSWORD
              </label>

              <div className="admin-login-password-wrap">
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={loading}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && (
              <p className="admin-login-error" role="alert">
                <span>!</span>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="admin-login-submit"
              disabled={loading}
            >
              <span>
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </span>

              <span className="admin-login-submit-arrow">
                {loading ? "..." : "↗"}
              </span>
            </button>

            <p className="admin-login-form-note">
              Secure access to your portfolio dashboard.
            </p>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="admin-login-footer">
        <span>HKJ / PORTFOLIO MANAGEMENT</span>
        <span>DESIGNED FOR PRECISION.</span>
        <span>© {new Date().getFullYear()} HEMANTH K J</span>
      </footer>
    </main>
  );
}

export default AdminLogin;