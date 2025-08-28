import { useEffect } from 'react';
import './CommentModal.css';
import { useTranslation } from 'react-i18next';

const CommentModal = ({ comment, closeModal }) => {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const { t } = useTranslation();
  if (!comment) {
    return null;
  }

  return (
    <div className="comment-modal-overlay">
      <div className="comment-modal-content">
        <h2>{t('review')}</h2>
        <p>{comment}</p>
        <div className="comment-modal-actions">
          <button onClick={closeModal}>{t('close')}</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;