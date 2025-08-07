const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // prende il token dal cookie
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ msg: 'Nessun token, autorizzazione negata' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Il token non è valido!' });
  }
};

module.exports = {
    protect
};