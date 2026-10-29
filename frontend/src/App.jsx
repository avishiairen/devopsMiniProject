import { useState } from 'react';
import { ToastProvider } from './utils.jsx';
import Sidebar from './Sidebar.jsx';
import Dashboard from './Dashboard.jsx';
import Projects from './Projects.jsx';
import Tasks from './Tasks.jsx';
import Releases from './Releases.jsx';

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard',  sub: 'Overview of your projects and releases' },
  projects:  { title: 'Projects',   sub: 'Manage your software projects' },
  tasks:     { title: 'Tasks',      sub: 'Track work items across all projects' },
  releases:  { title: 'Releases',   sub: 'Monitor release readiness' },
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const { title, sub } = PAGE_TITLES[page];

  const pages = { dashboard: <Dashboard />, projects: <Projects />, tasks: <Tasks />, releases: <Releases /> };

  return (
    <ToastProvider>
      <div className="app-layout">
        <Sidebar currentPage={page} setPage={setPage} />

        <div className="main-content">
          {/* Top header */}
          <header className="top-header">
            <div className="header-left">
              <h1>{title}</h1>
              <div className="header-breadcrumb">ShipShape › {title}</div>
            </div>
            <div className="header-actions">
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, color: 'var(--text-secondary)',
                }}
              >
                <span style={{ width: 6, height: 6, background: '#3fb950', borderRadius: '50%', display: 'inline-block' }} />
                API Connected
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="page-content">
            {pages[page]}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
