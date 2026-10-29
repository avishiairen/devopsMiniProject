import { useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getProjects } from './api';
import { useToast, ConfirmDialog, Spinner, EmptyState, formatDate, statusBadge, priorityBadge } from './utils.jsx';

const STATUSES  = ['To Do', 'In Progress', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

function TaskModal({ task, projects, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!task?._id;

  const [form, setForm] = useState({
    title:       task?.title       || '',
    description: task?.description || '',
    status:      task?.status      || 'To Do',
    priority:    task?.priority    || 'Medium',
    dueDate:     task?.dueDate ? task.dueDate.substring(0, 10) : '',
    project:     task?.project?._id || task?.project || (projects[0]?._id || ''),
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Task title is required'); return; }
    if (!form.project)       { setFormError('Please select a project'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (isEdit) {
        await updateTask(task._id, form);
        toast('Task updated successfully');
      } else {
        await createTask(form);
        toast('Task created successfully');
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
          <span className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {formError && <div className="form-error" style={{ marginBottom: 14 }}>⚠ {formError}</div>}

            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input className="form-control" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Set up CI/CD pipeline" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" name="description" value={form.description} onChange={handleChange} placeholder="What needs to be done?" rows={2} />
            </div>
            <div className="form-group">
              <label className="form-label">Project *</label>
              <select className="form-control" name="project" value={form.project} onChange={handleChange}>
                <option value="">Select a project…</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select className="form-control" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Priority</label>
                <select className="form-control" name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0, marginTop: 16 }}>
              <label className="form-label">Due Date (optional)</label>
              <input className="form-control" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const toast = useToast();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modal, setModal]       = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filterProject) params.project = filterProject;
      if (filterStatus)  params.status  = filterStatus;
      const [t, p] = await Promise.all([getTasks(params), getProjects()]);
      setTasks(t);
      setProjects(p);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filterProject, filterStatus]);

  async function handleDelete(task) {
    try {
      await deleteTask(task._id);
      toast('Task deleted');
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
          <h2>Tasks</h2>
          <p>Track and manage all work items</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ New Task</button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-control" value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={{ width: 180 }}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select className="form-control" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 150 }}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(filterProject || filterStatus) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterProject(''); setFilterStatus(''); }}>Clear Filters</button>
        )}
      </div>

      <div className="card">
        {loading && <Spinner />}
        {error && <div className="empty-state"><div className="empty-state-icon">⚠️</div><h3>Error</h3><p>{error}</p></div>}

        {!loading && !error && tasks.length === 0 && (
          <EmptyState
            icon="✓"
            title="No tasks found"
            description={filterProject || filterStatus ? 'No tasks match the selected filters.' : 'Create your first task to get started.'}
            action={<button className="btn btn-primary" onClick={() => setModal({})}>+ New Task</button>}
          />
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>
                      {t.description && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {t.description.length > 60 ? t.description.substring(0, 60) + '…' : t.description}
                        </div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.project?.name || '—'}</td>
                    <td><span className={`badge ${statusBadge(t.status)}`}>{t.status}</span></td>
                    <td><span className={`badge ${priorityBadge(t.priority)}`}>{t.priority}</span></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDate(t.dueDate)}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn btn-secondary btn-sm" onClick={() => setModal({ task: t })}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(t)}>Del</button>
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
        <TaskModal
          task={modal.task}
          projects={projects}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete task "${confirmDelete.title}"? This action cannot be undone.`}
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
