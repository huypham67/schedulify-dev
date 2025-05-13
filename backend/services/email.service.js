const nodemailer = require('nodemailer');
const env = require('../config/environment');

/**
 * Send an email with the provided options
 * In development mode, it can log the email instead of sending it
 */
const sendEmail = async (options) => {
  // Check if we should bypass actual email sending
  if (env.NODE_ENV === 'development' && env.BYPASS_EMAIL_SENDING === 'true') {
    console.log('========== DEVELOPMENT MODE: EMAIL NOT SENT ==========');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('Content:', options.html);
    console.log('=====================================================');
    return;
  }

  // Check if email credentials are properly set
  if (!env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    console.warn('Email credentials missing. Cannot send email.');
    
    if (env.NODE_ENV === 'development') {
      console.log('========== DEVELOPMENT MODE: EMAIL CREDENTIALS MISSING ==========');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Content:', options.html);
      console.log('==============================================================');
      return; // Don't try to send in development mode
    } else {
      // In production, we should throw an error
      throw new Error('Email service credentials are missing');
    }
  }

  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: env.EMAIL_SERVICE,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD
      }
    });

    // Define email options
    const mailOptions = {
      from: env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Don't throw in development mode
    if (env.NODE_ENV !== 'development') {
      throw error;
    }
  }
};

/**
 * Send a verification email to a user
 */
exports.sendVerificationEmail = async (user, verificationUrl) => {
  const message = `
    <h1>Email Verification</h1>
    <p>Please verify your email by clicking on the link below:</p>
    <a href="${verificationUrl}" target="_blank">Verify Email</a>
    <p>If you did not create an account, please ignore this email.</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Schedulify - Email Verification',
    html: message
  });
};

/**
 * Send a password reset email to a user
 */
exports.sendPasswordResetEmail = async (user, resetUrl) => {
  const message = `
    <h1>Password Reset Request</h1>
    <p>Please reset your password by clicking on the link below:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Schedulify - Password Reset',
    html: message
  });
};
