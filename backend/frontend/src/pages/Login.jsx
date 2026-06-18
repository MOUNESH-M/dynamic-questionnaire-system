import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  if (isAuthenticated) {
    const dest = role === "ADMIN" ? "/admin" : "/dashboard";
    return <Navigate to={location.state?.from?.pathname || dest} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password) {
      setFormError("Enter both your email and password.");
      return;
    }
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
    } catch {
      // useAuth already stores the error message; nothing else to do.
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-art">
        <h1>Build the questionnaire, not the spreadsheet.</h1>
        <p>
          Design branching surveys where every answer decides what the
          respondent sees next — built, published, and answered from one
          place.
        </p>
        <div className="auth-flow-demo">
          <span className="auth-chip">Are you a student?</span>
          <span className="auth-arrow">→</span>
          <span className="auth-chip">Yes</span>
          <span className="auth-arrow">→</span>
          <span className="auth-chip">Which year?</span>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <h2>Welcome back</h2>
          <span className="sub">Sign in to continue to Questionnaire Studio.</span>

          <form onSubmit={handleSubmit}>
            {formError && <div className="alert alert-error">{formError}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <span className="spinner" /> : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
