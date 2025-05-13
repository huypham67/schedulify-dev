const express = require('express');
const multer = require('multer');
const mediaController = require('../controllers/media.controller');
const { authenticateJWT } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB size limit
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
 * @route   POST /api/media/upload
 * @desc    Upload a media file
 * @access  Private
 */
router.post(
  '/upload',
  upload.single('file'),
  mediaController.uploadMedia
);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete a media file
 * @access  Private
 */
router.delete(
  '/:id',
  mediaController.deleteMedia
);

module.exports = router; 