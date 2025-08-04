import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import StarRating from '../common/StarRating';
import './DiaryModal.css';

const DiaryModal = ({ media, onClose, onSave }) => {
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
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Aggiungi al diario</h2>
        <DatePicker selected={watchedDate} onChange={(date) => setWatchedDate(date)} />
        <h3>{media.title || media.name}</h3>
        <div className="rating-container">
          <span className="rating-label">Valutazione:</span>
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
        <textarea
          className="comment-box"
          placeholder="Aggiungi un commento..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={onClose}>Annulla</button>
          <button onClick={handleSave}>Salva</button>
        </div>
      </div>
    </div>
  );
};

export default DiaryModal;