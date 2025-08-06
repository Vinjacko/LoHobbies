const User = require('../models/User');
const bcrypt = require('bcryptjs');   // permette di criptare le password in modo sicuro ed è usata con login e registrazione utenti
const jwt = require('jsonwebtoken');
const fs = require('fs');       // modulo nativo di Node.js che permette di: leggere file, scrivere file, creare, rinominare o cancellare file e cartelle, lavorare con path e file system in generale
const path = require('path');   // modulo path di Node.js che permette di lavorare facilmente con percorsi di file e cartelle nel filesystem

// funzione per generare i token e settare i cookies
const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  // crea l'access token
  const accessToken = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, 
    {expiresIn: '15m'}
  );

  // crea il refresh token
  const refreshToken = jwt.sign(
    { id: user._id }, 
    process.env.JWT_REFRESH_SECRET, 
    {expiresIn: '7d'}
  );

  // conserva il refresh token nel DB
  user.refreshToken = refreshToken;
  user.save();

  // crea il cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000  // 15 minuti
  };

  const refreshTokenCookieOptions = {
    ...cookieOptions,
    path: '/api/auth/refresh'   // specifica a quale percorso del server il cookie deve essere inviato
  };

  if (rememberMe) {
    refreshTokenCookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 giorni
  }

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, accessTokenCookieOptions)   // (nome, valore, opzioni)
    .cookie('refreshToken', refreshToken, refreshTokenCookieOptions)
    .json({
      success: true,  // esito positivo
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
};

// registra un nuovo utente
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'L\'utente già esiste!' });
    }

    user = new User({
      name,
      email,
      password,
    });

    // encoding della password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    sendTokenResponse(user, 200, res, false);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
};

// procedura di login per un utente
const loginUser = async (req, res) => {
  const { email, password, rememberMe } = req.body;

  try {
    let user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ msg: 'Email o Password non validi!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Password non valida!' });
    }

    sendTokenResponse(user, 200, res, rememberMe);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
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
      user.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
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

    if (user.profilePicture) {
      const filename = path.basename(user.profilePicture);
      const imagePath = path.join(__dirname, '..', 'public', 'uploads', filename);
      
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        }
      });
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