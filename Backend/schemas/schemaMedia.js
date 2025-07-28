const mongoose = require('mongoose');

// utilizzato per memorizzare dati relativi a film e serie tv prelevati dal database di TMDB, fungendo da cache per evitare di interrogare costantemente le API di TMDB

const mediaSchema = new mongoose.Schema({
    tmdbId: {
        type: Number,
        required: true,
        unique: true, 
        index: true,
    },
    mediaType: {
        type: String,
        required: true,
        enum: ['movie', 'tv'],
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    posterPath: {
        type: String,
    },
    releaseDate: {
        type: String,
        trim: true,
    },
    genre: {
        genreId: {
            type: Number,
            required: true,
            trim: true,
        },
        genreName: {
            type: String,
            required: true,
            trim: true,
        }
    },
    personId: {
        type: Number,
        required: true,
        unique: true,
    }

}, { timestamps: true });

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;