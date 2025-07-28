const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "L'username è obbligatorio"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "L'email è obbligatoria"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "La password è obbligatoria"],
    minlength: 6,
    select: false,          // Non ritorna la password nelle query di default
  },

  // Lista di ID dei media che l'utente vuole vedere

  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],

  // Lista di ID dei media preferiti dall'utente

  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  }],

  // Cronologia delle ricerche (array di stringhe semplici)
  
  searchHistory: [{
    type: String,
    trim: true,
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;