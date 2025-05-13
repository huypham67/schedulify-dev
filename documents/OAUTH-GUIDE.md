# OAuth Integration Guide

This guide provides detailed instructions for setting up, configuring, and testing OAuth authentication with Google and Facebook in the Schedulify application.

## Overview

Schedulify supports authentication via:
- Email/password (local authentication)
- Google OAuth
- Facebook OAuth

OAuth authentication provides several benefits:
- Simplified user registration and login
- Reduced password management burden
- Improved security through delegated authentication
- Access to verified user information from providers

## Setup Instructions

### Prerequisites

Before you begin, ensure you have:
- Node.js and npm installed
- MongoDB running locally or a connection to a MongoDB instance
- Backend and frontend projects set up and running

### 1. Creating Provider Applications

#### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set Application Type to "Web application"
6. Add a name for your application (e.g., "Schedulify Development")
7. Add the following Authorized JavaScript origins:
   - `http://localhost:3000` (for frontend development)
8. Add the following Authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
9. Click "Create" to generate your Client ID and Client Secret
10. Save these credentials for later use

#### Facebook OAuth Setup

1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Click "Create App" and select "Consumer" as the app type
3. Enter an App Name (e.g., "Schedulify Development") and contact email
4. Click "Create App" to proceed
5. In the app dashboard, add the "Facebook Login" product
6. Under Facebook Login > Settings:
   - Set Valid OAuth Redirect URIs: `http://localhost:5000/api/auth/facebook/callback`
   - Save changes
7. Go to Settings > Basic to find your App ID and App Secret
8. Save these credentials for later use

### 2. Environment Configuration

1. In the backend project, create or edit your `.env` file
2. Add your OAuth credentials:
   ```
   # OAuth Configurations
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FRONTEND_URL=http://localhost:3000
   ```
3. Save the file

### 3. Verifying Configuration

1. Start the backend server
2. Check the console logs to verify:
   - No errors related to OAuth configuration
   - Messages indicating OAuth is configured correctly
3. If you see: `Google OAuth disabled: Missing client credentials` or similar for Facebook, check your `.env` file and restart the server

## How OAuth Works in Schedulify

### Authentication Flow

1. **User Initiates OAuth**:
   - User clicks "Continue with Google" or "Continue with Facebook" on the login/register page
   - Frontend redirects to backend endpoint (`/api/auth/google` or `/api/auth/facebook`)
   - Backend redirects to the OAuth provider's authentication page

2. **Provider Authentication**:
   - User authenticates with Google or Facebook
   - Provider redirects back to our callback URL with an authorization code

3. **Backend Processing**:
   - Passport.js handles the OAuth callback
   - User information is retrieved from the provider
   - System checks if the user exists:
     - If user exists, their OAuth information is updated
     - If user is new, a new account is created with information from their profile
   - JWT access and refresh tokens are generated
   - Backend redirects to frontend with tokens in the URL

4. **Frontend Processing**:
   - The OAuth callback page extracts tokens from the URL
   - Tokens are stored in local storage
   - User is redirected to the dashboard
   - User is now authenticated

### User Account Management

When a user authenticates via OAuth:

1. Their email address is used as the primary identifier
2. If a user with the same email exists:
   - The account is linked to their OAuth provider
   - The `authType` field is updated to the OAuth provider
   - Their profile information may be updated from the provider
3. If no user with that email exists:
   - A new user account is created
   - Profile information (name, email, profile picture) is populated from the provider
   - The account is automatically verified (no email verification needed)
4. The user can then use both OAuth and their existing credentials (if any) to log in

## Testing OAuth Integration

### Basic Testing

1. **Google Login Test**:
   - Open the application in your browser
   - Click "Continue with Google" on the login page
   - Authenticate with your Google account
   - Verify you are redirected to the dashboard
   - Check your profile information is correctly displayed

2. **Facebook Login Test**:
   - Open the application in your browser
   - Click "Continue with Facebook" on the login page
   - Authenticate with your Facebook account
   - Verify you are redirected to the dashboard
   - Check your profile information is correctly displayed

### Advanced Testing Scenarios

1. **New User Account Creation**:
   - Use an email that hasn't been registered before
   - Authenticate via OAuth
   - Verify a new account is created automatically
   - Check that profile info is correctly imported

2. **Existing Account Linking**:
   - Register a new account using email/password
   - Log out
   - Use OAuth with the same email address
   - Verify the account is linked and you have access to your data

3. **Multiple OAuth Providers**:
   - Create an account using Google OAuth
   - Log out
   - Try to log in with Facebook using the same email
   - Verify that the system handles this correctly

4. **Error Handling**:
   - Cancel the OAuth process at the provider's page
   - Verify you are redirected back with an appropriate error message
   - Check that the application handles failed authentication properly

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**:
   - **Symptom**: Error stating that redirect URI doesn't match
   - **Solution**: Double-check the exact callback URL in your provider settings

2. **Missing Profile Information**:
   - **Symptom**: User profile is incomplete after OAuth login
   - **Solution**: Verify that you're requesting the correct scopes from the provider

3. **CORS Errors**:
   - **Symptom**: Browser console shows CORS-related errors
   - **Solution**: Ensure the frontend proxy is configured correctly in `package.json`

4. **Authentication Fails Silently**:
   - **Symptom**: Redirected back to login page without error messages
   - **Solution**: Check backend logs for detailed error information

### Provider-Specific Issues

1. **Google**:
   - Ensure Google+ API is enabled in your Google Cloud Console
   - Verify that the consent screen is properly configured
   - Check that the `profile` and `email` scopes are requested

2. **Facebook**:
   - Ensure your Facebook app is properly configured with the Login product
   - Verify the `email` permission is requested
   - If testing with a Facebook account other than the developer account, you may need to submit your app for review or add test users

## Production Considerations

Before deploying to production:

1. **Update Redirect URIs**:
   - Add your production domain to the authorized redirect URIs in Google and Facebook developer consoles
   - Update your `.env` file with the production frontend URL

2. **Security Enhancements**:
   - Implement HTTPS for all communications
   - Consider adding rate limiting to prevent abuse
   - Use secure storage for OAuth secrets
   - Enable CSRF protection

3. **Privacy Policy**:
   - Ensure your privacy policy explains how user data from OAuth providers is used
   - Make the privacy policy accessible during registration

## Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Passport.js Documentation](http://www.passportjs.org/) 