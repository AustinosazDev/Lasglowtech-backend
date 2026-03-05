const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();  // Ensure .env is loaded
const config = require('./');

const generateToken = (adminId) => {
  return jwt.sign({ id: adminId }, config.secret, {
    expiresIn: config.expires_in || '1d',
  });
};

module.exports = generateToken;
