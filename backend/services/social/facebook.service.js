/**
 * Facebook integration service
 * @module services/social/facebook
 */
const axios = require('axios');
const SocialAccount = require('../../models/socialAccount.model');
const logger = require('../../utils/logger.utils');

// Facebook Graph API base URL
const FB_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Get user's Facebook pages
 * @param {string} accessToken - Facebook user access token
 * @returns {Promise<Array>} List of Facebook pages
 */
exports.getUserPages = async (accessToken) => {
  try {
    const response = await axios.get(`${FB_API_URL}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,access_token,category,picture'
      }
    });
    
    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    logger.error(`Error fetching Facebook pages: ${errorMessage}`);
    
    throw new Error(`Failed to fetch Facebook pages: ${errorMessage}`);
  }
};

/**
 * Get Instagram business account connected to Facebook page
 * @param {string} pageId - Facebook page ID
 * @param {string} pageAccessToken - Facebook page access token
 * @returns {Promise<Object|null>} Instagram account or null if not found
 */
exports.getInstagramAccount = async (pageId, pageAccessToken) => {
  try {
    const response = await axios.get(`${FB_API_URL}/${pageId}`, {
      params: {
        access_token: pageAccessToken,
        fields: 'instagram_business_account{id,name,username,profile_picture_url}'
      }
    });
    
    return response.data.instagram_business_account;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    logger.error(`Error fetching Instagram account: ${errorMessage}`);
    
    // Not all pages have Instagram accounts, so return null instead of throwing
    return null;
  }
};

/**
 * Save or update Facebook page as social account
 * @param {string} userId - User ID
 * @param {Object} page - Facebook page data
 * @returns {Promise<Object>} Created or updated social account
 */
exports.saveFacebookPage = async (userId, page) => {
  try {
    const existingAccount = await SocialAccount.findOne({
      user: userId,
      platform: 'facebook',
      platformUserId: page.id
    });
    
    if (existingAccount) {
      // Update existing account
      existingAccount.accessToken = page.access_token;
      existingAccount.accountName = page.name;
      existingAccount.profileImage = page.picture?.data?.url;
      existingAccount.isActive = true;
      await existingAccount.save();
      return existingAccount;
    }
    
    // Create new account
    const newAccount = new SocialAccount({
      user: userId,
      platform: 'facebook',
      platformId: 'page',
      platformUserId: page.id,
      accessToken: page.access_token,
      accountName: page.name,
      accountType: page.category,
      profileImage: page.picture?.data?.url,
      isActive: true,
      meta: {
        category: page.category
      }
    });
    
    await newAccount.save();
    return newAccount;
  } catch (error) {
    logger.error(`Error saving Facebook page: ${error.message}`);
    throw new Error(`Failed to save Facebook page: ${error.message}`);
  }
};

/**
 * Save or update Instagram account as social account
 * @param {string} userId - User ID
 * @param {Object} instagramAccount - Instagram account data
 * @param {string} pageId - Parent Facebook page ID
 * @returns {Promise<Object|null>} Created or updated social account, null if no Instagram account
 */
exports.saveInstagramAccount = async (userId, instagramAccount, pageId) => {
  try {
    if (!instagramAccount) return null;
    
    const existingAccount = await SocialAccount.findOne({
      user: userId,
      platform: 'instagram',
      platformUserId: instagramAccount.id
    });
    
    const fbPage = await SocialAccount.findOne({
      user: userId,
      platform: 'facebook',
      platformUserId: pageId
    });
    
    if (!fbPage) {
      throw new Error('Parent Facebook page not found');
    }
    
    if (existingAccount) {
      // Update existing account
      existingAccount.accountName = instagramAccount.username;
      existingAccount.profileImage = instagramAccount.profile_picture_url;
      existingAccount.isActive = true;
      existingAccount.meta = {
        ...existingAccount.meta,
        linkedFacebookPage: pageId
      };
      await existingAccount.save();
      return existingAccount;
    }
    
    // Create new account (using parent Facebook page token)
    const newAccount = new SocialAccount({
      user: userId,
      platform: 'instagram',
      platformId: 'business',
      platformUserId: instagramAccount.id,
      accessToken: fbPage.accessToken, // Using Facebook page token
      accountName: instagramAccount.username,
      profileImage: instagramAccount.profile_picture_url,
      isActive: true,
      meta: {
        linkedFacebookPage: pageId
      }
    });
    
    await newAccount.save();
    return newAccount;
  } catch (error) {
    logger.error(`Error saving Instagram account: ${error.message}`);
    throw new Error(`Failed to save Instagram account: ${error.message}`);
  }
};

/**
 * Post content to Facebook page
 * @param {string} socialAccountId - Social account ID
 * @param {Object} postData - Post content data
 * @param {string} [postData.message] - Text message
 * @param {string} [postData.link] - URL link
 * @param {Array} [postData.media] - Media attachments
 * @returns {Promise<Object>} API response data
 */
exports.postToFacebook = async (socialAccountId, postData) => {
  try {
    const account = await SocialAccount.findById(socialAccountId);
    if (!account || account.platform !== 'facebook') {
      throw new Error('Invalid Facebook account');
    }
    
    const { message, link, media } = postData;
    
    let endpoint = `${FB_API_URL}/${account.platformUserId}/feed`;
    let payload = { access_token: account.accessToken };
    
    // Add message if provided
    if (message) {
      payload.message = message;
    }
    
    // Add link if provided
    if (link) {
      payload.link = link;
    }
    
    // If there's media, use a different endpoint and payload
    if (media && media.length > 0) {
      if (media.length === 1 && media[0].type.startsWith('image')) {
        // Single image post
        endpoint = `${FB_API_URL}/${account.platformUserId}/photos`;
        payload.url = media[0].url;
        payload.caption = message || '';
      } else {
        // For multiple media, would need to create an album
        logger.info('Multiple media posting not fully implemented');
      }
    }
    
    const response = await axios.post(endpoint, payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    logger.error(`Error posting to Facebook: ${errorMessage}`);
    throw new Error(`Failed to post to Facebook: ${errorMessage}`);
  }
};

/**
 * Post content to Instagram account
 * @param {string} socialAccountId - Social account ID
 * @param {Object} postData - Post content data
 * @param {string} [postData.message] - Caption text
 * @param {Array} postData.media - Media attachments (required)
 * @returns {Promise<Object>} API response data
 */
exports.postToInstagram = async (socialAccountId, postData) => {
  try {
    const account = await SocialAccount.findById(socialAccountId);
    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }
    
    const { message, media } = postData;
    
    // Instagram requires an image
    if (!media || media.length === 0 || !media[0].url) {
      throw new Error('Media is required for Instagram posts');
    }
    
    // 1. Create container (required for Instagram API)
    const containerResponse = await axios.post(
      `${FB_API_URL}/${account.platformUserId}/media`, 
      {
        access_token: account.accessToken,
        image_url: media[0].url,
        caption: message || ''
      }
    );
    
    const containerId = containerResponse.data.id;
    
    // 2. Publish the container
    const publishResponse = await axios.post(
      `${FB_API_URL}/${account.platformUserId}/media_publish`,
      {
        access_token: account.accessToken,
        creation_id: containerId
      }
    );
    
    return publishResponse.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    logger.error(`Error posting to Instagram: ${errorMessage}`);
    throw new Error(`Failed to post to Instagram: ${errorMessage}`);
  }
};
