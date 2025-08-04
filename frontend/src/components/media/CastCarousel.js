import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './CastCarousel.css';

const CastCarousel = ({ cast, title = "Cast" }) => {
  const castData = useMemo(() => cast || [], [cast]);
  const viewportRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleScroll = () => {
    if (!viewportRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = viewportRef.current;
    const scrollEnd = scrollWidth - clientWidth;
    
    setIsAtStart(scrollLeft < 10); // A small buffer for precision issues
    setIsAtEnd(scrollLeft > scrollEnd - 10);
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    handleScroll(); // Initial check
    viewport.addEventListener('scroll', handleScroll);
    
    // Re-evaluate on resize and data change
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      resizeObserver.unobserve(viewport);
    };
  }, [castData]);

  const scroll = (direction) => {
    if (!viewportRef.current) return;
    const { clientWidth } = viewportRef.current;
    const scrollAmount = clientWidth * 0.8; // Scroll by 80% of the viewport width
    viewportRef.current.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  if (castData.length === 0) {
    return null;
  }

  return (
    <section className="cast-carousel-section" aria-labelledby="cast-carousel-title">
      <h2 id="cast-carousel-title" className="cast-carousel-title">{title}</h2>
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
          {castData.map((actor, index) => (
            <Link to={`/person/${actor.id}`} key={index} className="carousel-card" role="group" aria-label={`${actor.nomeAttore} as ${actor.nomePersonaggio}`}>
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

export default CastCarousel;