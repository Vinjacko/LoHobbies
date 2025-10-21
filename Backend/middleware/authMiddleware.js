const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Controlla prima i cookie, poi l'header Authorization come fallback
  let token = req.cookies.accessToken;
  
  // Se non c'è nei cookie, controlla l'header Authorization
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ msg: 'Nessun token, autorizzazione negata' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ msg: 'Il token non è valido!' });
  }
};

module.exports = {
    protect
};