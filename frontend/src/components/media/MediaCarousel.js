import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './MediaCarousel.css';

const MediaCarousel = ({ media, title }) => {
  const mediaData = useMemo(() => media || [], [media]);
  const viewportRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = viewportRef.current;
    const scrollEnd = scrollWidth - clientWidth;
    
    setIsAtStart(scrollLeft < 10);
    setIsAtEnd(scrollLeft > scrollEnd - 10);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    handleScroll();
    viewport.addEventListener('scroll', handleScroll);
    
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      resizeObserver.unobserve(viewport);
    };
  }, [mediaData]);

  const scroll = (direction) => {
    if (!viewportRef.current) return;
    const { clientWidth } = viewportRef.current;
    const scrollAmount = clientWidth * 0.8;
    viewportRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  if (mediaData.length === 0) {
    return null;
  }

  return (
    <section className="media-carousel-section" aria-labelledby="media-carousel-title">
      <h2 id="media-carousel-title" className="media-carousel-title">{title}</h2>
      <div className="carousel-container">
        <button
          className="carousel-arrow prev"
          onClick={() => scroll('prev')}
          disabled={isAtStart}
          aria-label="Previous"
        >
          &#10094;
        </button>
        <div className="carousel-viewport" ref={viewportRef}>
          {mediaData.map((item) => (
            <Link to={`/media/${item.media_type}/${item.id}`} key={item.id} className="carousel-card" role="group" aria-label={item.title || item.name}>
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
          ))}
        </div>
        <button
          className="carousel-arrow next"
          onClick={() => scroll('next')}
          disabled={isAtEnd}
          aria-label="Next"
        >
          &#10095;
        </button>
      </div>
    </section>
  );
};

export default MediaCarousel;