import { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import ReactGA from 'react-ga4';
import './App.css';
import Header from './components/layout/Header';
import Trending from './components/home/Trending';
import Explore from './components/home/Explore';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import Diary from './pages/Diary';
import Favourites from './pages/Favourites';
import Watchlist from './pages/Watchlist';
import MediaPage from './pages/MediaPage';
import PersonPage from './pages/PersonPage';
import SearchPage from './pages/SearchPage';
import AuthModal from './components/auth/AuthModal';

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
}

function AppContent() {
  const { showAuthModal, setShowAuthModal } = useContext(AuthContext);

  return (
    <>
      <RouteChangeTracker />
      <Header />
      <Routes>
        <Route path="/" element={<><Trending /><Explore /></>} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/media/:media_type/:id" element={<MediaPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </>
  );
}

function App() {
  useEffect(() => {
    reportWebVitals();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <FilterProvider>
          <ThemeProvider>
            <div className="App">
              <AppContent />
            </div>
          </ThemeProvider>
        </FilterProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
