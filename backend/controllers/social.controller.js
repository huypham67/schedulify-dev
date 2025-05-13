const axios = require('axios');
const facebookService = require('../services/social/facebook.service');
const socialService = require('../services/social/common.service');
const logger = require('../utils/logger.utils');
const env = require('../config/environment');
const { validateObjectId } = require('../utils/validation.utils');

// Define API base URL if not in environment
const API_BASE_URL = env.API_BASE_URL || `http://localhost:${env.PORT}`;

/**
 * Get user's connected social accounts
 * @route GET /api/social/accounts
 */
exports.getUserAccounts = async (req, res) => {
  try {
    const userId = req.user._id;
    const accounts = await socialService.getUserAccounts(userId);
    
    return res.status(200).json({
      success: true,
      data: accounts
    });
  } catch (error) {
    logger.error('Error fetching social accounts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching social accounts'
    });
  }
};

/**
 * Initialize Facebook connection process
 * @route GET /api/social/connect/facebook
 */
exports.initFacebookConnect = async (req, res) => {
  try {
    // Generate a state param for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    
    // Note: In production, store state in session/database with expiry to verify on callback
    
    // Generate Facebook OAuth URL
    const redirectUri = `${API_BASE_URL}/api/social/facebook/callback`;
    const fbLoginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&state=${state}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish`;
    
    return res.status(200).json({
      success: true,
      data: {
        authUrl: fbLoginUrl,
        state
      }
    });
  } catch (error) {
    logger.error('Error initializing Facebook connection:', error);
    return res.status(500).json({
      success: false,
      message: 'Error initializing Facebook connection'
    });
  }
};

/**
 * Handle Facebook OAuth callback - exchange code for token
 * @route GET /api/social/facebook/callback
 */
exports.handleFacebookCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    // Validate state parameter (CSRF protection)
    // In production, verify state matches stored value and hasn't expired
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code is missing'
      });
    }
    
    // Exchange code for access token
    const redirectUri = `${API_BASE_URL}/api/social/facebook/callback`;
    
    // Fix the Facebook API request format to properly include parameters
    try {
      const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          client_id: env.FACEBOOK_APP_ID,
          client_secret: env.FACEBOOK_APP_SECRET,
          redirect_uri: redirectUri,
          code: code
        }
      });
      
      const accessToken = tokenResponse.data.access_token;
      
      // Redirect to frontend with token
      return res.redirect(`${env.FRONTEND_URL}/social/connect?token=${accessToken}`);
    } catch (apiError) {
      logger.error('Facebook API Error:', apiError.response?.data || apiError.message);
      return res.redirect(`${env.FRONTEND_URL}/social/connect?error=token`);
    }
  } catch (error) {
    logger.error('Error handling Facebook callback:', error);
    return res.redirect(`${env.FRONTEND_URL}/social/connect?error=true`);
  }
};

/**
 * Connect Facebook accounts (pages and Instagram)
 * @route POST /api/social/connect/facebook/callback/complete
 */
exports.connectFacebookAccounts = async (req, res) => {
  try {
    const { accessToken } = req.body;
    const userId = req.user._id;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    // Get user's Facebook pages
    const pages = await facebookService.getUserPages(accessToken);
    
    if (!pages || pages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No Facebook pages found'
      });
    }
    
    const connectedAccounts = [];
    
    // Process each page
    for (const page of pages) {
      // Save Facebook page
      const fbAccount = await facebookService.saveFacebookPage(userId, page);
      connectedAccounts.push(fbAccount);
      
      // Check for Instagram account
      const instagramAccount = await facebookService.getInstagramAccount(page.id, page.access_token);
      
      if (instagramAccount) {
        const igAccount = await facebookService.saveInstagramAccount(userId, instagramAccount, page.id);
        if (igAccount) {
          connectedAccounts.push(igAccount);
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Social accounts connected successfully',
      data: connectedAccounts
    });
  } catch (error) {
    logger.error('Error connecting Facebook accounts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error connecting Facebook accounts'
    });
  }
};

/**
 * Disconnect social account
 * @route DELETE /api/social/accounts/:accountId
 */
exports.disconnectAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;
    
    // Validate account ID
    if (!validateObjectId(accountId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account ID format'
      });
    }
    
    // Check if account exists and belongs to user
    const account = await socialService.getAccountById(accountId, userId);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }
    
    // Deactivate account (preserves history)
    await socialService.updateAccountStatus(accountId, userId, false);
    
    return res.status(200).json({
      success: true,
      message: 'Account disconnected successfully'
    });
  } catch (error) {
    logger.error('Error disconnecting account:', error);
    return res.status(500).json({
      success: false,
      message: 'Error disconnecting account'
    });
  }
};
