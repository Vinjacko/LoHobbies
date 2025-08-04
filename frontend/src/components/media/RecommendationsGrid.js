import React from 'react';
import { Link } from 'react-router-dom';
import './RecommendationsGrid.css';

const RecommendationsGrid = ({ recommendations, title }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="recommendations-section">
      <h2 className="recommendations-title">{title}</h2>
      <div className="recommendations-grid">
        {recommendations.map((item) => (
          <Link to={`/media/${item.media_type}/${item.id}`} key={item.id} className="recommendation-card">
            {item.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                alt={item.title || item.name}
              />
            ) : (
              <img src='/img/content_placeholder.jpg' alt='Placeholder' />
            )}
            <div className="recommendation-card-info">
              <p className="recommendation-card-title">{item.title || item.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendationsGrid;