const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    
    token: {
        type: String,
        required: true,
        unique: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Il nome del modello Utente che abbiamo definito
        required: true,
        index: true,
    },

    expires: {
        type: Date,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }, 
});

refreshTokenSchema.index({ "expires": 1 }, { expireAfterSeconds: 0 });


const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;