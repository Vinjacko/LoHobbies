import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageModal.css';

const LanguageModal = ({ closeModal }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('selectLanguage')}</h2>
        <button className="language-button" onClick={() => changeLanguage('en')}>English</button>
        <button className="language-button" onClick={() => changeLanguage('it')}>Italiano</button>
        {/* Add more languages here */}
      </div>
    </div>
  );
};

export default LanguageModal;