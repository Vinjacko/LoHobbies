import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import i18n from '../i18n';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import './MediaPage.css';
import CastCarousel from '../components/media/CastCarousel';
import MediaCarousel from '../components/media/MediaCarousel';
import TrailerModal from '../components/media/TrailerModal';
import DiaryModal from '../components/media/DiaryModal';

const MediaPage = () => {
    const [media, setMedia] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [showDiaryModal, setShowDiaryModal] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [similarByGenre, setSimilarByGenre] = useState([]);
    const { media_type, id } = useParams();
    const auth = useContext(AuthContext);
    const { t } = useTranslation();
    const [showNotification, setShowNotification] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isInFavourites, setIsInFavourites] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('');

    useEffect(() => {
        // Reset state when dependencies change to show loading state
        setMedia(null);
        setRecommendations([]);
        setSimilarByGenre([]);

        const fetchMedia = async () => {
            try {
                // Fetch main media details
                const mediaRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/${media_type}/${id}?language=${i18n.language}`);
                setMedia(mediaRes.data.data);

                // Fetch recommendations
                const recommendationsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/${media_type}/${id}/recommendations?language=${i18n.language}`);
                setRecommendations(recommendationsRes.data.data.slice(0, 12));

                // Fetch similar media by genre
                if (mediaRes.data.data.genres && mediaRes.data.data.genres.length > 0) {
                    const genreId = mediaRes.data.data.genres[0].id;
                    const similarRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/discover?genres=${genreId}&mediaType=${media_type}&language=${i18n.language}`);
                    const filteredSimilar = similarRes.data.data
                        .filter(item => item.id !== parseInt(id))
                        .slice(0, 12);
                    setSimilarByGenre(filteredSimilar);
                }
            } catch (error) {
                console.error("Could not fetch media data:", error);
            }
        };

        fetchMedia();
    }, [media_type, id, i18n.language]);

    useEffect(() => {
        const checkWatchlist = async () => {
            if (auth && auth.user) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/watchlist`);
                    const inWatchlist = response.data.data.some(item => item.mediaId === id);
                    setIsInWatchlist(inWatchlist);
                } catch (error) {
                    console.error("Failed to fetch watchlist", error);
                }
            }
        };
        checkWatchlist();
    }, [auth, id]);

    useEffect(() => {
        const checkFavourites = async () => {
            if (auth && auth.user) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/favourites`);
                    const inFavourites = response.data.data.some(item => item.mediaId === id);
                    setIsInFavourites(inFavourites);
                } catch (error) {
                    console.error("Failed to fetch favourites", error);
                }
            }
        };
        checkFavourites();
    }, [auth, id]);

    if (!media || (auth && auth.loading)) {
        return <div>{t('loading')}</div>;
    }

    const director = media.credits.crew.find(person => person.job === 'Director');
    let cast = media.credits.cast.slice(0, 20).map(actor => ({
        id: actor.id,
        nomeAttore: actor.name,
        nomePersonaggio: actor.character,
        urlImmagine: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : '/img/Actor_Placeholder.png'
    }));
    
    if (director) {
        const directorAsActor = {
            id: director.id,
            nomeAttore: director.name,
            nomePersonaggio: t('director'),
            urlImmagine: director.profile_path ? `https://image.tmdb.org/t/p/w185${director.profile_path}` : '/img/Actor_Placeholder.png'
        };
        cast = [directorAsActor, ...cast];
    }
    const title = media.title || media.name;
    const release_date = media.release_date || media.first_air_date;

    const trailer = media.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');

    const handleToggleWatchlist = async () => {
        if (!auth || !auth.user) {
            return;
        }
        try {
            if (isInWatchlist) {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/media/watchlist/${media.id}`);
                setNotificationMessage(t('removedFromWatchlist'));
                setNotificationType('error');
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/media/watchlist`, {
                    mediaId: media.id,
                    mediaType: media_type,
                    posterPath: media.poster_path,
                    title: media.title || media.name,
                    releaseDate: media.release_date || media.first_air_date
                });
                setNotificationMessage(t('addToWatchlist'));
                setNotificationType('success');
            }
            setIsInWatchlist(!isInWatchlist);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            console.error("Failed to toggle watchlist", error);
        }
    };

    const handleToggleFavourite = async () => {
        if (!auth || !auth.user) {
            // Handle case where user is not logged in
            return;
        }
        try {
            if (isInFavourites) {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/v1/media/favourites/${media.id}`);
                setNotificationMessage(t('removedFromFavourites'));
                setNotificationType('error');
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/media/favourites`, {
                    mediaId: media.id,
                    mediaType: media_type,
                    posterPath: media.poster_path,
                    title: media.title || media.name,
                    releaseDate: media.release_date || media.first_air_date
                });
                setNotificationMessage(t('addedToFavourites'));
                setNotificationType('success');
            }
            setIsInFavourites(!isInFavourites);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            console.error("Failed to toggle favourite", error);
        }
    };

    const handleSaveToDiary = async (rating, comment, watchedDate) => {
        if (!auth || !auth.user) {
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/v1/media/diary`, {
                mediaId: media.id,
                mediaType: media_type,
                posterPath: media.poster_path,
                title: media.title || media.name,
                releaseDate: media.release_date || media.first_air_date,
                rating: rating,
                comment: comment,
                watchedDate: watchedDate,
            });
            // Optionally, show a notification
        } catch (error) {
            console.error("Failed to add to diary", error);
        }
    };

    return (
        <div className="media-page">
            {showNotification && (
                <div className={`notification ${notificationType}`}>
                    <i className={`fas ${notificationType === 'success' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    {notificationMessage}
                </div>
            )}
            <div className="media-header" style={{backgroundImage: `url(https://image.tmdb.org/t/p/original${media.backdrop_path})`}}>
                <div className="media-header-overlay">
                    <div className="media-header-content">
                        <button className={`favorite-button ${isInFavourites ? 'is-favorite' : ''}`} onClick={handleToggleFavourite}>
                            <i className="fas fa-heart"></i>
                        </button>
                        {media.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w500${media.poster_path}`} alt={title} />
                        ) : (
                            <img src='/img/content_placeholder.jpg' alt='Placeholder' />
                        )}
                        <div className="media-info">
                            <h1>{title} ({new Date(release_date).getFullYear()})</h1>
                            <div className="genres">
                                {media.genres.map(genre => <span key={genre.id}>{genre.name}</span>)}
                            </div>
                            <div className="stats-container">
                                <div className="rating">
                                    <h3>{t('rating')}</h3>
                                    <p>{(media.vote_average / 2).toFixed(1)}/5</p>
                                </div>
                                {media_type === 'tv' && media.number_of_episodes && (
                                    <div className="episodes">
                                        <h3>{t('episodes')}</h3>
                                        <p>{media.number_of_episodes}</p>
                                    </div>
                                )}
                            </div>
                            <p className="tagline">{media.tagline}</p>
                            <h3>{t('description')}</h3>
                            <p className="overview">{media.overview}</p>
                            <div className="media-actions">
                                {trailer && (
                                    <button className="trailer-button" onClick={() => setShowTrailer(true)}>
                                        <i className="fas fa-play"></i> {t('watchTrailer')}
                                    </button>
                                )}
                                <div className="user-actions">
                                    <button className="watchlist-button" onClick={handleToggleWatchlist}>
                                        <i className={`fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}`}></i> {isInWatchlist ? t('alreadyInWatchlist') : t('addToWatchlist')}
                                    </button>
                                    <button className="diary-button" onClick={() => setShowDiaryModal(true)}>
                                        <i className="fas fa-book"></i> {t('addToDiary')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="media-details">
                <div className="left-column">
                    <CastCarousel cast={cast} title={t('cast')} />
                    <MediaCarousel media={recommendations} title={t('recommendations')} />
                    <MediaCarousel media={similarByGenre} title={t('sameGenre')} />
                </div>
            </div>
            {showTrailer && trailer && (
                <TrailerModal trailerKey={trailer.key} onClose={() => setShowTrailer(false)} />
            )}
            {showDiaryModal && (
                <DiaryModal
                    media={media}
                    onClose={() => setShowDiaryModal(false)}
                    onSave={handleSaveToDiary}
                />
            )}
        </div>
    );
};

export default MediaPage;