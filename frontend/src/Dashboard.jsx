import { useEffect, useState } from 'react';
import { getDashboard } from './api';
import { Spinner, EmptyState, formatDate, timeAgo, statusBadge, projectStatusBadge } from './utils.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return (
    <div className="empty-state">
      <div className="empty-state-icon">⚠️</div>
      <h3>Cannot load dashboard</h3>
      <p>{error}</p>
    </div>
  );

  const { stats, recentProjects, upcomingReleases } = data;

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: '◫',
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.12)',
      sub: 'Active initiatives',
    },
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: '✓',
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.12)',
      sub: 'Across all projects',
    },
    {
      label: 'Completed',
      value: stats.completedTasks,
      icon: '●',
      color: '#3fb950',
      bg: 'rgba(63,185,80,0.12)',
      sub: `${stats.completionRate}% completion rate`,
    },
    {
      label: 'Pending',
      value: stats.pendingTasks,
      icon: '○',
      color: '#f0883e',
      bg: 'rgba(240,136,62,0.12)',
      sub: 'Remaining work items',
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-card-label">{s.label}</span>
              <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
            <div className="stat-card-value">{s.value}</div>
            <div className="stat-card-sub">{s.sub}</div>
            {s.label === 'Completed' && (
              <div className="progress-bar" style={{ marginTop: 4 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${stats.completionRate}%`,
                    background: 'linear-gradient(90deg, #3fb950, #4ade80)',
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-col grid: recent projects + upcoming releases */}
      <div className="two-col-grid">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Projects</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{recentProjects.length} shown</span>
          </div>
          {recentProjects.length === 0 ? (
            <EmptyState icon="◫" title="No projects yet" description="Create your first project to get started." />
          ) : (
            <div className="activity-list">
              {recentProjects.map((p) => (
                <div key={p._id} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-text">
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {p.description || 'No description'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span className={`badge ${projectStatusBadge(p.status)}`}>{p.status}</span>
                    <span className="activity-time">{timeAgo(p.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Releases */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Releases</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{upcomingReleases.length} shown</span>
          </div>
          {upcomingReleases.length === 0 ? (
            <EmptyState icon="⬡" title="No upcoming releases" description="No releases with a future planned date." />
          ) : (
            <div className="activity-list">
              {upcomingReleases.map((r) => (
                <div key={r._id} className="activity-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{r.version}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                        {r.project?.name}
                      </span>
                    </div>
                    <span className={`badge ${r.readiness.isReady ? 'badge-green' : 'badge-red'}`}>
                      {r.readiness.isReady ? 'Ready' : 'Blocked'}
                    </span>
                  </div>
                  {/* Readiness progress */}
                  <div className="readiness-block">
                    <div className="readiness-bar-row">
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${r.readiness.percentage}%`,
                            background: r.readiness.isReady
                              ? 'linear-gradient(90deg, #3fb950, #4ade80)'
                              : 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                          }}
                        />
                      </div>
                      <span className="readiness-pct">{r.readiness.percentage}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {r.readiness.completed}/{r.readiness.total} tasks complete
                      {r.plannedDate ? ` · Due ${formatDate(r.plannedDate)}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Readiness rule explanation */}
      <div className="card" style={{ marginTop: 4 }}>
        <div className="card-header">
          <span className="card-title">ℹ️ How Release Readiness is Calculated</span>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            A release is marked <strong style={{ color: '#4ade80' }}>Ready</strong> when{' '}
            <strong>100% of the tasks</strong> belonging to its project are in the{' '}
            <span className="badge badge-green" style={{ verticalAlign: 'middle' }}>Completed</span>{' '}
            status. A release is <strong style={{ color: '#f87171' }}>Blocked</strong> if any task
            is still <em>To Do</em> or <em>In Progress</em>. The percentage shown is the live ratio
            of completed tasks to total tasks — it updates automatically as tasks are marked done.
            No value is hardcoded.
          </p>
        </div>
      </div>
    </div>
  );
}
