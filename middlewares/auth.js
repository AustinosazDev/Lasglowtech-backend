const jwt = require('jsonwebtoken');
const config = require('../config');

const jwtSecret = config.secret || process.env.JWT_SECRET || 'lasglowtech-dev-secret';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  return verifyToken(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' });
    }
    return next();
  });
};

const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch {
    req.user = null;
    return next();
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  optionalVerifyToken,
};
