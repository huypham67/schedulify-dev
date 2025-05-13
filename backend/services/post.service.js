const Post = require('../models/post.model');
const Media = require('../models/media.model');
const mediaService = require('./media.service');
const logger = require('../utils/logger.utils');

/**
 * Post Service
 * Handles all operations related to post management
 */
class PostService {
  /**
   * Create a new post
   * 
   * @param {string} userId - The user ID creating the post
   * @param {Object} postData - Post data including content, platforms, etc.
   * @returns {Promise<Object>} The created post
   */
  async createPost(userId, postData) {
    try {
      const { content, link, platforms, scheduledAt } = postData;
      
      // Validate platforms exist
      if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
        throw new Error('At least one platform must be specified');
      }
      
      // Create post with initial status
      const post = new Post({
        user: userId,
        content: content || '',
        link: link || '',
        platforms: platforms.map(platformId => ({ socialAccount: platformId })),
        status: scheduledAt ? 'scheduled' : 'draft',
        scheduledAt: scheduledAt || null
      });
      
      // Save post to database
      await post.save();
      logger.info(`Post created: ${post._id} by user ${userId}`);
      
      return post;
    } catch (error) {
      logger.error(`Error creating post: ${error.message}`);
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }
  
  /**
   * Get all posts for a user with filtering options
   * 
   * @param {string} userId - User ID
   * @param {Object} filters - Filtering options
   * @returns {Promise<Object>} Posts with pagination data
   */
  async getPostsByUser(userId, filters = {}) {
    try {
      const { status, platform, startDate, endDate, page = 1, limit = 10 } = filters;
      
      // Build query
      const query = { user: userId };
      
      // Apply filters
      if (status) {
        query.status = status;
      }
      
      if (platform) {
        query['platforms.socialAccount'] = platform;
      }
      
      if (startDate || endDate) {
        query.scheduledAt = {};
        
        if (startDate) {
          query.scheduledAt.$gte = new Date(startDate);
        }
        
        if (endDate) {
          query.scheduledAt.$lte = new Date(endDate);
        }
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Execute query with pagination and populate references
      const posts = await Post.find(query)
        .sort({ scheduledAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('platforms.socialAccount');
      
      // Get total count for pagination
      const total = await Post.countDocuments(query);
      
      // Load media for each post
      const postsWithMedia = await Promise.all(
        posts.map(async (post) => {
          const media = await Media.find({ post: post._id }).sort({ orderIndex: 1 });
          const postObj = post.toObject();
          postObj.media = media;
          return postObj;
        })
      );
      
      return {
        posts: postsWithMedia,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      };
    } catch (error) {
      logger.error(`Error getting posts for user ${userId}: ${error.message}`);
      throw new Error(`Failed to get posts: ${error.message}`);
    }
  }
  
  /**
   * Get a single post by ID
   * 
   * @param {string} postId - Post ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} Post with media
   */
  async getPostById(postId, userId) {
    try {
      // Find post and check ownership
      const post = await Post.findOne({
        _id: postId,
        user: userId
      }).populate('platforms.socialAccount');
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Get media for the post
      const media = await Media.find({ post: postId }).sort({ orderIndex: 1 });
      
      // Return post with media
      const postObj = post.toObject();
      postObj.media = media;
      
      return postObj;
    } catch (error) {
      logger.error(`Error getting post ${postId}: ${error.message}`);
      throw new Error(`Failed to get post: ${error.message}`);
    }
  }
  
  /**
   * Update a post
   * 
   * @param {string} postId - Post ID
   * @param {string} userId - User ID (for authorization)
   * @param {Object} updateData - Updated post data
   * @returns {Promise<Object>} Updated post
   */
  async updatePost(postId, userId, updateData) {
    try {
      // Find post and check ownership
      const post = await Post.findOne({
        _id: postId,
        user: userId
      });
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Don't allow updating published posts
      if (post.status === 'published') {
        throw new Error('Cannot update a published post');
      }
      
      const { content, link, platforms, scheduledAt } = updateData;
      
      // Update fields if provided
      if (content !== undefined) post.content = content;
      if (link !== undefined) post.link = link;
      
      if (scheduledAt !== undefined) {
        post.scheduledAt = scheduledAt || null;
        post.status = scheduledAt ? 'scheduled' : 'draft';
      }
      
      // Update platforms if provided
      if (platforms && Array.isArray(platforms)) {
        post.platforms = platforms.map(platformId => ({
          socialAccount: platformId,
          status: 'pending'
        }));
      }
      
      // Save updated post
      await post.save();
      logger.info(`Post updated: ${post._id} by user ${userId}`);
      
      return post;
    } catch (error) {
      logger.error(`Error updating post ${postId}: ${error.message}`);
      throw new Error(`Failed to update post: ${error.message}`);
    }
  }
  
  /**
   * Delete a post and its associated media
   * 
   * @param {string} postId - Post ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deletePost(postId, userId) {
    try {
      // Find post and check ownership
      const post = await Post.findOne({
        _id: postId,
        user: userId
      });
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Delete associated media first
      await mediaService.deleteMediaForPost(postId);
      
      // Delete the post
      await Post.deleteOne({ _id: postId });
      logger.info(`Post deleted: ${postId} by user ${userId}`);
      
      return true;
    } catch (error) {
      logger.error(`Error deleting post ${postId}: ${error.message}`);
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  }
  
  /**
   * Schedule a post for publishing
   * 
   * @param {string} postId - Post ID
   * @param {string} userId - User ID (for authorization)
   * @param {Date} scheduledAt - When to publish the post
   * @returns {Promise<Object>} Updated post
   */
  async schedulePost(postId, userId, scheduledAt) {
    try {
      // Find post and check ownership
      const post = await Post.findOne({
        _id: postId,
        user: userId
      });
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Don't schedule posts that are already published
      if (post.status === 'published') {
        throw new Error('Cannot schedule a published post');
      }
      
      // Validate scheduledAt
      if (!scheduledAt) {
        throw new Error('Scheduled date is required');
      }
      
      // Update status and scheduledAt
      post.status = 'scheduled';
      post.scheduledAt = new Date(scheduledAt);
      
      // Save post
      await post.save();
      logger.info(`Post scheduled: ${post._id} for ${scheduledAt}`);
      
      return post;
    } catch (error) {
      logger.error(`Error scheduling post ${postId}: ${error.message}`);
      throw new Error(`Failed to schedule post: ${error.message}`);
    }
  }
  
  /**
   * Get all posts scheduled for a specific time range
   * 
   * @param {Date} startTime - Range start
   * @param {Date} endTime - Range end
   * @returns {Promise<Array>} Array of scheduled posts
   */
  async getScheduledPosts(startTime, endTime) {
    try {
      return await Post.find({
        status: 'scheduled',
        scheduledAt: {
          $gte: startTime,
          $lte: endTime
        }
      }).populate('platforms.socialAccount user');
    } catch (error) {
      logger.error(`Error getting scheduled posts: ${error.message}`);
      throw new Error(`Failed to get scheduled posts: ${error.message}`);
    }
  }
}

module.exports = new PostService(); 