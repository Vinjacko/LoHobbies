import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import i18n from '../../i18n';
import './Header.css';
import AuthModal from '../auth/AuthModal';
import FilterModal from '../common/FilterModal';
import LanguageModal from '../common/LanguageModal';
import ThemeModal from '../common/ThemeModal';
import ProfilePictureModal from '../auth/ProfilePictureModal';
import ResetPasswordModal from '../auth/ResetPasswordModal';
import AuthContext from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    console.log('Header - User corrente:', user);
  }, [user]);

  useEffect(() => {
    console.log('isSettingsOpen cambiato:', isSettingsOpen);
  }, [isSettingsOpen]);

  useEffect(() => {
    console.log('isDropdownOpen cambiato:', isDropdownOpen);
  }, [isDropdownOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length > 2) {
        try {
          const res = await axios.get(`/api/v1/media/autocomplete?query=${query}&language=${i18n.language}`);
          const filteredResults = res.data.data.filter(item => item.media_type !== 'person');
          setResults(filteredResults);
        } catch (error) {
          console.error(t('fetchImpossibleSearch'), error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(() => { //quando si digita un carattere la chiamata APi parte dopo 300ms
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, t]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
        setResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
      const handleClickOutside = (e) => {
          if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
              setIsDropdownOpen(false);
              setIsSettingsOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  const handleResultClick = () => {
    setQuery('');
    setResults([]);
    setIsFocused(false);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${query.trim()}`);
      handleResultClick();
    }
  };

  const getResultLink = (item) => {
    if (item.media_type === 'person') {
        return `/person/${item.id}`;
    }
    return `/media/${item.media_type}/${item.id}`;
  };

  const getResultImage = (item) => {
    if (item.poster_path) {
      return `https://image.tmdb.org/t/p/w92${item.poster_path}`;
    }
    if (item.profile_path) {
      return `https://image.tmdb.org/t/p/w92${item.profile_path}`;
    }
    if (item.media_type === 'person') {
        return '/img/Actor_Placeholder.png';
    }
    return '/img/content_placeholder.jpg';
  };

  const getResultTitle = (item) => {
    switch (item.media_type) {
        case 'movie':
          return item.title;
        case 'tv':
          return item.name;
        case 'person':
          return item.name;
        default:
          return 'Unknown';
      }
  }

  const getResultYear = (item) => {
    if (item.media_type === 'movie' && item.release_date) {
      return `(${new Date(item.release_date).getFullYear()})`;
    }
    if (item.media_type === 'tv' && item.first_air_date) {
      return `(${new Date(item.first_air_date).getFullYear()})`;
    }
    return '';
  }

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => {
      if (prev) {
        // Se stiamo chiudendo il dropdown, chiudi anche le impostazioni
        setIsSettingsOpen(false);
      }
      return !prev;
    });
  };

  return (
    <>
      <header className="header">
        <Link to="/" className="header__logo">
          <img src="/img/logo.png" alt="LoHobbies Logo" />
        </Link>
        <button className="hamburger-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <div className={`header-right-content ${isMenuOpen ? 'open' : ''}`}>
            <div className="search-container" ref={searchRef}>
            <form className="search-bar" onSubmit={handleSearchSubmit}>
                <input
                type="text"
                placeholder={t('search')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                />
                <button type="submit" className="search-button">
                <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
                </button>
                <button type="button" className="filter-button" onClick={() => openModal('filter')}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"></path>
                </svg>
                </button>
            </form>
            {isFocused && results.length > 0 && (
                <ul className="search-results">
                {results.map((item) => (
                    <li key={item.id} className="search-result-item">
                    <Link to={getResultLink(item)} onClick={handleResultClick}>
                        <img src={getResultImage(item)} alt={getResultTitle(item)} />
                        <div>
                        <p className="result-title">{getResultTitle(item)} <span className="result-year">{getResultYear(item)}</span></p>
                        <p className="result-type">{item.media_type}</p>
                        </div>
                    </Link>
                    </li>
                ))}
                </ul>
            )}
            </div>
            <div className="header__nav">
            {user ? (
                <div className="user-menu" ref={userMenuRef} onClick={toggleDropdown}>
                  <span>{user.name}</span>
                  <div className="profile-icon">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="profile-picture" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                {isDropdownOpen && (
                    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <Link to="/" className="menu-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                      </svg>
                      {t('home')}
                    </Link>
                    <Link to="/diary" className="menu-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                      </svg>
                      {t('diary')}
                    </Link>
                    <Link to="/favourites" className="menu-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {t('favourites')}
                    </Link>
                    <Link to="/watchlist" className="menu-item">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                      {t('watchlist')}
                    </Link>
                    <div className="dropdown-submenu">
                        <button onClick={() => { 
                          console.log('Impostazioni cliccate, stato attuale:', isSettingsOpen);
                          setIsSettingsOpen(!isSettingsOpen);
                        }} className="settings-button menu-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                        </svg>
                        {t('settings')}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16px" height="16px" style={{ marginLeft: 'auto' }}>
                          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                        </button>
                        {isSettingsOpen && (
                        <div className="settings-menu">
                            <button onClick={() => { openModal('language'); setIsDropdownOpen(false); }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px">
                                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                              </svg>
                              {t('language')}
                            </button>
                            <button onClick={() => { openModal('theme'); setIsDropdownOpen(false); }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px">
                                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                              </svg>
                              {t('theme')}
                            </button>
                            <button onClick={() => { openModal('resetPassword'); setIsDropdownOpen(false); }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px">
                                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>
                              </svg>
                              {t('resetPassword')}
                            </button>
                            <button onClick={() => { openModal('profilePicture'); setIsDropdownOpen(false); }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18px" height="18px">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                              {t('profilePicture')}
                            </button>
                        </div>
                        )}
                    </div>
                    <button onClick={logout} className="menu-item logout-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20px" height="20px">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      {t('logout')}
                    </button>
                    </div>
                )}
                </div>
            ) : (
                <button className="log-btn" onClick={() => openModal('auth')}>{t('login')}</button>
            )}
            </div>
        </div>
      </header>
      {activeModal === 'auth' && !user && <AuthModal closeModal={closeModal} />}
      {activeModal === 'filter' && <FilterModal closeModal={closeModal} />}
      {activeModal === 'language' && <LanguageModal closeModal={closeModal} />}
      {activeModal === 'profilePicture' && <ProfilePictureModal closeModal={closeModal} />}
      {activeModal === 'theme' && <ThemeModal closeModal={closeModal} />}
      {activeModal === 'resetPassword' && <ResetPasswordModal closeModal={closeModal} />}
    </>
  );
};

export default Header;