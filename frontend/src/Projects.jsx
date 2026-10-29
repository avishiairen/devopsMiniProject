import { useEffect, useState } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from './api';
import { useToast, ConfirmDialog, Spinner, EmptyState, formatDate, projectStatusBadge } from './utils.jsx';

const STATUSES = ['Planning', 'Active', 'On Hold', 'Completed'];

function ProjectModal({ project, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!project?._id;

  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Planning',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setFormError('Project name is required'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (isEdit) {
        await updateProject(project._id, form);
        toast('Project updated successfully');
      } else {
        await createProject(form);
        toast('Project created successfully');
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
          <span className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {formError}</div>}
            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Project Alpha" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="What is this project about?" rows={3} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null); // null | { project? }
  const [confirmDelete, setConfirmDelete] = useState(null); // project to delete

  async function load() {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(project) {
    try {
      await deleteProject(project._id);
      toast('Project and its tasks/releases deleted', 'success');
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
          <h2>Projects</h2>
          <p>Manage all your software projects</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          + New Project
        </button>
      </div>

      {loading && <Spinner />}
      {error && <div className="empty-state"><div className="empty-state-icon">⚠️</div><h3>Error loading projects</h3><p>{error}</p></div>}

      {!loading && !error && projects.length === 0 && (
        <EmptyState
          icon="◫"
          title="No projects yet"
          description="Create your first project to start tracking tasks and releases."
          action={<button className="btn btn-primary" onClick={() => setModal({})}>+ New Project</button>}
        />
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="project-cards-grid">
          {projects.map((p) => {
            const completionPct = p.taskCount === 0 ? 0 : Math.round((p.completedTaskCount / p.taskCount) * 100);
            return (
              <div key={p._id} className="project-card">
                <div className="project-card-header">
                  <div className="project-card-name">{p.name}</div>
                  <span className={`badge ${projectStatusBadge(p.status)}`}>{p.status}</span>
                </div>
                <div className="project-card-desc">{p.description || 'No description provided.'}</div>

                {/* Task progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>Task progress</span>
                    <span>{p.completedTaskCount}/{p.taskCount} tasks</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${completionPct}%`,
                        background: 'linear-gradient(90deg, var(--accent-violet), var(--accent-blue))',
                      }}
                    />
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="project-card-meta">Created {formatDate(p.createdAt)}</div>
                  <div className="actions-cell">
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal({ project: p })}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(p)}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ProjectModal
          project={modal.project}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${confirmDelete.name}"? This will also permanently delete all its tasks and releases.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
