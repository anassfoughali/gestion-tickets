import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwt_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('jwt_token');
      sessionStorage.removeItem('user_info');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  subscribeToStats: (onData, onError) => {
    const token = sessionStorage.getItem('jwt_token');
    const eventSource = new EventSource(
      `${API_BASE_URL}/dashboard/stats/stream${token ? `?token=${token}` : ''}`
    );
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
    sessionStorage.removeItem('jwt_token');
    sessionStorage.removeItem('user_info');
  },
};

export const ticketsService = {
  getAll: () => api.get('/tickets'),
  getStatsParJour: () => api.get('/tickets/stats-par-jour'),
};

export const technicienService = {
  getAll: () => api.get('/techniciens'),
  getStatsGlobales: () => api.get('/techniciens/stats-globales'),
  getStats: (groupId) => api.get(`/techniciens/${groupId}`),
};

export const rapportsService = {
  getAll: () => api.get('/tickets'),
};

export default api;