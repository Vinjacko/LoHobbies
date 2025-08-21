import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';

//  utilizziamo un 'contenitore' che serve a condividere dati e funzioni tra più componenti senza dover passare continuamente le props
const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  loadUser: async () => {},
});

//  componente il cui scopo è condividere dati e funzioni relative all'autenticazione con tutti i componenti che ne hanno bisogno,
// senza dover passare le props manualmente attraverso ogni livello dell'albero dei componenti
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();   // utilizzato per reindirizzare l'utente ad un diverso URL

  // gestione dei side effects
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      // risposta andata a buon fine
      response => response,
      // crea un sistema che alla scadenza di un access token, tenta automaticamente di ottenerne uno nuovo e di ripetere l'operazione fallita
      async (error) => {
        const originalRequest = error.config; // copia della configurazione della richiesta originale
        if (error.response.status === 401 && originalRequest.url !== '/api/v1/auth/refresh' && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await axios.post('/api/v1/auth/refresh');
            return axios(originalRequest);    // riesecuzione della richiesta originale 
          } catch (refreshError) {
            setUser(null);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    //  funzione di cleanup, eseguita quando il componente (AuthProvider) viene smontato, per rimuovere l'intercettore di risposta (deve esisterne solo 1)
    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const loadUser = async () => {
    try {
      const res = await axios.get(`/api/v1/auth?t=${new Date().getTime()}`);  // utilizzato per far in modo che il browser invii ogni volta una nuova richiesta al server
      setUser(res.data);
    } catch (err) {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    loadUser();
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