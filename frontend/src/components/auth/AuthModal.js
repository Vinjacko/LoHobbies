import { useState, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import './AuthModal.css';
import AuthContext from '../../context/AuthContext';

const AuthModal = ({ closeModal }) => {
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
    }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        '/api/v1/auth/register',
        { name: registerName, email: registerEmail, password: registerPassword },
        { withCredentials: true }
      );
      console.log('Risposta registrazione:', data);
      console.log('User dalla registrazione:', data.user);
      login(data.user);
      closeModal(); 

    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError(t('unexpectedError'));
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(
        '/api/v1/auth/login',
        { email: loginEmail, password: loginPassword, rememberMe },
        { withCredentials: true }
      );
      console.log('Risposta login:', data);
      console.log('User dal login:', data.user);
      login(data.user);
      closeModal();
      
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError(t('unexpectedError'));
      }
    }
    setLoading(false);
  };

  return ReactDOM.createPortal(
   <div className="auth-modal-overlay" onClick={closeModal}>   
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>   
        <div className="auth-modal-tabs"> 
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}   
            onClick={() => setActiveTab('login')}
          >
            {t('login')}
          </button>
          <button
            className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            {t('register')}
          </button>
        </div>
        <div className="auth-modal-body">  
          {activeTab === 'login' ? (
            <div className="login-form">
              <h2>{t('login')}</h2>
              <form onSubmit={handleLogin}>
                <div className="auth-form-group">
                  <label htmlFor="login-email">{t('emailAddress')}</label>
                  <input type="email" id="login-email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </div>
                <div className="auth-form-group">
                  <label htmlFor="login-password">{t('password')}</label>
                  <input type="password" id="login-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <div className="auth-form-group-row">
                  <div className="remember-me">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me">{t('rememberMe')}</label>
                  </div>
                </div>
                {error && activeTab === 'login' && <p className="error-message">{error}</p>}
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading && activeTab === 'login' ? t('loggingIn') : t('login')}
                </button>
              </form>
            </div>
          ) : (
            <div className="register-form">
              <h2>{t('register')}</h2>
              <form onSubmit={handleRegister}>

                <div className="auth-form-group">
                  <label htmlFor="register-name">{t('name')}</label>
                  <input type="text" id="register-name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="register-email">{t('emailAddress')}</label>
                  <input type="email" id="register-email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="register-password">{t('password')}</label>
                  <input type="password" id="register-password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="confirm-password">{t('confirmPassword')}</label>
                  <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                {error && activeTab === 'register' && <p className="error-message">{error}</p>}
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading && activeTab === 'register' ? t('registering') : t('register')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;