const express = require('express');
const router = express.Router();
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

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/auth
// @desc    Get user data
// @access  Private
router.get('/', protect, getMe);

router.post('/refresh', refreshToken);
router.post('/logout', logoutUser);

// @route   POST api/auth/profile-picture
// @desc    Upload profile picture
// @access  Private
const handleUpload = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ msg: 'File size is too large. Maximum size is 1MB.' });
      }
    } else if (err) {
      return res.status(400).json({ msg: err });
    }
    next();
  });
};

router.post('/profile-picture', protect, handleUpload, uploadProfilePicture);

// @route   DELETE api/auth/profile-picture
// @desc    Delete profile picture
// @access  Private
router.delete('/profile-picture', protect, deleteProfilePicture);

// @route   POST api/auth/verify-password
// @desc    Verify user's current password
// @access  Private
router.post('/verify-password', protect, verifyPassword);

// @route   POST api/auth/reset-password
// @desc    Reset user's password
// @access  Private
router.post('/reset-password', protect, resetPassword);

module.exports = router;