import { useTranslation } from 'react-i18next';
import './SuccessModal.css';

const SuccessModal = ({ message, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{t('success')}</h2>
        <p>{message}</p>
        <button onClick={onClose}>{t('close')}</button>
      </div>
    </div>
  );
};

export default SuccessModal;