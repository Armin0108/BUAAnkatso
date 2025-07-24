const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // format: Bearer TOKEN
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, userDecoded) => {
    if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });

    req.user = userDecoded; // { userId, login, role }
    next();
  });
};

module.exports = verifyToken;
