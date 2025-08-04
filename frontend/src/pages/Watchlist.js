import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
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
        setError(t('pleaseLogIn'));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/v1/media/watchlist');

        if (!res.ok) {
          throw new Error('Failed to fetch watchlist');
        }

        const data = await res.json();
        setWatchlist(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="watchlist-container">
      <h1>{t('myWatchlist')}</h1>
      {watchlist.length > 0 ? (
        <div className="watchlist-grid">
          {watchlist.map(item => (
            <div key={item.mediaId} className="watchlist-item">
              <Link to={`/media/${item.mediaType}/${item.mediaId}`}>
                <img src={`https://image.tmdb.org/t/p/w500${item.posterPath}`} alt={item.title} />
                <div className="watchlist-item-info">
                  <h3>{item.title}</h3>
                  <p>{new Date(item.releaseDate).getFullYear()}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>{t('emptyWatchlist')}</p>
      )}
    </div>
  );
};

export default Watchlist;