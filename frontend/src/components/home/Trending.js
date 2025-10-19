import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Swiper, SwiperSlide } from 'swiper/react';
import i18n from '../../i18n';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation'; 
import './Trending.css';
import { Navigation } from 'swiper';
import axios from '../../api/axios';

const Trending = () => {
  const { t } = useTranslation();
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const getTrending = async () => {
      try {
        const res = await axios.get(`/api/v1/media/trending?language=${i18n.language}`, {
          withCredentials: true,
        });
        setTrending(res.data.data);
      } catch (error) {
        console.error(t('fetchImpossibleTrending'), error);
      }
    };
    getTrending();
  }, []);

  return (
    <div className="trending-container">
      <h2>{t('trending')}</h2>
      <Swiper
        className="trending-swiper"
        modules={[Navigation]}
        spaceBetween={15} 
        slidesPerView={'auto'}
        navigation
      >
        {trending.map((item) => (
          <SwiperSlide key={item.id} className="trending-slide">
            <Link to={`/media/${item.media_type}/${item.id}`} className="trending-item">
              <div className="trending-item-image-container">
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
                <div className="trending-item-overlay">
                  <div className="trending-item-info">
                    <strong>{item.title || item.name}</strong>
                    <span>{new Date(item.release_date || item.first_air_date).getFullYear()} • ★ {(item.vote_average / 2).toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Trending;