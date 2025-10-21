const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');       
const path = require('path');   

const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  
  const accessToken = jwt.sign(
    { id: user._id }, 
    process.env.JWT_SECRET, 
    {expiresIn: '15m'}
  );

  const refreshToken = jwt.sign(
    { id: user._id }, 
    process.env.JWT_REFRESH_SECRET, 
    {expiresIn: '7d'}
  );

  user.refreshToken = refreshToken;
  user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  const accessTokenCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000
  };

  const refreshTokenCookieOptions = {
    ...cookieOptions,
    path: '/api/auth/refresh'
  };

  if (rememberMe) {
    refreshTokenCookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
  }

  res
    .status(statusCode)
    .cookie('accessToken', accessToken, accessTokenCookieOptions)   // (nome, valore, opzioni)
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

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    sendTokenResponse(user, 200, res, false);  
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
};

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

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server!');
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'Refresh Token non presente, autorizzazione negata!' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);  

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ msg: 'Refresh Token non valido!' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Refresh Token non valido' });
  }
};

const logoutUser = async (req, res) => {
  res.cookie('accessToken', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true });
};

const uploadProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Utente non trovato!' });
    }
    if (req.file) {
      user.profilePicture = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      await user.save();
      res.json(user);
    } else {
      res.status(400).json({ msg: 'Per favore carica un file!' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
};

const deleteProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Utente non trovato!' });
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
    res.status(500).send('Errore del server!');
  }
};

const verifyPassword = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ msg: 'Password richiesta!' });
  }

  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ msg: 'Utente non trovato' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenziali non valide!' });
    }

    res.status(200).json({ success: true, msg: 'Password verificata correttamente!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
};

const resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Utente non trovato' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.status(200).json({ success: true, msg: 'Password aggiornata correttamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
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