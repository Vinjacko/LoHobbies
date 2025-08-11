import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useFilters } from '../../context/FilterContext.js';
import './FilterModal.css';
import { useTranslation } from 'react-i18next';

const FilterModal = ({ closeModal }) => {
    const { filters, updateFilters, resetFilters } = useFilters();
    const [availableGenres, setAvailableGenres] = useState([]);
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const genresRes = await axios.get('/api/v1/media/genres', {
                    params: { language: i18n.language }
                });
                setAvailableGenres(genresRes.data.data[filters.mediaType] || []);
            } catch (error) {
                console.error("Errore durante il recupero dei generi:", error);
            }
        };
        fetchGenres();
    }, [filters.mediaType, i18n.language]);

    const handleMediaTypeChange = (e) => {
        updateFilters({ mediaType: e.target.value, genres: [] });
    };

    const handleGenreChange = (e) => {
        const { value, checked } = e.target;
        const currentGenres = filters.genres || [];
        const newGenres = checked
            ? [...currentGenres, value]
            : currentGenres.filter(g => g !== value);
        updateFilters({ genres: newGenres });
    };

    const handleYearChange = (e, field) => {
        updateFilters({ [field]: e.target.value });
    };

    return (
        <div className="filter-modal-overlay" onClick={closeModal}>
            <div className="filter-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="filter-modal-header">
                    <h3>{t('advancedFilters')}</h3>
                    <button onClick={closeModal} className="close-btn">&times;</button>
                </div>

                <div className="filter-section">
                    <h4>{t('mediaType')}</h4>
                    <div className="filter-group">
                        <select value={filters.mediaType} onChange={handleMediaTypeChange}>
                            <option value="movie">{t('movie')}</option>
                            <option value="tv">{t('serie')}</option>
                        </select>
                    </div>
                </div>

                <div className="filter-section">
                    <h4>{t('genres')}</h4>
                    <div className="checkbox-group">
                        {availableGenres.map(genre => (
                            <div key={genre.id}>
                                <input
                                    type="checkbox"
                                    id={`genre-${genre.id}`}
                                    value={genre.id}
                                    onChange={handleGenreChange}
                                    checked={(filters.genres || []).includes(genre.id.toString())}
                                />
                                <label htmlFor={`genre-${genre.id}`}>{genre.name}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="filter-section">
                    <h4>{t('releaseYear')}</h4>
                    <div className="year-range">
                        <input type="number" placeholder={t('from')} value={filters.yearFrom} onChange={(e) => handleYearChange(e, 'yearFrom')} />
                        <span>-</span>
                        <input type="number" placeholder={t('to')} value={filters.yearTo} onChange={(e) => handleYearChange(e, 'yearTo')} />
                    </div>
                </div>

                <div className="filter-modal-footer">
                    <button onClick={resetFilters} className="btn-secondary">{t('reset')}</button>
                    <button onClick={closeModal} className="btn-primary">{t('close')}</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;