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

    const timeoutId = setTimeout(() => {
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
    setIsDropdownOpen(!isDropdownOpen);
    if (isDropdownOpen) {
      setIsSettingsOpen(false);
    }
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
                    <div className="dropdown-menu">
                    <Link to="/">{t('home')}</Link>
                    <Link to="/diary">{t('diary')}</Link>
                    <Link to="/favourites">{t('favourites')}</Link>
                    <Link to="/watchlist">{t('watchlist')}</Link>
                    <div className="dropdown-submenu">
                        <button onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}>
                        {t('settings')}
                        </button>
                        {isSettingsOpen && (
                        <div className="settings-menu">
                            <button onClick={() => openModal('language')}>{t('language')}</button>
                            <button onClick={() => openModal('theme')}>{t('theme')}</button>
                            <button onClick={() => openModal('resetPassword')}>{t('resetPassword')}</button>
                            <button onClick={() => openModal('profilePicture')}>{t('profilePicture')}</button>
                        </div>
                        )}
                    </div>
                    <button onClick={logout}>{t('logout')}</button>
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