import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();   

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      // risposta andata a buon fine
      response => response,
      async (error) => {
        const originalRequest = error.config; 
        if (error.response.status === 401 && originalRequest.url !== '/api/v1/auth/refresh' && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await axios.post('/api/v1/auth/refresh');
            return axios(originalRequest);     
          } catch (refreshError) {
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get(`/api/v1/auth?t=${new Date().getTime()}`);  
      setUser(res.data);
      
      // Salva il token se presente nella risposta
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }

    } catch (err) {
      console.error('Errore caricamento utente:', err);
      setUser(null);
      // Rimuovi token non valido
      localStorage.removeItem('token');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    
    // Salva il token se presente
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }
    
    loadUser();
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
    } catch (err) {
      console.error('Logout fallito', err);
    } finally {
      // Pulizia sempre eseguita
      setUser(null);
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;