import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (formData) => api.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (username) => api.get(`/users/${username}`),
  updateMe: (formData) => api.put('/users/me', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  follow: (username) => api.post(`/users/${username}/follow`),
  delete: (username) => api.delete(`/users/${username}`),
};

// ── Search ────────────────────────────────────────────────────
export const searchAPI = {
  search: (username) => api.post('/search', { username }),
  compare: (username) => api.post('/search/compare', { username }),
};

// ── Stats ─────────────────────────────────────────────────────
export const statsAPI = {
  get: () => api.get('/stats'),
};

// ── Helper ────────────────────────────────────────────────────
export function getPhotoUrl(photo_url) {
  if (!photo_url) return null;
  if (photo_url.startsWith('http')) return photo_url;
  return photo_url; // proxied through Vite → backend
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default api;
