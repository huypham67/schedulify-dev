const { validationResult } = require('express-validator');
const postService = require('../services/post.service');
const mediaService = require('../services/media.service');
const schedulerService = require('../services/scheduler.service');
const logger = require('../utils/logger.utils');

/**
 * Post Controller
 * Handles HTTP requests related to posts
 */
class PostController {
  /**
   * Create a new post
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async createPost(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
      
      const { content, link, platforms, scheduledAt } = req.body;
      
      // Create post first
      const post = await postService.createPost(req.user._id, {
        content,
        link,
        platforms: platforms ? JSON.parse(platforms) : [],
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null
      });
      
      // Handle any uploaded media files
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          await mediaService.saveMedia(req.files[i], post._id, {
            orderIndex: i,
            altText: req.body[`altText${i}`] || ''
          });
        }
      }
      
      // Return the post with media attached
      const postWithMedia = await postService.getPostById(post._id, req.user._id);
      
      res.status(201).json({
        success: true,
        data: postWithMedia
      });
    } catch (error) {
      logger.error(`Create post error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create post'
      });
    }
  }
  
  /**
   * Get user's posts with filtering
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async getPosts(req, res) {
    try {
      const { status, platform, startDate, endDate, page, limit } = req.query;
      
      const result = await postService.getPostsByUser(req.user._id, {
        status,
        platform,
        startDate,
        endDate,
        page: page || 1,
        limit: limit || 10
      });
      
      res.status(200).json({
        success: true,
        data: result.posts,
        pagination: result.pagination
      });
    } catch (error) {
      logger.error(`Get posts error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch posts'
      });
    }
  }
  
  /**
   * Get a single post by ID
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async getPostById(req, res) {
    try {
      const post = await postService.getPostById(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      logger.error(`Get post error: ${error.message}`);
      
      if (error.message === 'Post not found') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch post'
      });
    }
  }
  
  /**
   * Update a post
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async updatePost(req, res) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }
      
      const postId = req.params.id;
      const { content, link, platforms, scheduledAt, clearMedia } = req.body;
      
      // Update post
      const post = await postService.updatePost(postId, req.user._id, {
        content,
        link,
        platforms: platforms ? JSON.parse(platforms) : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      });
      
      // Handle media updates if needed
      if (clearMedia === 'true') {
        await mediaService.deleteMediaForPost(postId);
      }
      
      if (req.files && req.files.length > 0) {
        // Delete existing media if we're replacing it
        if (clearMedia !== 'true') {
          await mediaService.deleteMediaForPost(postId);
        }
        
        // Add new media files
        for (let i = 0; i < req.files.length; i++) {
          await mediaService.saveMedia(req.files[i], post._id, {
            orderIndex: i,
            altText: req.body[`altText${i}`] || ''
          });
        }
      }
      
      // Get updated post with media
      const updatedPost = await postService.getPostById(postId, req.user._id);
      
      res.status(200).json({
        success: true,
        data: updatedPost
      });
    } catch (error) {
      logger.error(`Update post error: ${error.message}`);
      
      if (error.message === 'Post not found') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update post'
      });
    }
  }
  
  /**
   * Delete a post
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async deletePost(req, res) {
    try {
      await postService.deletePost(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      logger.error(`Delete post error: ${error.message}`);
      
      if (error.message === 'Post not found') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete post'
      });
    }
  }
  
  /**
   * Schedule a post
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async schedulePost(req, res) {
    try {
      const { scheduledAt } = req.body;
      
      if (!scheduledAt) {
        return res.status(400).json({
          success: false,
          message: 'scheduledAt is required'
        });
      }
      
      const post = await postService.schedulePost(
        req.params.id,
        req.user._id,
        new Date(scheduledAt)
      );
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      logger.error(`Schedule post error: ${error.message}`);
      
      if (error.message === 'Post not found') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to schedule post'
      });
    }
  }
  
  /**
   * Publish a post immediately
   * 
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} HTTP response
   */
  async publishPost(req, res) {
    try {
      const post = await schedulerService.publishPostNow(req.params.id, req.user._id);
      
      res.status(200).json({
        success: true,
        data: post
      });
    } catch (error) {
      logger.error(`Publish post error: ${error.message}`);
      
      if (error.message === 'Post not found') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to publish post'
      });
    }
  }
}

module.exports = new PostController();
