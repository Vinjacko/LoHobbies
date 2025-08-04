import React from 'react';
import './CommentModal.css';

const CommentModal = ({ comment, onClose }) => {
  if (!comment) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Recensione</h2>
        <p>{comment}</p>
        <div className="modal-actions">
          <button onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;