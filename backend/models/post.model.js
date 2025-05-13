const mongoose = require('mongoose');

/**
 * Post Schema
 * Represents a social media post that can be scheduled or published to multiple platforms
 */
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  scheduledAt: {
    type: Date,
    index: true
  },
  publishedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft',
    index: true
  },
  platforms: [{
    socialAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SocialAccount',
      required: true
    },
    platformPostId: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'failed'],
      default: 'pending'
    },
    publishedAt: {
      type: Date
    },
    errorMessage: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
postSchema.index({ user: 1, status: 1 });
postSchema.index({ scheduledAt: 1, status: 1 });

// Virtual for media
postSchema.virtual('media', {
  ref: 'Media',
  localField: '_id',
  foreignField: 'post'
});

// Ensure virtuals are included when converting to JSON
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
