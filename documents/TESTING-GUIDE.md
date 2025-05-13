# API Testing Guide

This document provides instructions for testing the Schedulify API endpoints.

## Setup

1. **Start the Application**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Create Test User**:
   ```bash
   node scripts/create-test-user.js
   ```
   This creates a user with the following credentials:
   - Email: test@example.com
   - Password: Password123

## Authentication Testing

### Getting an Access Token

1. Login using the test account:
   ```http
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json

   {
     "email": "test@example.com",
     "password": "Password123"
   }
   ```

2. Save the `accessToken` from the response for use in subsequent requests.
3. All authenticated endpoints require the Authorization header:
   ```
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

### Testing Auth Endpoints

#### Register a New User
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "firstName": "New",
  "lastName": "User"
}
```

#### Verify Email
```http
POST http://localhost:5000/api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

#### Request Password Reset
```http
POST http://localhost:5000/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### Reset Password
```http
POST http://localhost:5000/api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "NewPassword123"
}
```

#### Get Current User
```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Social Media Integration Testing

### Getting Connected Accounts

```http
GET http://localhost:5000/api/social/accounts
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Connecting to Facebook

1. Initiate Facebook OAuth flow:
   ```http
   GET http://localhost:5000/api/social/connect/facebook
   Authorization: Bearer YOUR_ACCESS_TOKEN
   ```

2. You will be redirected to Facebook for authentication
3. After approval, you'll be redirected back to the application

### Disconnecting an Account

```http
DELETE http://localhost:5000/api/social/accounts/ACCOUNT_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Post Management Testing

### Creating a Post

```http
POST http://localhost:5000/api/posts
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "This is a test post",
  "link": "https://example.com",
  "scheduledAt": "2023-07-15T10:00:00.000Z",
  "platforms": ["SOCIAL_ACCOUNT_ID"]
}
```

### Getting User Posts

```http
GET http://localhost:5000/api/posts
Authorization: Bearer YOUR_ACCESS_TOKEN
```

With filtering:
```http
GET http://localhost:5000/api/posts?status=scheduled&page=1&limit=10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Getting a Specific Post

```http
GET http://localhost:5000/api/posts/POST_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Updating a Post

```http
PUT http://localhost:5000/api/posts/POST_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "content": "Updated post content",
  "link": "https://example.com/updated",
  "scheduledAt": "2023-07-16T10:00:00.000Z"
}
```

### Scheduling a Post

```http
POST http://localhost:5000/api/posts/POST_ID/schedule
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "scheduledAt": "2023-07-16T15:30:00.000Z"
}
```

### Publishing a Post Immediately

```http
POST http://localhost:5000/api/posts/POST_ID/publish
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Deleting a Post

```http
DELETE http://localhost:5000/api/posts/POST_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Media Upload Testing

### Uploading Media Files

```http
POST http://localhost:5000/api/media/upload
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: multipart/form-data

// Include files using form-data
```

### Deleting Media

```http
DELETE http://localhost:5000/api/media/MEDIA_ID
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Testing with Postman

1. Import the Postman collection from `backend/scripts/schedulify-api.postman_collection.json`
2. Set up an environment with variable `baseUrl` set to `http://localhost:5000`
3. Create a variable `accessToken` and update it after login
4. Use the collection to test all endpoints

## Automated Testing

Run the automated test suite with:

```bash
cd backend
npm test
```

This will run all unit and integration tests for the API endpoints. 