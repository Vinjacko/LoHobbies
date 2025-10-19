import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Watchlist.css';

const Favourites = () => {
    const { t } = useTranslation();
    const [favourites, setFavourites] = useState([]);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavourites = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            
            try {
                const response = await axios.get('/api/v1/media/favourites');
                setFavourites(response.data.data);
            } catch (err) {
                console.error('Errore nel caricamento dei preferiti:', err);
                setError(err.response?.data?.msg || err.message || t('servererror'));
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [user, t]);

    if (loading) {
        return <div className="loading-message">{t('loading')}</div>;
    }

    if (error) {
        return <div className="error-message-page">{error}</div>;
    }

    return (
        <div className="watchlist-container">
            <h1>{t('yourFavourites')}</h1>
            {favourites.length > 0 ? (
                <div className="watchlist-grid">
                    {favourites.map(item => (
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
                <p className="empty-message">{t('noFavourites')}</p>
            )}
        </div>
    );
};

export default Favourites;