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
            if (user) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/favourites`);
                    setFavourites(response.data.data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFavourites();
    }, [user]);

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="watchlist-container">
            <h1>{t('yourFavourites')}</h1>
            {favourites.length > 0 ? (
                <div className="watchlist-grid">
                    {favourites.map(item => (
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
                <p>{t('noFavourites')}</p>
            )}
        </div>
    );
};

export default Favourites;