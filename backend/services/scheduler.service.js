const cron = require('node-cron');
const postService = require('./post.service');
const socialServices = require('./social');
const logger = require('../utils/logger.utils');
const Post = require('../models/post.model');
const Media = require('../models/media.model');

/**
 * Scheduler Service
 * Handles scheduling and publishing of posts
 */
class SchedulerService {
  /**
   * Initialize the scheduler
   */
  initScheduler() {
    // Run every minute to check for posts that need to be published
    cron.schedule('* * * * *', async () => {
      await this.processScheduledPosts();
    });
    
    logger.info('Post scheduler initialized');
  }
  
  /**
   * Process posts that are scheduled for publication
   */
  async processScheduledPosts() {
    try {
      // Find posts scheduled for now or in the past that are still in 'scheduled' status
      const currentTime = new Date();
      const posts = await Post.find({
        status: 'scheduled',
        scheduledAt: { $lte: currentTime }
      }).populate('platforms.socialAccount user');
      
      if (posts.length === 0) {
        return;
      }
      
      logger.info(`Processing ${posts.length} scheduled posts`);
      
      // Process each post
      for (const post of posts) {
        try {
          await this.publishPost(post);
        } catch (error) {
          logger.error(`Error publishing scheduled post ${post._id}: ${error.message}`);
          
          // Update post status to failed
          post.status = 'failed';
          await post.save();
        }
      }
    } catch (error) {
      logger.error(`Error processing scheduled posts: ${error.message}`);
    }
  }
  
  /**
   * Publish a post to all selected platforms
   * 
   * @param {Object} post - The post to publish
   * @returns {Promise<Object>} The updated post
   */
  async publishPost(post) {
    try {
      // Get media for the post
      const media = await Media.find({ post: post._id }).sort({ orderIndex: 1 });
      
      // Create post data object
      const postData = {
        message: post.content,
        link: post.link,
        media: media.map(m => ({
          url: m.url,
          type: m.type,
          altText: m.altText
        }))
      };
      
      // Publish to each platform
      for (let i = 0; i < post.platforms.length; i++) {
        const platform = post.platforms[i];
        
        try {
          let result = null;
          const accountType = platform.socialAccount.platform;
          
          // Publish based on platform type
          if (accountType === 'facebook') {
            result = await socialServices.facebook.publishPost(
              platform.socialAccount._id,
              postData
            );
          } else if (accountType === 'instagram') {
            result = await socialServices.facebook.publishToInstagram(
              platform.socialAccount._id,
              postData
            );
          } else if (accountType === 'twitter') {
            // Add Twitter implementation when available
            throw new Error(`Publishing to ${accountType} not implemented yet`);
          } else {
            throw new Error(`Unknown platform: ${accountType}`);
          }
          
          // Update platform status
          platform.status = 'published';
          platform.publishedAt = new Date();
          platform.platformPostId = result?.id;
          
        } catch (error) {
          logger.error(`Error publishing to ${platform.socialAccount.platform}: ${error.message}`);
          
          // Update platform with error
          platform.status = 'failed';
          platform.errorMessage = error.message;
        }
      }
      
      // Update post status
      const allSuccess = post.platforms.every(p => p.status === 'published');
      const allFailed = post.platforms.every(p => p.status === 'failed');
      
      if (allSuccess) {
        post.status = 'published';
        post.publishedAt = new Date();
      } else if (allFailed) {
        post.status = 'failed';
      } else {
        // Partial success
        post.status = 'published';
        post.publishedAt = new Date();
      }
      
      await post.save();
      logger.info(`Post ${post._id} published with status: ${post.status}`);
      
      return post;
    } catch (error) {
      logger.error(`Error publishing post ${post._id}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Publish a post immediately
   * 
   * @param {string} postId - The post ID to publish
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<Object>} The updated post
   */
  async publishPostNow(postId, userId) {
    try {
      // Find post and check ownership
      const post = await Post.findOne({
        _id: postId,
        user: userId
      }).populate('platforms.socialAccount');
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Don't publish posts that are already published
      if (post.status === 'published') {
        throw new Error('Post is already published');
      }
      
      // Update the post's user field with the full user object
      post.user = userId;
      
      // Publish the post
      return await this.publishPost(post);
    } catch (error) {
      logger.error(`Error publishing post immediately ${postId}: ${error.message}`);
      throw new Error(`Failed to publish post: ${error.message}`);
    }
  }
}

module.exports = new SchedulerService();
