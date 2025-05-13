# API Reference

This document provides a comprehensive list of all API endpoints available in the Schedulify platform, with examples.

## Base URL

All endpoints are relative to the base URL: `http://localhost:5000` (development) or your production domain.

## Authentication

All protected endpoints require JWT authentication via the Authorization header:

```
Authorization: Bearer <access_token>
```

## Authentication Endpoints

### User Registration and Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login with credentials | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

#### Examples

**Register a new user:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6...",
  "user": {
    "_id": "60d5e4c82c4f7d2b9c5e8d7a",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Get current user:**
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Update user profile:**
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "60d5e4c82c4f7d2b9c5e8d7a",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith"
  }
}
```

### Account Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/change-password` | Change user password | Yes |

### OAuth Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/auth/google` | Initiate Google OAuth | No |
| GET | `/api/auth/google/callback` | Google OAuth callback | No |
| GET | `/api/auth/facebook` | Initiate Facebook OAuth | No |
| GET | `/api/auth/facebook/callback` | Facebook OAuth callback | No |

## Social Media Integration Endpoints

### Account Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/social/accounts` | Get connected accounts | Yes |
| DELETE | `/api/social/accounts/:accountId` | Disconnect account | Yes |

### Platform Connection

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/social/connect/facebook` | Connect Facebook | Yes |
| GET | `/api/social/facebook/callback` | Facebook OAuth callback | No |
| POST | `/api/social/connect/facebook/callback/complete` | Complete Facebook connection | Yes |

#### Examples

**Get connected social accounts:**
```http
GET /api/social/accounts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5e4c82c4f7d2b9c5e8d7a",
      "platform": "facebook",
      "platformUserId": "1234567890",
      "accountName": "My Facebook Page",
      "accountType": "page",
      "isActive": true
    }
  ]
}
```

## Post Management Endpoints

### Post CRUD Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| GET | `/api/posts` | Get user posts with filters | Yes |
| GET | `/api/posts/:id` | Get post details | Yes |
| POST | `/api/posts` | Create a new post | Yes |
| PUT | `/api/posts/:id` | Update a post | Yes |
| DELETE | `/api/posts/:id` | Delete a post | Yes |

### Post Actions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/posts/:id/schedule` | Schedule a post | Yes |
| POST | `/api/posts/:id/publish` | Publish post immediately | Yes |

### Media Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/media/upload` | Upload media files | Yes |
| DELETE | `/api/media/:id` | Delete a media file | Yes |
| GET | `/api/posts/:postId/media` | Get media for a post | Yes |

#### Examples

**Create a new post:**
```http
POST /api/posts
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "content": "Check out our new product launch!",
  "link": "https://example.com/products",
  "platforms": [
    {
      "socialAccount": "60d5e4c82c4f7d2b9c5e8d7a"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5e4c82c4f7d2b9c5e8d7b",
    "content": "Check out our new product launch!",
    "link": "https://example.com/products",
    "status": "draft",
    "platforms": [
      {
        "socialAccount": "60d5e4c82c4f7d2b9c5e8d7a",
        "status": "pending"
      }
    ],
    "user": "60d5e4c82c4f7d2b9c5e8d7c"
  }
}
```

**Schedule a post:**
```http
POST /api/posts/60d5e4c82c4f7d2b9c5e8d7b/schedule
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "scheduledAt": "2023-12-31T12:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "60d5e4c82c4f7d2b9c5e8d7b",
    "status": "scheduled",
    "scheduledAt": "2023-12-31T12:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Pagination

Endpoints that return lists support pagination with the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```http
GET /api/posts?page=2&limit=20
```

Paginated responses include a pagination object:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 2,
    "limit": 20,
    "pages": 3
  }
}
``` 