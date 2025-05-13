const axios = require('axios');
const SocialAccount = require('../../models/socialAccount.model');
const logger = require('../../utils/logger.utils');

// Instagram Graph API is accessed via Facebook Graph API
const IG_API_URL = 'https://graph.facebook.com/v18.0';

/**
 * Get Instagram account information
 */
exports.getAccountInfo = async (socialAccountId) => {
  try {
    const account = await SocialAccount.findById(socialAccountId);
    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }
    
    const response = await axios.get(`${IG_API_URL}/${account.platformUserId}`, {
      params: {
        access_token: account.accessToken,
        fields: 'id,username,profile_picture_url,followers_count,follows_count,media_count'
      }
    });
    
    return response.data;
  } catch (error) {
    logger.error('Error fetching Instagram account info:', error.response?.data || error.message);
    throw new Error('Failed to fetch Instagram account info');
  }
};

/**
 * Get recent media from Instagram account
 */
exports.getRecentMedia = async (socialAccountId, limit = 10) => {
  try {
    const account = await SocialAccount.findById(socialAccountId);
    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }
    
    const response = await axios.get(`${IG_API_URL}/${account.platformUserId}/media`, {
      params: {
        access_token: account.accessToken,
        fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
        limit
      }
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching Instagram media:', error.response?.data || error.message);
    throw new Error('Failed to fetch Instagram media');
  }
};

/**
 * Post to Instagram (requires a connected Facebook page)
 */
exports.createPost = async (socialAccountId, postData) => {
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
    
    // 1. Create container
    const containerResponse = await axios.post(
      `${IG_API_URL}/${account.platformUserId}/media`, 
      {
        access_token: account.accessToken,
        image_url: media[0].url,
        caption: message || ''
      }
    );
    
    const containerId = containerResponse.data.id;
    
    // 2. Publish the container
    const publishResponse = await axios.post(
      `${IG_API_URL}/${account.platformUserId}/media_publish`,
      {
        access_token: account.accessToken,
        creation_id: containerId
      }
    );
    
    return publishResponse.data;
  } catch (error) {
    logger.error('Error posting to Instagram:', error.response?.data || error.message);
    throw new Error('Failed to post to Instagram');
  }
};

/**
 * Get Instagram insights for a media post
 */
exports.getMediaInsights = async (socialAccountId, mediaId) => {
  try {
    const account = await SocialAccount.findById(socialAccountId);
    if (!account || account.platform !== 'instagram') {
      throw new Error('Invalid Instagram account');
    }
    
    const response = await axios.get(`${IG_API_URL}/${mediaId}/insights`, {
      params: {
        access_token: account.accessToken,
        metric: 'engagement,impressions,reach,saved'
      }
    });
    
    return response.data.data;
  } catch (error) {
    logger.error('Error fetching Instagram insights:', error.response?.data || error.message);
    throw new Error('Failed to fetch Instagram insights');
  }
};
