import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_LINKS = [{ to: "/admin", label: "Questionnaires", icon: "01" }];
const USER_LINKS = [{ to: "/dashboard", label: "Available Surveys", icon: "01" }];

export default function Sidebar({ open, onNavigate }) {
  const { user, role, logout } = useAuth();
  const links = role === "ADMIN" ? ADMIN_LINKS : USER_LINKS;
  const initials = (user?.name || user?.email || "?").slice(0, 1).toUpperCase();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">Q</div>
        <div className="sidebar-brand-text">
          Questionnaire Studio
          <span>{role === "ADMIN" ? "Admin console" : "Respondent"}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
            onClick={onNavigate}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name">{user?.name || user?.email}</div>
            <div className="sidebar-user-role">{role}</div>
          </div>
        </div>
        <button className="btn btn-secondary btn-block btn-sm" onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
