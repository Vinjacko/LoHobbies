const express = require('express');
const router = express.Router();

const { getTrending, getExplore, getMovieDetails, getTvShowDetails, getRecommendations, getPersonDetails, searchAll, discoverMedia, getGenres, getProviders, autocompleteSearch, addToWatchlist, getWatchlist, removeFromWatchlist, addToDiary, getDiary, addToFavourites, getFavourites, removeFromFavourites } = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

router.get('/trending', getTrending);
router.get('/explore', getExplore);
router.get('/search', searchAll);
router.get('/autocomplete', autocompleteSearch);
router.get('/discover', discoverMedia);
router.get('/genres', getGenres);
router.get('/providers', getProviders);
router.get('/movie/:id', getMovieDetails);
router.get('/tv/:id', getTvShowDetails);
router.get('/:media_type/:id/recommendations', getRecommendations);
router.get('/person/:id', getPersonDetails);
router.post('/watchlist', protect, addToWatchlist);
router.get('/watchlist', protect, getWatchlist);
router.delete('/watchlist/:mediaId', protect, removeFromWatchlist);
router.post('/diary', protect, addToDiary);
router.get('/diary', protect, getDiary);
router.post('/favourites', protect, addToFavourites);
router.get('/favourites', protect, getFavourites);
router.delete('/favourites/:mediaId', protect, removeFromFavourites);

module.exports = router;