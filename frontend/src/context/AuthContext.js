import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  loadUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true; // Send cookies with requests

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
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
      const res = await axios.get('/api/v1/auth');
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
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;