import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useFilters } from '../../context/FilterContext.js';
import './FilterModal.css';

const FilterModal = ({ closeModal }) => {
    const { filters, updateFilters, resetFilters } = useFilters();
    const [availableGenres, setAvailableGenres] = useState([]);

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const genresRes = await axios.get('/api/v1/media/genres');
                setAvailableGenres(genresRes.data.data[filters.mediaType] || []);
            } catch (error) {
                console.error("Error fetching genres:", error);
            }
        };
        fetchGenres();
    }, [filters.mediaType]);

    const handleMediaTypeChange = (e) => {
        updateFilters({ mediaType: e.target.value, genres: [] }); // Reset genres on type change
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
                    <h3>Filtri Avanzati</h3>
                    <button onClick={closeModal} className="close-btn">&times;</button>
                </div>

                <div className="filter-section">
                    <h4>Tipo di Media</h4>
                    <div className="filter-group">
                        <select value={filters.mediaType} onChange={handleMediaTypeChange}>
                            <option value="movie">Film</option>
                            <option value="tv">Serie TV</option>
                        </select>
                    </div>
                </div>

                <div className="filter-section">
                    <h4>Generi</h4>
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
                    <h4>Anno di Uscita</h4>
                    <div className="year-range">
                        <input type="number" placeholder="Da" value={filters.yearFrom} onChange={(e) => handleYearChange(e, 'yearFrom')} />
                        <span>-</span>
                        <input type="number" placeholder="A" value={filters.yearTo} onChange={(e) => handleYearChange(e, 'yearTo')} />
                    </div>
                </div>

                <div className="filter-modal-footer">
                    <button onClick={resetFilters} className="btn-secondary">Reset</button>
                    <button onClick={closeModal} className="btn-primary">Chiudi</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;