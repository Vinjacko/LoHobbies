import React from 'react';
import './Comments.css';

const Comments = ({ comments }) => {
    return (
        <div className="comments-section">
            <h2>Commenti</h2>
            {comments && comments.length > 0 ? (
                comments.map(comment => (
                    <div key={comment._id} className="comment">
                        <div className="comment-author">
                            <img src={comment.user.profilePicture ? (comment.user.profilePicture.startsWith('http') ? comment.user.profilePicture : `${process.env.REACT_APP_API_URL}/${comment.user.profilePicture}`) : '/img/Actor_Placeholder.png'} alt={comment.user.username} />
                            <span>{comment.user.name}</span>
                        </div>
                        <p>{comment.content}</p>
                    </div>
                ))
            ) : (
                <p>Nessun commento per questo contenuto.</p>
            )}
        </div>
    );
};

export default Comments;