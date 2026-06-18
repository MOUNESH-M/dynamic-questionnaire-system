export default function Navbar({ title, subtitle, onMenuClick, children }) {
  return (
    <header className="topbar">
      <div className="flex gap-8" style={{ alignItems: "center" }}>
        <button className="btn btn-ghost btn-icon menu-toggle" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <div>
          <h2 className="topbar-title">{title}</h2>
          {subtitle && <span className="text-muted" style={{ fontSize: 12.5 }}>{subtitle}</span>}
        </div>
      </div>
      <div className="topbar-actions">{children}</div>
    </header>
  );
}
