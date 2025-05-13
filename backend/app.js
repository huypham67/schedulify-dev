const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const socialRoutes = require('./routes/social.routes');
const postRoutes = require('./routes/post.routes');
const mediaRoutes = require('./routes/media.routes');
const schedulerService = require('./services/scheduler.service');
const logger = require('./utils/logger.utils');
const env = require('./config/environment');
const path = require('path');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    logger.info('MongoDB connected');
    
    // Initialize scheduler after database connection
    schedulerService.initScheduler();
  })
  .catch(err => logger.error(`MongoDB connection error: ${err.message}`));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/media', mediaRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Schedulify API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Not Found middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

module.exports = app; 