const mongoose = require('mongoose');

/**
 * Media Schema
 * Represents media attachments (images, videos, gifs) for posts
 */
const mediaSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'gif'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  altText: {
    type: String,
    default: ''
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  metadata: {
    width: Number,
    height: Number,
    size: Number,
    duration: Number,
    format: String
  }
}, {
  timestamps: true
});

// Compound index for retrieving media in the correct order for a post
mediaSchema.index({ post: 1, orderIndex: 1 });

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
