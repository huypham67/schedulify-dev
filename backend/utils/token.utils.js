const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/environment');

// Generate JWT access token
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRATION
  });
};

// Generate JWT refresh token
exports.generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate email verification token
exports.generateEmailVerificationToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Generate password reset token
exports.generatePasswordResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};
