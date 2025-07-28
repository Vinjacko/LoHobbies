const Media = require('../models/media.model');

// Ottiene un media dal nostro DB. Se non esiste, il frontend dovrebbe sapere di crearlo
// tramite un endpoint apposito (come quelli della watchlist/preferiti).
exports.getMediaByTmdbId = async (req, res) => {
    try {
        const media = await Media.findOne({ tmdbId: req.params.tmdbId });
        if (!media) {
            return res.status(404).json({ status: 'fail', message: 'Media non trovato nel database locale.' });
        }
        res.status(200).json({ status: 'success', data: { media } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};