import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StarRating from '../components/common/StarRating';
import CommentModal from '../components/media/CommentModal';
import axios from '../api/axios';
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
        const res = await axios.get('/api/v1/media/diary');
        const sortedDiary = res.data.data.sort((a, b) => new Date(b.watchedDate) - new Date(a.watchedDate));
        setDiary(sortedDiary);
      } catch (err) {
        setError (t('servererror'));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDiary();
    }
  }, [user, t]);

  const handleRemove = async (id) => {
    try {
      await axios.delete(`/api/v1/media/diary/${id}`);
      setDiary(diary.filter((entry) => entry._id !== id));
    } catch (err) {
      setError(t('servererror'));
    }
  };

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
            <div key={entry._id} className="diary-entry">
              <Link to={`/media/${entry.mediaType}/${entry.mediaId}`}>
                <img src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`} alt={entry.title} />
              </Link>
              <div className="diary-entry-content">
                <h2>{entry.title}</h2>
                <p>{t('watchedOn')}: {new Date(entry.watchedDate).toLocaleDateString('it-IT')}</p>
                <StarRating rating={entry.rating} />
                <div className="diary-entry-buttons">
                  <button className="review-button" onClick={() => setSelectedComment(entry.comment)}>{t('review')}</button>
                  <button className="remove-button" onClick={() => handleRemove(entry._id)}>{t('remove')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedComment && (
        <CommentModal
          comment={selectedComment}
          closeModal={() => setSelectedComment(null)}
        />
      )}
    </div>
  );
};

export default Diary;