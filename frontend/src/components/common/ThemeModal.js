import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import './ThemeModal.css';
import ThemeContext from '../../context/ThemeContext';

const ThemeModal = ({ onClose }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useContext(ThemeContext);

  const handleSetTheme = (selectedTheme) => {
    setTheme(selectedTheme);
    onClose();
  };

  return (
    <div className="theme-modal-overlay" onClick={onClose}>
      <div className="theme-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('theme')}</h2>
        <div className="theme-options">
          <button onClick={() => handleSetTheme('light')} disabled={theme === 'light'}>
            <img src="/img/stormtrooper-512.png" alt="light mode" />
          </button>
          <button onClick={() => handleSetTheme('dark')} disabled={theme === 'dark'}>
            <img src="/img/darth_vader.png" alt="dark mode" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeModal;