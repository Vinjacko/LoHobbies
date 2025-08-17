
import { Link } from 'react-router-dom';
import './GenreGrid.css';

const GenreGrid = ({ items, title }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="genre-grid-container">
      <h2>{title}</h2>
      <div className="genre-grid">
        {items.map((item) => (
          <Link to={`/${item.media_type}/${item.id}`} key={item.id} className="genre-item">
            <div className="genre-item-image-container">
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title || item.name}
                />
              ) : (
                <img src='/img/content_placeholder.jpg' alt='Placeholder' />
              )}
              <div className="genre-item-overlay">
                <div className="genre-item-info">
                  <strong>{item.title || item.name}</strong>
                  <span>{new Date(item.release_date || item.first_air_date).getFullYear()} • ★ {(item.vote_average / 2).toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GenreGrid;