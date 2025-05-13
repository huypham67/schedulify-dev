const express = require('express');
const { check } = require('express-validator');
const multer = require('multer');
const postController = require('../controllers/post.controller');
const mediaController = require('../controllers/media.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB size limit
    files: 10 // Max 10 files per upload
  },
  fileFilter: (req, file, cb) => {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Only images and videos are allowed.'), false);
    }
  }
});

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

/**
 * @route   GET /api/posts
 * @desc    Get all posts for the authenticated user with filtering
 * @access  Private
 */
router.get(
  '/',
  postController.getPosts
);

/**
 * @route   GET /api/posts/:id
 * @desc    Get a single post by ID
 * @access  Private
 */
router.get(
  '/:id',
  postController.getPostById
);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  '/',
  upload.array('media', 10),
  [
    check('content').optional().trim(),
    check('link').optional().trim().isURL().withMessage('Invalid URL format'),
    check('platforms').notEmpty().withMessage('At least one platform is required'),
    check('scheduledAt').optional().isISO8601().withMessage('Invalid date format')
  ],
  postController.createPost
);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private
 */
router.put(
  '/:id',
  upload.array('media', 10),
  [
    check('content').optional().trim(),
    check('link').optional().trim().isURL().withMessage('Invalid URL format'),
    check('platforms').optional(),
    check('scheduledAt').optional().isISO8601().withMessage('Invalid date format'),
    check('clearMedia').optional().isIn(['true', 'false']).withMessage('clearMedia must be true or false')
  ],
  postController.updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete(
  '/:id',
  postController.deletePost
);

/**
 * @route   POST /api/posts/:id/schedule
 * @desc    Schedule a post for publication
 * @access  Private
 */
router.post(
  '/:id/schedule',
  [
    check('scheduledAt').notEmpty().withMessage('scheduledAt is required')
      .isISO8601().withMessage('Invalid date format')
  ],
  postController.schedulePost
);

/**
 * @route   POST /api/posts/:id/publish
 * @desc    Publish a post immediately
 * @access  Private
 */
router.post(
  '/:id/publish',
  postController.publishPost
);

/**
 * @route   GET /api/posts/:postId/media
 * @desc    Get all media for a post
 * @access  Private
 */
router.get(
  '/:postId/media',
  mediaController.getMediaForPost
);

/**
 * @route   DELETE /api/posts/media/:id
 * @desc    Delete a media item
 * @access  Private
 */
router.delete(
  '/media/:id',
  mediaController.deleteMedia
);

module.exports = router;
