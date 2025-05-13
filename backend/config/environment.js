require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  JWT_SECRET: process.env.JWT_SECRET || 'schedulify_jwt_secret',
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/schedulify',
  
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Schedulify <no-reply@schedulify.com>',
  
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
  
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Development options
  BYPASS_EMAIL_VERIFICATION: process.env.BYPASS_EMAIL_VERIFICATION || 'true',
  BYPASS_EMAIL_SENDING: process.env.BYPASS_EMAIL_SENDING || 'true',
  MOCK_DB: process.env.MOCK_DB || 'true'  // Use mock DB by default in development
};
