import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  withCredentials: true, // ESSENZIALE per inviare cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor per aggiungere token da localStorage come fallback
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor per gestire errori di autenticazione
instance.interceptors.response.use(
  (response) => {
    // Salva il token se presente nella risposta
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido
      localStorage.removeItem('token');
      // Evita loop infinito controllando se siamo già sulla pagina di login
      if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;