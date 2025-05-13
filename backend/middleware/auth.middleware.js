/**
 * Authentication middleware
 * @module middleware/auth
 */
const { verifyToken } = require('../utils/token.utils');
const User = require('../models/user.model');
const logger = require('../utils/logger.utils');

/**
 * Authenticate user using JWT token
 * Verifies the JWT token from Authorization header and adds user to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.authenticateJWT = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      logger.warn('Invalid or expired JWT token attempt');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token.' 
      });
    }
    
    // Add user to request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.warn(`JWT with non-existent user ID: ${decoded.id}`);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error.' 
    });
  }
};

/**
 * Authorize user based on roles
 * Checks if authenticated user has the required role(s)
 * Must be used after authenticateJWT middleware
 * 
 * @param {...string} roles - Roles that are allowed to access the resource
 * @returns {Function} Express middleware function
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in first' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Unauthorized role access attempt: User ${req.user._id} with role ${req.user.role} attempted to access resource requiring ${roles.join(', ')}`);
      return res.status(403).json({ 
        success: false, 
        message: `Role (${req.user.role}) is not allowed to access this resource` 
      });
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Verifies JWT if present but does not require it
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without user
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      // Invalid token, continue without user
      return next();
    }
    
    // Add user to request if found
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // On error, continue without user
    logger.error('Optional auth middleware error:', error);
    next();
  }
};
