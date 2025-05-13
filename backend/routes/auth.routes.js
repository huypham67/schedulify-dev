/**
 * Authentication routes
 * @module routes/auth
 */
const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { 
  validateUserRegistration, 
  validateUserLogin, 
  validateForgotPassword, 
  validatePasswordReset 
} = require('../middleware/validation.middleware');
const env = require('../config/environment');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
router.post(
  '/register', 
  validateUserRegistration,
  authController.register
);

/**
 * @route POST /api/auth/verify-email
 * @description Verify user email with token
 * @access Public
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @route POST /api/auth/login
 * @description Authenticate user and get tokens
 * @access Public
 */
router.post(
  '/login',
  validateUserLogin,
  authController.login
);

/**
 * @route POST /api/auth/refresh
 * @description Refresh access token
 * @access Public
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route POST /api/auth/forgot-password
 * @description Request password reset email
 * @access Public
 */
router.post(
  '/forgot-password',
  validateForgotPassword,
  authController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @description Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  validatePasswordReset,
  authController.resetPassword
);

/**
 * @route POST /api/auth/logout
 * @description Logout user and invalidate refresh token
 * @access Private
 */
router.post('/logout', authenticateJWT, authController.logout);

/**
 * @route GET /api/auth/me
 * @description Get current user profile
 * @access Private
 */
router.get('/me', authenticateJWT, authController.getCurrentUser);

// OAuth routes configuration
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  /**
   * @route GET /api/auth/google
   * @description Initiate Google OAuth flow
   * @access Public
   */
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  /**
   * @route GET /api/auth/google/callback
   * @description Handle Google OAuth callback
   * @access Public
   */
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.handleOAuthCallback
  );
}

if (env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET) {
  /**
   * @route GET /api/auth/facebook
   * @description Initiate Facebook OAuth flow
   * @access Public
   */
  router.get(
    '/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
  );

  /**
   * @route GET /api/auth/facebook/callback
   * @description Handle Facebook OAuth callback
   * @access Public
   */
  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    authController.handleOAuthCallback
  );
}

module.exports = router;
