import axios from 'axios';

// Configuration de base pour l'API Spring Boot
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Instance axios avec configuration par défaut
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};

// Services des tickets
export const ticketService = {
  getAllTickets: () => api.get('/tickets'),
  getMyTickets: () => api.get('/tickets/my-tickets'),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  updateTicketStatus: (id, status) => api.patch(`/tickets/${id}/status`, { status }),
  updateTicketPriority: (id, priority) => api.patch(`/tickets/${id}/priority`, { priority }),
  deleteTicket: (id) => api.delete(`/tickets/${id}`),
  addComment: (ticketId, comment) => api.post(`/tickets/${ticketId}/comments`, { comment }),
};

// Services des statistiques (Admin)
export const statsService = {
  getDashboardStats: () => api.get('/stats/dashboard'),
  getTicketsByStatus: () => api.get('/stats/tickets-by-status'),
  getTicketsByClient: () => api.get('/stats/tickets-by-client'),
};

// Services utilisateurs
export const userService = {
  getCurrentUser: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAllClients: () => api.get('/users/clients'),
};

export default api;
