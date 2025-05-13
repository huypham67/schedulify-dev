/**
 * Common social account service - handles account management operations
 * @module services/social/common
 */
const SocialAccount = require('../../models/socialAccount.model');
const logger = require('../../utils/logger.utils');

/**
 * Get all active social accounts for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of social accounts
 * @throws {Error} If database operation fails
 */
exports.getUserAccounts = async (userId) => {
  try {
    return await SocialAccount.find({
      user: userId,
      isActive: true
    }).sort({ platform: 1, accountName: 1 });
  } catch (error) {
    logger.error(`Error fetching user accounts: ${error.message}`);
    throw new Error(`Failed to fetch social accounts: ${error.message}`);
  }
};

/**
 * Get social account by ID and verify ownership
 * @param {string} accountId - Social account ID
 * @param {string} userId - User ID (for ownership verification)
 * @returns {Promise<Object|null>} Social account or null if not found
 * @throws {Error} If database operation fails
 */
exports.getAccountById = async (accountId, userId) => {
  try {
    return await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });
  } catch (error) {
    logger.error(`Error fetching account: ${error.message}`);
    throw new Error(`Failed to fetch social account: ${error.message}`);
  }
};

/**
 * Update social account activity status
 * @param {string} accountId - Social account ID
 * @param {string} userId - User ID (for ownership verification)
 * @param {boolean} isActive - New activity status
 * @returns {Promise<Object>} Updated social account
 * @throws {Error} If account not found or database operation fails
 */
exports.updateAccountStatus = async (accountId, userId, isActive) => {
  try {
    const account = await SocialAccount.findOne({
      _id: accountId,
      user: userId
    });
    
    if (!account) {
      throw new Error('Account not found');
    }
    
    account.isActive = isActive;
    await account.save();
    return account;
  } catch (error) {
    logger.error(`Error updating account status: ${error.message}`);
    throw new Error(`Failed to update account status: ${error.message}`);
  }
};

/**
 * Get accounts by platform type
 * @param {string} userId - User ID
 * @param {string} platform - Platform type (e.g., 'facebook', 'instagram')
 * @returns {Promise<Array>} List of platform-specific social accounts
 * @throws {Error} If database operation fails
 */
exports.getAccountsByPlatform = async (userId, platform) => {
  try {
    return await SocialAccount.find({
      user: userId,
      platform,
      isActive: true
    }).sort({ accountName: 1 });
  } catch (error) {
    logger.error(`Error fetching accounts by platform: ${error.message}`);
    throw new Error(`Failed to fetch ${platform} accounts: ${error.message}`);
  }
};

/**
 * Delete social account permanently
 * @param {string} accountId - Social account ID
 * @param {string} userId - User ID (for ownership verification)
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} If account not found or database operation fails
 */
exports.deleteAccount = async (accountId, userId) => {
  try {
    const result = await SocialAccount.deleteOne({
      _id: accountId,
      user: userId
    });
    
    if (result.deletedCount === 0) {
      throw new Error('Account not found or already deleted');
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting account: ${error.message}`);
    throw new Error(`Failed to delete account: ${error.message}`);
  }
};

/**
 * Count user's connected accounts by platform
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Count of accounts by platform
 * @throws {Error} If database operation fails
 */
exports.countAccountsByPlatform = async (userId) => {
  try {
    const counts = await SocialAccount.aggregate([
      { $match: { user: userId, isActive: true } },
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);
    
    // Convert to object format { facebook: 2, instagram: 1, ... }
    return counts.reduce((result, item) => {
      result[item._id] = item.count;
      return result;
    }, {});
  } catch (error) {
    logger.error(`Error counting accounts: ${error.message}`);
    throw new Error(`Failed to count social accounts: ${error.message}`);
  }
};
