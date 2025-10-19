import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Explore.css';
import i18n from '../../i18n';
import { Link } from 'react-router-dom';
import Pagination from '../common/Pagination';
import axios from '../../api/axios';

const Explore = () => {
  const { t } = useTranslation();
  const [explore, setExplore] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const getExplore = async () => {
      try {
        const response = await axios.get(`/api/v1/media/explore?page=${page}&language=${i18n.language}`);
        setExplore(response.data.data);
        setTotalPages(response.data.pagination.total_pages);
      } catch (error) {
        console.error(t('fetchImpossibleExplore:'), error);
      }
    };
    getExplore();
  }, [page, t]);

  return (
    <div className="explore-container">
      <h2>{t('explore')}</h2>
      <div className="explore-grid">
        {explore.map((item) => (
          <Link to={`/media/${item.media_type}/${item.id}`} key={item.id} className="explore-item">
            <div className="explore-item-image-container">
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                  loading="lazy"
                  width="200"
                  height="300"
                />
              ) : (
                <img 
                  src='/img/content_placeholder.jpg' 
                  alt='Placeholder'
                  loading="lazy"
                  width="200"
                  height="300"
                />
              )}
              <div className="explore-item-overlay">
                <div className="explore-item-info">
                  <strong>{item.title || item.name}</strong>
                  <span>{new Date(item.release_date || item.first_air_date).getFullYear()} • ★ {(item.vote_average / 2).toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  );
};

export default Explore;