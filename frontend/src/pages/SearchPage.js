import { useState, useEffect, useTransition } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { useFilters } from '../context/FilterContext';
import './SearchPage.css';
import { useTranslation } from 'react-i18next';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
    const{t} = useTranslation();
    const { results, loading, filters, updateFilters } = useFilters();
    const [genreMap, setGenreMap] = useState({});
    const query = useQuery().get('q');

    useEffect(() => {
        if (query && query !== filters.searchQuery) {
            updateFilters({ searchQuery: query });
        }
    }, [query, filters.searchQuery, updateFilters]);

    useEffect(() => {
        const fetchGenreMap = async () => {
            try {
                const res = await axios.get('/api/v1/media/genres');
                const allGenres = [...res.data.data.movie, ...res.data.data.tv];
                const map = allGenres.reduce((acc, genre) => {
                    acc[genre.id] = genre.name;
                    return acc;
                }, {});
                setGenreMap(map);
            } catch (error) {
                console.error("Errore durante il recupero dei generi", error);
            }
        };
        fetchGenreMap();
    }, []);

    const removeGenre = (genreId) => {
        const newGenres = filters.genres.filter(g => g !== genreId);
        updateFilters({ genres: newGenres });
    };

    const removeYearFilter = () => {
        updateFilters({ yearFrom: '', yearTo: '' });
    };

    const getResultLink = (item) => item.media_type === 'person' ? `/person/${item.id}` : `/media/${item.media_type}/${item.id}`;
    const getResultImage = (item) => item.poster_path ? `https://image.tmdb.org/t/p/w154${item.poster_path}` : '/img/content_placeholder.jpg';
    const getResultTitle = (item) => item.title || item.name;

    if (loading) {
        return <div className="loading">{t('loading')}</div>;
    }

    return (
        <div className="search-page-container">
            <div className="page-header">
                <h1>{t('resultsfor')} "{filters.searchQuery}"</h1>
                <div className="sort-by-container">
                    <label htmlFor="sort-by">{t('orderfor')}</label>
                    <select id="sort-by" value={filters.sortBy} onChange={(e) => updateFilters({ sortBy: e.target.value })}>
                        <option value="popularity.desc">{t('popularity')} (Disc)</option>
                        <option value="popularity.asc">{t('popularity')} (Asc)</option>
                        <option value="release_date.desc">{t('releaseYear')} (Disc)</option>
                        <option value="release_date.asc">{t('releaseYear')} (Asc)</option>
                        <option value="vote_average.desc">{t('rating')} (Disc)</option>
                        <option value="vote_average.asc">{t('rating')} (Asc)</option>
                    </select>
                </div>
            </div>

            <div className="active-filters">
                {filters.genres.map(id => (
                    <div key={id} className="filter-pill">
                        {genreMap[id] || 'Genere'}
                        <button onClick={() => removeGenre(id)}>&times;</button>
                    </div>
                ))}
                {(filters.yearFrom || filters.yearTo) && (
                    <div className="filter-pill">
                        {`${filters.yearFrom || ''}-${filters.yearTo || ''}`}
                        <button onClick={removeYearFilter}>&times;</button>
                    </div>
                )}
            </div>

            <div className="search-results-grid">
                {results.length > 0 ? (
                    results.map(item => (
                        <div key={item.id} className="search-result-card">
                            <Link to={getResultLink(item)}>
                                {item.poster_path ? (
                                    <img src={getResultImage(item)} alt={getResultTitle(item)} />
                                ) : (
                                    <img src='/img/content_placeholder.jpg' alt='Placeholder' />
                                )}
                                <div className="search-result-info">
                                    <h3>{getResultTitle(item)}</h3>
                                    <p>{item.media_type}</p>
                                </div>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>{t('noresult')}</p>
                )}
            </div>
        </div>
    );
};

export default SearchPage;