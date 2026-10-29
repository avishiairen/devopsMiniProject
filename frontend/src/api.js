// Central API helper — all requests go through here
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

// Dashboard
export const getDashboard = () => request('/dashboard');

// Projects
export const getProjects    = () => request('/projects');
export const getProject     = (id) => request(`/projects/${id}`);
export const createProject  = (body) => request('/projects', { method: 'POST', body: JSON.stringify(body) });
export const updateProject  = (id, body) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteProject  = (id) => request(`/projects/${id}`, { method: 'DELETE' });

// Tasks
export const getTasks       = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/tasks${qs ? '?' + qs : ''}`);
};
export const createTask     = (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) });
export const updateTask     = (id, body) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteTask     = (id) => request(`/tasks/${id}`, { method: 'DELETE' });

// Releases
export const getReleases    = () => request('/releases');
export const createRelease  = (body) => request('/releases', { method: 'POST', body: JSON.stringify(body) });
export const updateRelease  = (id, body) => request(`/releases/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteRelease  = (id) => request(`/releases/${id}`, { method: 'DELETE' });
