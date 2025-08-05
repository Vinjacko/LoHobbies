import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StarRating from '../components/common/StarRating';
import CommentModal from '../components/media/CommentModal';
import './Diary.css';

const Diary = () => {
  const { t } = useTranslation();
  const [diary, setDiary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchDiary = async () => {
      try {
        const res = await fetch('/api/v1/media/diary', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setDiary(data.data);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Server Error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDiary();
    }
  }, [user]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div>{t('error')}: {error}</div>;
  }

  return (
    <div className="diary-container">
      <h1>{t('myDiary')}</h1>
      {diary.length === 0 ? (
        <p>{t('noDiaryItems')}</p>
      ) : (
        <div className="diary-grid">
          {diary.map((entry) => (
            <div key={entry.mediaId} className="diary-entry">
              <Link to={`/media/${entry.mediaType}/${entry.mediaId}`}>
                <img src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`} alt={entry.title} />
              </Link>
              <div className="diary-entry-content">
                <h2>{entry.title}</h2>
                <p>{t('watchedOn')}: {new Date(entry.watchedDate).toLocaleDateString()}</p>
                <StarRating rating={entry.rating} />
                <button className="review-button" onClick={() => setSelectedComment(entry.comment)}>{t('review')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedComment && (
        <CommentModal
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
        />
      )}
    </div>
  );
};

export default Diary;