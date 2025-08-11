import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const FilterContext = createContext();

export const useFilters = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    mediaType: 'movie',
    genres: [],
    yearFrom: '',
    yearTo: '',
    sortBy: 'popularity.desc',
    searchQuery: '',
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          mediaType: filters.mediaType,
          genres: filters.genres.join(','),
          yearFrom: filters.yearFrom,
          yearTo: filters.yearTo,
          sortBy: filters.sortBy,
          query: filters.searchQuery,
        }).toString();
        
        const res = await axios.get(`/api/v1/media/search?${params}`);
        setResults(res.data.data);
      } catch (error) {
        console.error("Errore durante il recupero dei risultati:", error);
        setResults([]);
      }
      setLoading(false);
    };

    if (filters.searchQuery || filters.genres.length > 0 || filters.yearFrom || filters.yearTo) {
        fetchResults();
    } else {
        setResults([]);
    }
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      mediaType: 'movie',
      genres: [],
      yearFrom: '',
      yearTo: '',
      sortBy: 'popularity.desc',
      searchQuery: '',
    });
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilters, resetFilters, results, loading }}>
      {children}
    </FilterContext.Provider>
  );
};