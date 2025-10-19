import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from '../api/axios';
import './Watchlist.css';

const Watchlist = () => {
  const { t } = useTranslation();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/v1/media/watchlist');
        setWatchlist(res.data.data);
      } catch (err) {
        console.error('Errore nel caricamento della watchlist:', err);
        setError(err.response?.data?.msg || err.message || t('servererror'));
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user, t]);

  if (loading) {
    return <div className="loading-message">{t('loading')}</div>;
  }

  if (error) {
    return <div className="error-message-page">{error}</div>;
  }

  return (
    <div className="watchlist-container">
      <h1>{t('myWatchlist')}</h1>
      {watchlist.length > 0 ? (
        <div className="watchlist-grid">
          {watchlist.map(item => (
            <div key={item.mediaId} className="watchlist-item">
              <Link to={`/media/${item.mediaType}/${item.mediaId}`}>
                <img 
                  src={`https://image.tmdb.org/t/p/w500${item.posterPath}`} 
                  alt={item.title}
                  loading="lazy"
                  width="180"
                  height="270"
                />
                <div className="watchlist-item-info">
                  <h3>{item.title}</h3>
                  <p>{new Date(item.releaseDate).getFullYear()}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">{t('emptyWatchlist')}</p>
      )}
    </div>
  );
};

export default Watchlist;