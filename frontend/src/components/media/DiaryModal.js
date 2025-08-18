import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import StarRating from '../common/StarRating';
import './DiaryModal.css';
import { useTranslation } from 'react-i18next';

const DiaryModal = ({ media, closeModal, onSave }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [watchedDate, setWatchedDate] = useState(new Date());

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = () => {
    onSave(rating, comment, watchedDate);
    closeModal();
  };

  return (
    <div className="diary-modal-overlay">
      <div className="diary-modal-content">
        <h2>{t('addToDiary')}</h2>
        <DatePicker selected={watchedDate} onChange={(date) => setWatchedDate(date)} dateFormat="dd-MM-yyyy" />
        <h3>{media.title || media.name}</h3>
        <div className="diary-rating-container">
          <span className="diary-rating-label">{t('rating')}:</span>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        <textarea
          className="diary-comment-box"
          placeholder={t('addComment')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="diary-modal-actions">
          <button onClick={closeModal}>{t('reset')}</button>
          <button onClick={handleSave}>{t('save')}</button>
        </div>
      </div>
    </div>
  );
};

export default DiaryModal;