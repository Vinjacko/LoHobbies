const express = require('express');

const filmController = require('../controllers/film.controller');

const router = express.Router();

router.get('/popularfilm', filmController.getPopularFilms);

module.exports = router;