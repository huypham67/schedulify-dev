const mediaService = require('../services/media.service');
const logger = require('../utils/logger.utils');

/**
 * Media Controller
 * Handles HTTP requests related to media files
 */
class MediaController {
  /**
   * Upload a media file independently of a post
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async uploadMedia(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }
      
      // Create a temporary post ID for standalone media upload
      const tempPostId = 'temp_' + req.user._id + '_' + Date.now();
      
      // Save media
      const media = await mediaService.saveMedia(req.file, tempPostId, {
        altText: req.body.altText || ''
      });
      
      res.status(201).json({
        success: true,
        data: media
      });
    } catch (error) {
      logger.error(`Upload media error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload media'
      });
    }
  }
  
  /**
   * Delete a media file
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async deleteMedia(req, res) {
    try {
      const result = await mediaService.deleteMedia(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        message: 'Media deleted successfully'
      });
    } catch (error) {
      logger.error(`Delete media error: ${error.message}`);
      
      if (error.message === 'Media not found') {
        return res.status(404).json({
          success: false,
          message: 'Media not found'
        });
      }
      
      if (error.message === 'Not authorized to delete this media') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this media'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete media'
      });
    }
  }
  
  /**
   * Get media for a post
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async getMediaForPost(req, res) {
    try {
      const media = await mediaService.getMediaForPost(req.params.postId);
      
      res.status(200).json({
        success: true,
        data: media
      });
    } catch (error) {
      logger.error(`Get media error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get media'
      });
    }
  }
}

module.exports = new MediaController(); 