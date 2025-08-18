import { useTranslation } from 'react-i18next';
import './LanguageModal.css';

const LanguageModal = ({ onClose }) => {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    onClose();
  };

  return (
    <div className="lan-modal-overlay" onClick={onClose}>
      <div className="lan-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('selectLanguage')}</h2>
        <button className="language-button" onClick={() => changeLanguage('en')}>English</button>
        <button className="language-button" onClick={() => changeLanguage('it')}>Italiano</button>
      </div>
    </div>
  );
};

export default LanguageModal;