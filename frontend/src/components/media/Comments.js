import './Comments.css';
import { useTranslation } from 'react-i18next';
const Comments = ({ comments }) => {
    const {t} = useTranslation();
    return (
        <div className="comments-section">
            <h2>{t('comments')}</h2>
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
                <p>{t('nocomments')}</p>
            )}
        </div>
    );
};

export default Comments;