import axios from 'axios';

// Configuration de base pour l'API Spring Boot
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082/api';

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

api.interceptors.response.use (
  (response) => response,
  (error) => {
    if (error.response?.status === 401){
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// Dashnord - données temps réel pour les graphiques
export const dashboardService = {
  // Rest - snapshot
  getStats: () => api.get('/dashboard/stats'),
  //SSE -streaming
  subscribeToStats:(onData, onError) => {
    const eventSource = new EventSource(
      `${API_BASE_URL}/dashboard/stats/stream`,
    );
    eventSource.addEventListener('dashboard', (e) =>{
      try {
        onData(JSON.parse(e.data));
      }catch (err) {
        console.error('Parse error', err);
      }
    });
    eventSource.onerror = (e) => {
      console.error('SSE erro' , e);
      if (onError) onError(e);
    };
    //retourne pour fermer la connexion
    return () => eventSource.close();
  }
}


// Services d'authentification
export const authService = {
  login:(credentials) => api.post('/auth/login', credentials),
  logout:() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};

// Services des tickets
export const ticketsService = {
  getAll:        () => api.get('/tickets'),
  getStatsParJour: () => api.get('/tickets/stats-par-jour'),
};



export default api;
