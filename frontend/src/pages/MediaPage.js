import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import i18n from '../i18n';
import io from 'socket.io-client';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import './MediaPage.css';
import CastCarousel from '../components/media/CastCarousel';
import MediaCarousel from '../components/media/MediaCarousel';
import Comments from '../components/media/Comments';
import TrailerModal from '../components/media/TrailerModal';
import DiaryModal from '../components/media/DiaryModal';

const MediaPage = () => {
    const [media, setMedia] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [showDiaryModal, setShowDiaryModal] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [similarByGenre, setSimilarByGenre] = useState([]);
    const [comments, setComments] = useState([]);
    const { media_type, id } = useParams();
    const auth = useContext(AuthContext);
    const { t } = useTranslation();
    const [showNotification, setShowNotification] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isInFavourites, setIsInFavourites] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('');

    useEffect(() => {
        setMedia(null);
        setRecommendations([]);
        setSimilarByGenre([]);
        setComments([]);

        const fetchMedia = async () => {
            try {
                const mediaRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/${media_type}/${id}?language=${i18n.language}`);
                setMedia(mediaRes.data.data);

                const recommendationsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/${media_type}/${id}/recommendations?language=${i18n.language}`);
                setRecommendations(recommendationsRes.data.data.slice(0, 12));

                const commentsRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/${media_type}/${id}/comments`);
                setComments(commentsRes.data.data);

                if (mediaRes.data.data.genres && mediaRes.data.data.genres.length > 0) {
                    const genreId = mediaRes.data.data.genres[0].id;
                    const similarRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/discover?genres=${genreId}&mediaType=${media_type}&language=${i18n.language}`);
                    const filteredSimilar = similarRes.data.data
                        .filter(item => item.id !== parseInt(id))
                        .slice(0, 12);
                    setSimilarByGenre(filteredSimilar);
                }
            } catch (error) {
                console.error(t('fetchImpossibleTitle'), error);
            }
        };

        fetchMedia();
    }, [media_type, id, i18n.language]);

    useEffect(() => {
        const socket = io(process.env.REACT_APP_API_URL);

        socket.on('new_comment', (newComment) => {
            if (newComment.mediaType === media_type && newComment.mediaId === id) {
                setComments((prevComments) => [newComment, ...prevComments]);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [media_type, id]);

    useEffect(() => {
        const checkWatchlist = async () => {
            if (auth && auth.user) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/v1/media/watchlist`);
                    const inWatchlist = response.data.data.some(item => item.mediaId === id);
                    setIsInWatchlist(inWatchlist);
                } catch (error) {
                    console.error(t('fetchImpossibleWatchlist'), error);
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
                    console.error(t('fetchImpossibleFavourites'), error);
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
            auth.setShowAuthModal(true);
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
                setNotificationMessage(t('addedToWatchlist'));
                setNotificationType('success');
            }
            setIsInWatchlist(!isInWatchlist);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            console.error(t('updateImpossibleWatchlist'), error);
        }
    };

    const handleToggleFavourite = async () => {
        if (!auth || !auth.user) {
            auth.setShowAuthModal(true);
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
            console.error(t('updateImpossibleFavourites'), error);
        }
    };

    const handleSaveToDiary = async (rating, comment, watchedDate) => {
        if (!auth || !auth.user) {
            auth.setShowAuthModal(true);
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
                setNotificationMessage(t('addedtodiary'));
                setNotificationType('success');
                setShowNotification(true);
                setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
            console.error(t('updateImpossibleDiary'), error);
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
                                    <button className="diary-button" onClick={() => {
                                        if (!auth || !auth.user) {
                                            auth.setShowAuthModal(true);
                                        } else {
                                            setShowDiaryModal(true);
                                        }
                                    }}>
                                        <i className="fas fa-book"></i> {t('addToDiary')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="media-details">
                <div className="column">
                    <CastCarousel cast={cast} title={t('cast')} />
                    <Comments comments={comments} />
                    <MediaCarousel media={recommendations} title={t('recommendations')} />
                    <MediaCarousel media={similarByGenre} title={t('sameGenre')} />
                </div>
            </div>
            {showTrailer && trailer && (
                <TrailerModal trailerKey={trailer.key} closeModal={() => setShowTrailer(false)} />
            )}
            {showDiaryModal && (
                <DiaryModal
                    media={media}
                    closeModal={() => setShowDiaryModal(false)}
                    onSave={handleSaveToDiary}
                />
            )}
        </div>
    );
};

export default MediaPage;