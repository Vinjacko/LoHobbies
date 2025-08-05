const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate tokens and set cookies
const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  // Create token
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  });

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  };

  const refreshTokenCookieOptions = {
    ...cookieOptions,
    path: '/api/auth/refresh'
  };

  if (rememberMe) {
    refreshTokenCookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, accessTokenCookieOptions)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    sendTokenResponse(user, 200, res, false);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res, rememberMe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user data
// @route   GET /api/auth
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: 'Invalid refresh token' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Refresh token is not valid' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res) => {
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
};

const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();
      res.json(user);
    } else {
      res.status(400).json({ msg: 'Please upload a file' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    user.profilePicture = '';
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const verifyPassword = async (req, res) => {
  console.log('--- Password Verification Start ---');
  console.log('Request Body:', req.body);
  const { password } = req.body;
  console.log('Password from body:', password);

  if (!password) {
    console.log('Error: No password in request body.');
    return res.status(400).json({ msg: 'Password is required' });
  }

  try {
    console.log('User ID from token:', req.user.id);
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      console.log('Error: User not found in database.');
      return res.status(404).json({ msg: 'User not found' });
    }
    
    console.log('User found. Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Error: Password comparison failed.');
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('--- Password Verification Success ---');
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('--- Password Verification Error ---');
    console.error(err);
    res.status(500).send('Server Error');
  }
};

const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ success: true, msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logoutUser,
  uploadProfilePicture,
  deleteProfilePicture,
  verifyPassword,
  resetPassword,
};