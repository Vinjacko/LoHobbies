import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import './ProfilePictureModal.css';
import AuthContext from '../../context/AuthContext';

const ProfilePictureModal = ({ onClose }) => {
  const { user, loadUser } = useContext(AuthContext);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError('');
    // creo un contenitore per inviare dati via HTTP
    const formData = new FormData();
    // inserisco il file nel contenitore   
    formData.append('profilePicture', selectedFile);

    try {
      await axios.post('/api/v1/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await loadUser();
      onClose();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError(t('uploadError'));
      }
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.delete('/api/v1/auth/profile-picture');
      await loadUser();
      onClose();
    } catch (err) {
      setError(t('removeError'));
    }
    setLoading(false);
  };

  return (
    <>
      <div className="profile-picture-modal-overlay" onClick={onClose}>
        <div className="profile-picture-modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>{t('profilePicture')}</h2>
          <div className="profile-picture-container">
            <img src={user.profilePicture || '/img/Actor_Placeholder.png'} alt="Profile" />
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label htmlFor="file-upload" className="custom-file-upload">
              {t('selectFile')}
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
            {selectedFile && <p>{selectedFile.name}</p>}
          </div>
          <div className="button-group">
            <button onClick={handleUpload} disabled={loading || !selectedFile}>
              {loading ? t('uploading') : t('changePicture')}
            </button>
            <button onClick={handleRemove} disabled={loading}>
              {loading ? t('removing') : t('removePicture')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePictureModal;