const logger = require('../utils/logger.utils');
const env = require('../config/environment');

// Not Found Error Handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// General Error Handler
exports.errorHandler = (err, req, res, next) => {
  // Log errors
  logger.error(`${err.name}: ${err.message}`);
  if (env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send response
  res.json({
    success: false,
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// MongoDB Validation Error Handler
exports.mongooseErrors = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${field}. This ${field} already exists.`
    });
  }
  
  next(err);
};
