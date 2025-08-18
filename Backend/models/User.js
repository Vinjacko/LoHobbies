const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  refreshToken: String,
  profilePicture: {
    type: String,
    default: ''
  },
  watchlist: [
    {
      mediaId: { 
        type: String, 
        required: true, 
      },
      mediaType: { 
        type: String, 
        required: true, 
      },
      posterPath: { 
        type: String, 
      },
      title: { 
        type: String, 
      },
      releaseDate: { 
        type: String, 
      },
      addedAt: { 
        type: Date, 
        default: Date.now, 
      }
    }
  ],
  diary: [
    {
      mediaId: { 
        type: String, 
        required: true,
      },
      mediaType: { 
        type: String, 
        required: true, 
      },
      posterPath: { 
        type: String, 
      },
      title: { 
        type: String, 
      },
      releaseDate: { 
        type: String, 
      },
      rating: { 
        type: Number, 
        required: true,
      },
      comment: { 
        type: String, 
      },
      watchedDate: { 
        type: Date, 
        default: Date.now, 
      }
    }
  ],
  favourites: [
    {
      mediaId: { 
        type: String, 
        required: true 
      },
      mediaType: { 
        type: String, 
        required: true 
      },
      posterPath: { 
        type: String 
      },
      title: { 
        type: String 
      },
      releaseDate: { 
        type: String 
      },
      addedAt: { 
        type: Date, 
        default: Date.now 
      }
    }
  ]
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;