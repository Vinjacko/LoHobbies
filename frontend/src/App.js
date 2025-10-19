import { useContext, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import ReactGA from 'react-ga4';
import './App.css';
import Header from './components/layout/Header';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load components for better performance
const Trending = lazy(() => import('./components/home/Trending'));
const Explore = lazy(() => import('./components/home/Explore'));
const Diary = lazy(() => import('./pages/Diary'));
const Favourites = lazy(() => import('./pages/Favourites'));
const Watchlist = lazy(() => import('./pages/Watchlist'));
const MediaPage = lazy(() => import('./pages/MediaPage'));
const PersonPage = lazy(() => import('./pages/PersonPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AuthModal = lazy(() => import('./components/auth/AuthModal'));

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null;
}

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    fontSize: '1.2rem'
  }}>
    Caricamento...
  </div>
);

function AppContent() {
  const { showAuthModal, setShowAuthModal } = useContext(AuthContext);

  return (
    <>
      <RouteChangeTracker />
      <Header />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<><Trending /><Explore /></>} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/person/:id" element={<PersonPage />} />
          <Route path="/media/:media_type/:id" element={<MediaPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Suspense>
      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal closeModal={() => setShowAuthModal(false)} />
        </Suspense>
      )}
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
