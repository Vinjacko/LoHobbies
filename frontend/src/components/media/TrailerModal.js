import { useEffect } from 'react';

import './TrailerModal.css';

const TrailerModal = ({ trailerKey, closeModal }) => {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
        document.body.style.overflow = 'unset';
        };
    }, []);


    if (!trailerKey) return null;

    return (
        <div className="trailer-modal-overlay" onClick={closeModal}>
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