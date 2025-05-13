const app = require('./app');
const env = require('./config/environment');
const logger = require('./utils/logger.utils');

const PORT = env.PORT;

// Create HTTP server and listen on port
app.listen(PORT, () => {
  logger.info(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Don't crash the server in production
  if (env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Always crash on uncaught exceptions as the app state might be corrupted
  process.exit(1);
}); 