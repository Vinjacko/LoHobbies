const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    media: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true,
    },
    rating: {
        type: Number,
        min: 0.5,
        max: 5,
        // Permette voti come 3.5
        validate: {
            validator: function(v) {
                return v % 0.5 === 0;
            },
            message: props => `${props.value} non è un valore valido! Il voto deve essere incrementato per multipli di 0.5`     // viene eseguito il contenuto di message se il return è false
        }
    },

    // Il "commento" o recensione

    reviewText: {               
        type: String,
        trim: true
    },
    watchedDate: {
        type: Date,
        required: true,
        default: Date.now,
    }
}, { timestamps: true });

// Indice composto per assicurare che un utente possa avere una sola voce per un dato media

diarySchema.index({ user: 1, media: 1 }, { unique: true });

const Diary = mongoose.model('Diary', diarySchema);

module.exports = Diary;