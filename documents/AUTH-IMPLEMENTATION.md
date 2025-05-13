# Authentication System

This document provides a detailed overview of the JWT-based authentication system implemented in Schedulify.

## Features

- Local authentication (email/password)
- OAuth2 integration (Google, Facebook)
- Email verification
- Password reset
- JWT token management (access/refresh tokens)

## Database Model

The User model (`models/user.model.js`) includes:

```js
{
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      return !this.oauth; // Password only required for local auth
    }
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  oauth: {
    provider: {
      type: String,
      enum: ['google', 'facebook']
    },
    id: String
  },
  lastLogin: Date,
  refreshTokens: [{
    token: String,
    expires: Date,
    userAgent: String,
    ip: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/verify-email | Verify user's email address |
| POST | /api/auth/login | Authenticate user and receive tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with token |
| POST | /api/auth/logout | Invalidate refresh token |
| GET | /api/auth/me | Get current user information |
| GET | /api/auth/google | Initiate Google OAuth flow |
| GET | /api/auth/google/callback | Google OAuth callback |
| GET | /api/auth/facebook | Initiate Facebook OAuth flow |
| GET | /api/auth/facebook/callback | Facebook OAuth callback |

## Token Management

- **Access Token**: Short-lived JWT (30 minutes) containing user ID and roles
- **Refresh Token**: Long-lived token (7 days) stored in the database and used to issue new access tokens
- Token rotation: Each time a refresh token is used, a new one is issued and the old one is invalidated

## Implementation Details

### Authentication Flow

#### Local Authentication
1. User registers with email, password, and profile details
2. A verification email is sent to the user's email address
3. After verifying their email, the user can log in
4. On login, the system issues an access token and refresh token
5. The access token is used to authorize all protected API requests
6. When the access token expires, the refresh token can be used to obtain a new access token

#### OAuth Flow
1. User initiates OAuth (Google/Facebook) by visiting `/api/auth/google` or `/api/auth/facebook`
2. User is redirected to the provider's authentication page
3. After successful authentication, the provider redirects back to our callback URL
4. The system creates or updates the user record based on OAuth profile data
5. The user is authenticated and receives tokens similar to local authentication

### Security Measures

- Password hashing using bcrypt with appropriate salt rounds
- CSRF protection on authentication endpoints
- Rate limiting to prevent brute force attacks
- Refresh token rotation to mitigate token theft
- HTTPOnly cookies option for production environments
- Secure validation of JWT tokens and proper expiration settings
- Email verification to prevent account spoofing

## Code Structure

- `controllers/auth.controller.js` - Handles HTTP requests for authentication
- `services/auth.service.js` - Contains authentication business logic
- `middleware/auth.middleware.js` - JWT verification middleware
- `utils/token.utils.js` - JWT generation and validation functions
- `config/passport.js` - OAuth strategy configuration

## Example: JWT Verification Middleware

```js
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub };
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};
```
