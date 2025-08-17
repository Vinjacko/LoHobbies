import React from 'react';
import './Comments.css';

const Comments = ({ comments }) => {
    return (
        <div className="comments-section">
            <h2>Commenti</h2>
            {comments && comments.length > 0 ? (
                <div className="comments-list">
                    {comments.map(comment => (
                        <div key={comment._id} className="comment">
                            <div className="comment-author">
                                <img src={comment.user.profilePicture ? (comment.user.profilePicture.startsWith('http') ? comment.user.profilePicture : `${process.env.REACT_APP_API_URL}/${comment.user.profilePicture}`) : '/img/Actor_Placeholder.png'} alt={comment.user.username} />
                                <span>{comment.user.name}</span>
                                <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p>{comment.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Nessun commento per questo contenuto.</p>
            )}
        </div>
    );
};

export default Comments;