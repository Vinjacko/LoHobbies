import './TrailerModal.css';

const TrailerModal = ({ trailerKey, onClose }) => {
    if (!trailerKey) return null;

    return (
        <div className="trailer-modal-overlay" onClick={onClose}>
            <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
                <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Trailer"
                ></iframe>
            </div>
        </div>
    );
};

export default TrailerModal;