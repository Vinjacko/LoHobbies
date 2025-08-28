import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import './Carousel.css';

const MediaCarousel = ({ media, title }) => {
  const mediaData = useMemo(() => media || [], [media]);
  const swiperRef = useRef(null);

  if (mediaData.length === 0) {
    return null;
  }

  return (
    <section className="carousel-section" aria-labelledby="carousel-title">
      <h2 id="carousel-title" className="carousel-title">{title}</h2>
      <div className="carousel-container">
        <Swiper
          ref={swiperRef}
          className="carousel-swiper"
          modules={[Navigation]}
          spaceBetween={15}
          slidesPerView={'auto'}
          navigation={false}
        >
          {mediaData.map((item) => (
            <SwiperSlide key={item.id} className="carousel-slide">
              <Link to={`/media/${item.media_type}/${item.id}`} className="carousel-card" role="group" aria-label={item.title || item.name}>
                {item.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                    alt={item.title || item.name}
                  />
                ) : (
                  <img src='/img/content_placeholder.jpg' alt='Placeholder' />
                )}
                <div className="carousel-card-info">
                  <p className="actor-name">{item.title || item.name}</p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        <button 
          className="carousel-arrow prev" 
          onClick={() => swiperRef.current?.swiper?.slidePrev()}
          aria-label="Previous"
        >
          &#10094;
        </button>
        <button 
          className="carousel-arrow next" 
          onClick={() => swiperRef.current?.swiper?.slideNext()}
          aria-label="Next"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default MediaCarousel;