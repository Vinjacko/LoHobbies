const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
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
            message: props => `${props.value} non è un valore valido! La valutazione deve essere in incrementi di 0.5.`
        }
    },
    reviewText: { // Il "commento" o recensione
        type: String,
        trim: true
    },
    watchedDate: {
        type: Date,
        required: [true, 'La data di visione è obbligatoria'],
        default: Date.now,
    }
}, { timestamps: true });

// Indice composto per assicurare che un utente possa avere una sola voce per un dato media
diaryEntrySchema.index({ user: 1, media: 1 }, { unique: true });

const DiaryEntry = mongoose.model('DiaryEntry', diaryEntrySchema);

module.exports = DiaryEntry;