const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Media = require('../models/media.model');
const logger = require('../utils/logger.utils');
const env = require('../config/environment');

/**
 * Media Service
 * Handles uploading and managing media files
 */
class MediaService {
  /**
   * Save a media file to disk and create a database entry
   * 
   * @param {Object} file - The uploaded file
   * @param {string} postId - The ID of the post this media belongs to
   * @param {Object} options - Additional options like type, altText, etc.
   * @returns {Promise<Object>} The saved media document
   */
  async saveMedia(file, postId, options = {}) {
    try {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate a unique filename
      const extension = path.extname(file.originalname);
      const filename = `${uuidv4()}${extension}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Write file to disk
      await fs.promises.writeFile(filepath, file.buffer);
      
      // Determine media type from mimetype
      let mediaType = 'image';
      if (file.mimetype.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.mimetype === 'image/gif') {
        mediaType = 'gif';
      }
      
      // Create media document
      const media = new Media({
        post: postId,
        type: options.type || mediaType,
        url: `/uploads/${filename}`,
        altText: options.altText || '',
        orderIndex: options.orderIndex || 0,
        metadata: {
          width: options.width,
          height: options.height,
          size: file.size,
          format: file.mimetype,
          duration: options.duration
        }
      });
      
      // Save to database
      await media.save();
      
      logger.info(`Media saved: ${media._id} for post ${postId}`);
      return media;
    } catch (error) {
      logger.error(`Error saving media: ${error.message}`);
      throw new Error(`Failed to save media: ${error.message}`);
    }
  }
  
  /**
   * Get all media for a post
   * 
   * @param {string} postId - The ID of the post
   * @returns {Promise<Array>} Array of media objects
   */
  async getMediaForPost(postId) {
    try {
      return await Media.find({ post: postId }).sort({ orderIndex: 1 });
    } catch (error) {
      logger.error(`Error getting media for post ${postId}: ${error.message}`);
      throw new Error(`Failed to get media for post: ${error.message}`);
    }
  }
  
  /**
   * Delete media file and record
   * 
   * @param {string} mediaId - The ID of the media to delete
   * @param {string} userId - The user ID making the request (for authorization)
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deleteMedia(mediaId, userId) {
    try {
      // Find the media
      const media = await Media.findById(mediaId).populate({
        path: 'post',
        select: 'user'
      });
      
      if (!media) {
        throw new Error('Media not found');
      }
      
      // Verify ownership
      if (media.post && media.post.user.toString() !== userId) {
        throw new Error('Not authorized to delete this media');
      }
      
      // Delete file from disk
      if (media.url && media.url.startsWith('/uploads/')) {
        const filename = media.url.split('/').pop();
        const filepath = path.join(__dirname, '../uploads', filename);
        
        if (fs.existsSync(filepath)) {
          await fs.promises.unlink(filepath);
        }
      }
      
      // Delete from database
      await Media.deleteOne({ _id: mediaId });
      logger.info(`Media deleted: ${mediaId}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting media ${mediaId}: ${error.message}`);
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }
  
  /**
   * Delete all media for a post
   * 
   * @param {string} postId - The ID of the post
   * @returns {Promise<number>} Number of deleted media items
   */
  async deleteMediaForPost(postId) {
    try {
      const media = await Media.find({ post: postId });
      
      // Delete files from disk
      for (const item of media) {
        if (item.url && item.url.startsWith('/uploads/')) {
          const filename = item.url.split('/').pop();
          const filepath = path.join(__dirname, '../uploads', filename);
          
          if (fs.existsSync(filepath)) {
            await fs.promises.unlink(filepath);
          }
        }
      }
      
      // Delete from database
      const result = await Media.deleteMany({ post: postId });
      logger.info(`Deleted ${result.deletedCount} media items for post ${postId}`);
      
      return result.deletedCount;
    } catch (error) {
      logger.error(`Error deleting media for post ${postId}: ${error.message}`);
      throw new Error(`Failed to delete media for post: ${error.message}`);
    }
  }
}

module.exports = new MediaService(); 