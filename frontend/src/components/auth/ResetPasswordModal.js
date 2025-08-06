import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import './ResetPasswordModal.css';
import { useNavigate } from 'react-router-dom';
import SuccessModal from '../common/SuccessModal';

const ResetPasswordModal = ({ closeModal }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState('verify'); // 'verify' or 'reset'
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/v1/auth/verify-password', { password });
      setStep('reset');
    } catch (err) {
      setError('Password errata');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      await axios.post('/api/v1/auth/reset-password', { newPassword });
      setSuccessMessage('Password modificata con successo');
    } catch (err) {
      setError(err.response?.data?.message || t('unexpectedError'));
    }
    setLoading(false);
  };

  return (
    <>
      {successMessage && <SuccessModal message={successMessage} closeModal={() => { setSuccessMessage(''); closeModal(); }} />}
      <div className="reset-password-modal-overlay" onClick={closeModal}>
        <div className="reset-password-modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>{t('resetPassword')}</h2>
          {step === 'verify' ? (
            <form onSubmit={handleVerifyPassword}>
              <div className="form-group">
                <label htmlFor="password">{t('password')}</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? t('hide') : t('show')}
                  </span>
                </div>
                {error && <p className="error-message">{error}</p>}
              </div>
              <div className="button-group">
                <button type="submit" disabled={loading}>
                  {loading ? t('loading') : t('continue')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="newPassword">{t('newPassword')}</label>
                <div className="password-input-container">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? t('hide') : t('show')}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <div className="password-input-container">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? t('hide') : t('show')}
                  </span>
                </div>
              </div>
              <div className="button-group">
                <button type="submit" disabled={loading}>
                  {loading ? t('loading') : t('resetPassword')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ResetPasswordModal;