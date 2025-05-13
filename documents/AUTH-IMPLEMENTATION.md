# Authentication System

This document provides an overview of the JWT-based authentication system implemented in Schedulify.

## Features

- Local authentication (email/password)
- OAuth2 integration (Google, Facebook)
- Email verification
- Password reset
- JWT token management (access/refresh tokens)

## Database Model

The User model includes:
- Basic user information (name, email)
- Password (hashed with bcrypt)
- Email verification status
- OAuth provider information
- Refresh token management

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

- **Access Token**: Short-lived JWT (15-30 minutes) for API access
- **Refresh Token**: Long-lived token (7 days) stored in database to issue new access tokens
- Token rotation on each refresh for enhanced security

## Implementation Details

### Authentication Flow

1. User registers and receives verification email
2. After verifying email, user can log in
3. Login provides access token (for API calls) and refresh token
4. When access token expires, refresh token is used to get a new one
5. Logout invalidates the refresh token

### OAuth Flow

1. User initiates OAuth (Google/Facebook)
2. User is redirected to provider for authentication
3. Provider redirects back to our callback URL
4. System creates/updates user and issues tokens
5. User is redirected to frontend with tokens

### Security Measures

- Password hashing with bcrypt
- CSRF protection
- Rate limiting on auth endpoints
- Secure HTTP-only cookies option for production
- JWT token validation and expiration
- Email verification prevents fake accounts

## Code Structure

- **Controllers**: `auth.controller.js` - handles HTTP requests
- **Services**: `auth.service.js` - contains business logic
- **Routes**: `auth.routes.js` - defines API endpoints
- **Middleware**: `auth.middleware.js` - JWT verification
- **Utils**: `token.utils.js` - JWT functions
