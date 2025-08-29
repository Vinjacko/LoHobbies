import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import i18n from '../i18n';
import axios from '../api/axios';
import './PersonPage.css';
import MediaCarousel from '../components/media/MediaCarousel';

const PersonPage = () => {
    const { t } = useTranslation();
    const [person, setPerson] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const fetchPerson = async () => {
            try {
                const personRes = await axios.get(`/api/v1/media/person/${id}?language=${i18n.language}`);
                setPerson(personRes.data.data);
            } catch (error) {
                console.error(t('fetchImpossibleCast'), error);
            }
        };

        fetchPerson();
    }, [id, i18n.language]);

    if (!person) {
        return <div>{t('loading')}</div>;
    }

    const combinedKnownFor = [...person.movie_credits.cast, ...person.tv_credits.cast, ...person.movie_credits.crew.filter(c => c.job === 'Director'), ...person.tv_credits.crew.filter(c => c.job === 'Director')];
    const uniqueKnownFor = combinedKnownFor.filter((item, index, self) => index === self.findIndex(t => t.id === item.id));
    const knownFor = uniqueKnownFor
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 20)
        .map(item => ({ ...item, media_type: item.media_type || (item.title ? 'movie' : 'tv') }));

    return (
        <div className="person-page">
            <div className="person-header">
                <div className="person-header-content">
                    <img
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : '/img/Actor_Placeholder.png'}
                        alt={person.name}
                        onError={(e) => { e.target.onerror = null; e.target.src='/img/Actor_Placeholder.png'; }}
                    />
                    <div className="person-info">
                        <h1>{person.name}</h1>
                        <h3>{t('biography')}</h3>
                        <p>{person.biography || t('notbiography')}</p>
                    </div>
                </div>
            </div>
            <div className="person-details">
                <MediaCarousel media={knownFor} title={t('knownFor')} />
            </div>
        </div>
    );
};

export default PersonPage;