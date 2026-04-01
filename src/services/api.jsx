import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  subscribeToStats: (onData, onError) => {
    const eventSource = new EventSource(`${API_BASE_URL}/dashboard/stats/stream`);
    eventSource.addEventListener('dashboard', (e) => {
      try { onData(JSON.parse(e.data)); } catch (err) { console.error('Parse error', err); }
    });
    eventSource.onerror = (e) => { console.error('SSE error', e); if (onError) onError(e); };
    return () => eventSource.close();
  }
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};

export const ticketsService = {
  getAll:          () => api.get('/tickets'),
  getStatsParJour: () => api.get('/tickets/stats-par-jour'),
};

//  Techniciens
export const technicienService = {
  getAll:           () => api.get('/techniciens'),
  getStatsGlobales: () => api.get('/techniciens/stats-globales'),
  getStats:         (groupId) => api.get(`/techniciens/${groupId}`),
};

export default api;