// Sidebar navigation component
export default function Sidebar({ currentPage, setPage }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard',  icon: '⊞' },
    { id: 'projects',  label: 'Projects',   icon: '◫' },
    { id: 'tasks',     label: 'Tasks',      icon: '✓' },
    { id: 'releases',  label: 'Releases',   icon: '⬡' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🚢</div>
        <div>
          <div className="logo-text">ShipShape</div>
          <div className="logo-sub">Release Readiness</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="version-badge">
          <span>🟢</span>
          <span>v1.0.0 · DevOps Mini</span>
        </div>
      </div>
    </aside>
  );
}
