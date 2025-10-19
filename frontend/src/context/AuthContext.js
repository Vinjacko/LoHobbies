import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();   

  // Funzione per caricare l'utente dall'endpoint di verifica
  const loadUser = useCallback(async () => {
    try {
      const res = await axios.get(`/api/v1/auth?t=${new Date().getTime()}`);  
      setUser(res.data);

    } catch (err) {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Carica l'utente all'inizio (verifica se ci sono cookie validi)
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      // risposta andata a buon fine
      response => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Verifica che ci sia una risposta e che sia 401
        if (error.response?.status === 401 && 
            originalRequest?.url !== '/api/v1/auth/refresh' && 
            !originalRequest?._retry) {
          
          originalRequest._retry = true;
          
          console.log('Token scaduto, tentativo di refresh...');
          
          try {
            const response = await axios.post('/api/v1/auth/refresh');
            console.log('Refresh completato con successo');
            
            // Riprova la richiesta originale
            return axios(originalRequest);     
          } catch (refreshError) {
            console.error('Refresh fallito:', refreshError);
            
            // Solo se il refresh fallisce veramente, disconnetti l'utente
            if (refreshError.response?.status === 401) {
              console.log('Refresh token non valido, disconnessione utente');
              setUser(null);
              navigate('/');
            }
            
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  const login = (userData) => {
    console.log('Login chiamato con userData:', userData);
    setUser(userData);
    // Non chiamiamo loadUser qui perché abbiamo già i dati dell'utente
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
      setUser(null);
      navigate('/');
      
    } catch (err) {
      console.error('Logout fallito', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;