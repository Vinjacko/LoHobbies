import { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import './Carousel.css';

const CastCarousel = ({ cast, title = "Cast" }) => {
  const castData = useMemo(() => cast || [], [cast]);
  const swiperRef = useRef(null);

  if (castData.length === 0) {
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
          {castData.map((actor, index) => (
            <SwiperSlide key={index} className="carousel-slide">
              <Link to={`/person/${actor.id}`} className="carousel-card" role="group">
                <img
                  src={actor.urlImmagine || '/img/Actor_Placeholder.png'}
                  alt={actor.nomeAttore}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/Actor_Placeholder.png';
                  }}
                />
                <div className="carousel-card-info">
                  <p className="actor-name">{actor.nomeAttore}</p>
                  <p className="character-name">{actor.nomePersonaggio}</p>
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

export default CastCarousel;