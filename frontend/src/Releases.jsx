import { useEffect, useState } from 'react';
import { getReleases, createRelease, updateRelease, deleteRelease, getProjects } from './api';
import { useToast, ConfirmDialog, Spinner, EmptyState, formatDate, statusBadge } from './utils.jsx';

function ReleaseModal({ release, projects, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!release?._id;

  const [form, setForm] = useState({
    version:     release?.version     || '',
    notes:       release?.notes       || '',
    project:     release?.project?._id || release?.project || (projects[0]?._id || ''),
    plannedDate: release?.plannedDate ? release.plannedDate.substring(0, 10) : '',
  });
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.version.trim()) { setFormError('Version number is required'); return; }
    if (!form.project)         { setFormError('Please select a project'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (isEdit) {
        await updateRelease(release._id, form);
        toast('Release updated successfully');
      } else {
        await createRelease(form);
        toast('Release created successfully');
      }
      onSaved();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Release' : 'New Release'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {formError}</div>}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Version Number *</label>
                <input className="form-control" name="version" value={form.version} onChange={handleChange} placeholder="e.g. v1.0.0" autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Planned Date</label>
                <input className="form-control" type="date" name="plannedDate" value={form.plannedDate} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-control" name="project" value={form.project} onChange={handleChange}>
                <option value="">Select a project…</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Release Notes</label>
              <textarea className="form-control" name="notes" value={form.notes} onChange={handleChange} placeholder="What's included in this release?" rows={4} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Small inline readiness widget
function ReadinessCell({ r }) {
  const { percentage, completed, total, isReady } = r;
  return (
    <div style={{ minWidth: 140 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span className={`badge ${isReady ? 'badge-green' : 'badge-red'}`}>
          {isReady ? '✓ Ready' : '✕ Blocked'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            background: isReady
              ? 'linear-gradient(90deg, #3fb950, #4ade80)'
              : 'linear-gradient(90deg, #f85149, #f87171)',
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
        {completed}/{total} tasks completed
      </div>
    </div>
  );
}

export default function Releases() {
  const toast = useToast();
  const [releases, setReleases] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [r, p] = await Promise.all([getReleases(), getProjects()]);
      setReleases(r);
      setProjects(p);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(release) {
    try {
      await deleteRelease(release._id);
      toast('Release deleted');
      setConfirmDelete(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-group">
          <h2>Releases</h2>
          <p>Track release readiness — a release is Ready only when all project tasks are Completed</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ New Release</button>
      </div>

      {/* Readiness rule callout */}
      <div
        style={{
          background: 'rgba(139,92,246,0.07)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        📋 <strong style={{ color: 'var(--text-primary)' }}>Readiness Rule:</strong> A release is{' '}
        <span className="badge badge-green" style={{ verticalAlign: 'middle' }}>Ready</span> when{' '}
        <strong>all tasks</strong> in the associated project are <em>Completed</em>. Even one{' '}
        <em>To Do</em> or <em>In Progress</em> task marks the release as{' '}
        <span className="badge badge-red" style={{ verticalAlign: 'middle' }}>Blocked</span>. No values are hardcoded.
      </div>

      <div className="card">
        {loading && <Spinner />}
        {error && <div className="empty-state"><div className="empty-state-icon">⚠️</div><h3>Error</h3><p>{error}</p></div>}

        {!loading && !error && releases.length === 0 && (
          <EmptyState
            icon="⬡"
            title="No releases yet"
            description="Create your first release and link it to a project to track readiness."
            action={<button className="btn btn-primary" onClick={() => setModal({})}>+ New Release</button>}
          />
        )}

        {!loading && !error && releases.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Project</th>
                  <th>Release Notes</th>
                  <th>Readiness</th>
                  <th>Planned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13.5, color: 'var(--accent-violet)' }}>
                        {r.version}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{r.project?.name || '—'}</td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {r.notes
                          ? (r.notes.length > 80 ? r.notes.substring(0, 80) + '…' : r.notes)
                          : <em style={{ color: 'var(--text-muted)' }}>No notes</em>}
                      </span>
                    </td>
                    <td><ReadinessCell r={r.readiness} /></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDate(r.plannedDate)}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ release: r })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(r)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <ReleaseModal
          release={modal.release}
          projects={projects}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete release "${confirmDelete.version}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
