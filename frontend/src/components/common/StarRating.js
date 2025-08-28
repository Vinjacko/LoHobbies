import { useState } from 'react';
import './StarRating.css';

const StarRating = ({ rating, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  const isInteractive = !!onRatingChange;

  const handleMouseMove = (e, star) => {
    const rect = e.currentTarget.getBoundingClientRect(); // restituisce un oggetto con le dimensioni e la posizione rispetto alla viewport
    const percent = (e.clientX - rect.left) / rect.width;
    setHoverRating(star - (percent < 0.5 ? 0.5 : 0));   
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const handleClick = () => {
    onRatingChange(hoverRating);
  };

  return (
    <div className="star-rating" onMouseLeave={isInteractive ? handleMouseLeave : null}>
      {stars.map(star => {
        const displayRating = (isInteractive && hoverRating) ? hoverRating : rating;
        let starClass = 'star';
        if (displayRating >= star) {
          starClass += ' filled';
        } else if (displayRating >= star - 0.5) {
          starClass += ' half';
        }

        return (
          <span
            key={star}
            className={starClass}
            onMouseMove={isInteractive ? (e) => handleMouseMove(e, star) : null}
            onClick={isInteractive ? handleClick : null}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;