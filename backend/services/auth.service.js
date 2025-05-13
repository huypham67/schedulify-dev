/**
 * Authentication service
 * @module services/auth
 */
const User = require('../models/user.model');
const { generateAccessToken, generateRefreshToken, generateEmailVerificationToken, generatePasswordResetToken } = require('../utils/token.utils');
const { encrypt, decrypt } = require('../utils/encryption.utils');
const logger = require('../utils/logger.utils');

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.firstName - User first name
 * @param {string} userData.lastName - User last name
 * @param {boolean} [userData.isVerified=false] - Whether user is verified immediately
 * @returns {Promise<Object>} Object containing user and verification token
 * @throws {Error} If user with email already exists or database operation fails
 */
exports.registerUser = async (userData) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate verification token
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user
    const user = new User({
      ...userData,
      authType: 'local',
      verificationToken,
      verificationExpires
    });

    await user.save();
    return { user, verificationToken };
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    throw error;
  }
};

/**
 * Authenticate user (local strategy)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Object containing user, access token, and refresh token
 * @throws {Error} If credentials are invalid, email not verified, or database operation fails
 */
exports.authenticateUser = async (email, password) => {
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user || user.authType !== 'local') {
      throw new Error('Invalid credentials');
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new Error('Email not verified');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save refresh token to user
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshExpires
    });
    user.lastLogin = Date.now();
    await user.save();

    return {
      user,
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error(`Error authenticating user: ${error.message}`);
    throw error;
  }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Current refresh token
 * @returns {Promise<Object>} Object containing new access token and refresh token
 * @throws {Error} If refresh token is invalid or database operation fails
 */
exports.refreshAccessToken = async (refreshToken) => {
  try {
    // Find user with matching refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired refresh token');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken();
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Remove old refresh token and add new one (token rotation)
    user.refreshTokens = user.refreshTokens.filter(
      token => token.token !== refreshToken
    );
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: refreshExpires
    });
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    logger.error(`Error refreshing token: ${error.message}`);
    throw error;
  }
};

/**
 * Verify user email
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} Verified user object
 * @throws {Error} If token is invalid or database operation fails
 */
exports.verifyEmail = async (token) => {
  try {
    // Find user with matching token
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return user;
  } catch (error) {
    logger.error(`Error verifying email: ${error.message}`);
    throw error;
  }
};

/**
 * Request password reset
 * @param {string} email - User email
 * @returns {Promise<Object|null>} Object containing user and reset token, or null if user not found
 * @throws {Error} If database operation fails
 */
exports.requestPasswordReset = async (email) => {
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // For security reasons, don't reveal user existence
      return null;
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Update user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    return { user, resetToken };
  } catch (error) {
    logger.error(`Error requesting password reset: ${error.message}`);
    throw error;
  }
};

/**
 * Reset user password
 * @param {string} token - Password reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If token is invalid or database operation fails
 */
exports.resetPassword = async (token, newPassword) => {
  try {
    // Find user with matching reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update user
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    // Clear all refresh tokens for security
    user.refreshTokens = [];
    await user.save();

    return user;
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
    throw error;
  }
};

/**
 * Logout user by removing refresh token
 * @param {string} userId - User ID
 * @param {string} refreshToken - Refresh token to invalidate
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If database operation fails
 */
exports.logoutUser = async (userId, refreshToken) => {
  try {
    // Remove refresh token from user
    const result = await User.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
    
    if (!result) {
      logger.warn(`Logout attempted for non-existent user: ${userId}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error logging out user: ${error.message}`);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Updated profile data
 * @param {string} profileData.firstName - User first name
 * @param {string} profileData.lastName - User last name
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If database operation fails
 */
exports.updateUserProfile = async (userId, profileData) => {
  try {
    // Find and update user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update fields
    if (profileData.firstName) user.firstName = profileData.firstName;
    if (profileData.lastName) user.lastName = profileData.lastName;
    
    await user.save();
    
    return user;
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    throw error;
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} True if successful
 * @throws {Error} If passwords don't match or database operation fails
 */
exports.changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }
    
    // Check if new password is different from current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      throw new Error('New password must be different from current password');
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();
    
    return true;
  } catch (error) {
    logger.error(`Error changing user password: ${error.message}`);
    throw error;
  }
};
