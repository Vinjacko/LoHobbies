const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true, 
    minlength: 6,
    select: false,     // Non ritorna la password nelle query di default
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

// Middleware per hashare la password prima di salvare l'utente
userSchema.pre('save', async function(next) {
    // Esegue questa funzione solo se la password è stata modificata (o è nuova)
    if (!this.isModified('password')) 
      return next();
    // Hashing della password con un costo di 12
    try{
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
      next(error);
    }
});

// Metodo per confrontare la password inserita con quella nel DB
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;