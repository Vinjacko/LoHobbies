const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Queste routes non richiedono che l'utente sia loggato
router.post('/signup', authController.signup);      // Definisce un endpoint POST su /signup per creare un nuovo utente
router.post('/login', authController.login);        // Definisce un endpoint POST su /login per autenticare un utente esistente.

// Da qui in poi, tutte le rotte richiedono autenticazione e per queste rotte utilizziamo il middleware .protect
router.use(authController.protect);

// Rotta per ottenere i dati dell'utente loggato (watchlist e preferiti inclusi)
router.get('/me', (req, res) => {
    // Il middleware .protect ha già messo l'utente in req.user. Le liste vengono popolate prima di essere inviate
    User.findById(req.user.id)
        .populate('watchlist')
        .populate('favorites')
        .then(user => {
            res.status(200).json({ data: { user } });
        });
});

// Gestione Watchlist
router
    .route('/watchlist')
    .post(userController.addToWatchlist);

router
    .route('/watchlist/:mediaId')
    .delete(userController.removeFromWatchlist);

// Gestione Preferiti
router
    .route('/favorites')
    .post(userController.addToFavorites);

router
    .route('/favorites/:mediaId')
    .delete(userController.removeFromFavorites);

// Gestione Cronologia Ricerche
router
    .route('/search-history')
    .post(userController.addSearchTerm);


module.exports = router;