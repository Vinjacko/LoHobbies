const express = require('express');
const mediaController = require('../controllers/media.controller');

const router = express.Router();

router
    .route('/:tmdbId')
    .get(mediaController.getMediaByTmdbId);

module.exports = router;