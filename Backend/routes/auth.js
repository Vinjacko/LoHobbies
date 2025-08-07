const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logoutUser,
  uploadProfilePicture,
  deleteProfilePicture,
  verifyPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const multer = require('multer');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, getMe);
router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

// utilizzata per gestire gli errori di multer in modo personalizzato prima di passare il controllo al controller finale
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'La dimensione del file è troppo grande. La capacità massima è di 1MB.' });
      }
    } else if (err) {
      return res.status(400).json({ msg: err });
    }
    next();
  });
};

router.post('/profile-picture', protect, handleUpload, uploadProfilePicture);
router.delete('/profile-picture', protect, deleteProfilePicture);
router.post('/verify-password', protect, verifyPassword);
router.post('/reset-password', protect, resetPassword);

module.exports = router;