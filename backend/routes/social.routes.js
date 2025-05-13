/**
 * Social media integration routes
 * @module routes/social
 */
const express = require('express');
const socialController = require('../controllers/social.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');
const { validateSocialConnect } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * Apply authentication middleware to protected routes
 * Public routes: facebook/callback (OAuth callback from Facebook)
 * Protected routes: all others
 */
// Authenticated route group
router.use([
  '/accounts',
  '/connect/facebook',
  '/connect/facebook/callback/complete',
  '/disconnect'
], authenticateJWT);

/**
 * @route GET /api/social/accounts
 * @description Get user's connected social accounts
 * @access Private
 */
router.get('/accounts', socialController.getUserAccounts);

/**
 * @route GET /api/social/connect/facebook
 * @description Initialize Facebook connection
 * @access Private
 */
router.get('/connect/facebook', socialController.initFacebookConnect);

/**
 * @route GET /api/social/facebook/callback
 * @description Facebook OAuth callback (called by Facebook)
 * @access Public
 */
router.get('/facebook/callback', socialController.handleFacebookCallback);

/**
 * @route POST /api/social/connect/facebook/callback/complete
 * @description Complete Facebook connection after OAuth
 * @access Private
 */
router.post(
  '/connect/facebook/callback/complete',
  validateSocialConnect,
  socialController.connectFacebookAccounts
);

/**
 * @route DELETE /api/social/disconnect/:accountId
 * @description Disconnect a social account
 * @access Private
 */
router.delete('/disconnect/:accountId', socialController.disconnectAccount);

module.exports = router;
