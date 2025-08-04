import React from 'react';
import { useTranslation } from 'react-i18next';
import './SuccessModal.css';

const SuccessModal = ({ message, closeModal }) => {
  const { t } = useTranslation();

  return (
    <div className="success-modal-overlay" onClick={closeModal}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('success')}</h2>
        <p>{message}</p>
        <button onClick={closeModal}>{t('close')}</button>
      </div>
    </div>
  );
};

export default SuccessModal;