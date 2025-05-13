/**
 * Authentication controller
 * @module controllers/auth
 */
const User = require('../models/user.model');
const authService = require('../services/auth.service');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/email.service');
const logger = require('../utils/logger.utils');
const { generateAccessToken, generateRefreshToken } = require('../utils/token.utils');
const env = require('../config/environment');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Auto-verify in development if BYPASS_EMAIL_VERIFICATION is true
    const shouldBypassVerification = env.NODE_ENV === 'development' && env.BYPASS_EMAIL_VERIFICATION === 'true';
    
    try {
      // Delegate to service layer
      const { user, verificationToken } = await authService.registerUser({
        email,
        password,
        firstName,
        lastName,
        isVerified: shouldBypassVerification
      });

      // Send verification email (unless bypassed)
      if (!shouldBypassVerification) {
        try {
          const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
          await sendVerificationEmail(user, verificationUrl);
        } catch (emailError) {
          logger.error('Error sending verification email:', emailError);
          // Continue with registration even if email fails
        }
      }

      // Response based on verification status
      const message = shouldBypassVerification ? 
        'Registration successful. You can log in immediately.' : 
        'Registration successful. Please check your email to verify your account.';

      return res.status(201).json({
        success: true,
        message: message,
        // Include some user info in response for development convenience
        dev: env.NODE_ENV === 'development' ? {
          email: user.email,
          isVerified: user.isVerified
        } : undefined
      });
    } catch (error) {
      if (error.message === 'User with this email already exists') {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists' 
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * Verify user email
 * @route POST /api/auth/verify-email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Delegate to service layer
    const user = await authService.verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    if (error.message === 'Invalid or expired verification token') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    try {
      // Delegate to service layer
      const { user, accessToken, refreshToken } = await authService.authenticateUser(email, password);

      return res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      } else if (error.message === 'Email not verified') {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    try {
      // Delegate to service layer
      const tokens = await authService.refreshAccessToken(refreshToken);

      return res.status(200).json({
        success: true,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      });
    } catch (error) {
      if (error.message === 'Invalid or expired refresh token') {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
};

/**
 * Request password reset
 * @route POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Delegate to service layer
    const result = await authService.requestPasswordReset(email);
    
    // If user found and reset token generated
    if (result && result.user && result.resetToken) {
      // Send password reset email
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${result.resetToken}`;
      await sendPasswordResetEmail(result.user, resetUrl);
    }

    // For security reasons, always return the same response
    return res.status(200).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    try {
      // Delegate to service layer
      await authService.resetPassword(token, password);

      return res.status(200).json({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.'
      });
    } catch (error) {
      if (error.message === 'Invalid or expired reset token') {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user._id;

    // Delegate to service layer
    await authService.logoutUser(userId, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        authType: user.authType
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    });
  }
};

/**
 * Handle OAuth callbacks (Google, Facebook)
 * @route GET /api/auth/google/callback, /api/auth/facebook/callback
 */
exports.handleOAuthCallback = async (req, res) => {
  try {
    // Generate tokens after successful authentication
    const accessToken = generateAccessToken(req.user._id);
    const refreshToken = generateRefreshToken();
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Save refresh token to user
    req.user.refreshTokens.push({
      token: refreshToken,
      expiresAt: refreshExpires
    });
    req.user.lastLogin = Date.now();
    
    await req.user.save();
    
    // Redirect to frontend with tokens
    return res.redirect(`${env.FRONTEND_URL}/oauth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  } catch (error) {
    logger.error('OAuth callback error:', error);
    return res.redirect(`${env.FRONTEND_URL}/login?error=true`);
  }
};
