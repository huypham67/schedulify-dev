# Schedulify API Testing Guide with Postman

This document provides a comprehensive guide for testing the Schedulify API using Postman. It follows a complete user flow that validates core business requirements from authentication to publishing social media content.

## Prerequisites

1. [Postman](https://www.postman.com/downloads/) installed on your system
2. Schedulify backend server running (`npm run dev` in the backend directory)
3. MongoDB running locally or connection to a remote MongoDB instance
4. Facebook Developer account (for social media integration tests)

## Setup Postman Environment

1. Create a new environment in Postman named "Schedulify"
2. Add the following variables:
   - `base_url`: `http://localhost:5000` (or your server URL)
   - `access_token`: (leave empty, will be populated during testing)
   - `refresh_token`: (leave empty, will be populated during testing)
   - `userId`: (leave empty, will be populated during testing)
   - `postId`: (leave empty, will be populated during testing)
   - `socialAccountId`: (leave empty, will be populated during testing)
   - `mediaId`: (leave empty, will be populated during testing)

## Comprehensive Testing Flow

### Flow 1: User Authentication & Management

#### Step 1: Register a New User

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/auth/register`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "Password123!",
       "firstName": "Test",
       "lastName": "User"
     }
     ```
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "message": "User registered successfully"
   }
   ```

#### Step 2: Verify Email (Optional)

In a production environment, you would need to click the verification link sent to your email. For testing, you can either:
- Manually mark the user as verified in the database, or
- Create a route that accepts a verification token directly

#### Step 3: Login with User Credentials

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "test@example.com",
       "password": "Password123!"
     }
     ```
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "accessToken": "eyJhbGciOiJIUzI1...",
     "refreshToken": "eyJhbGciOiJIUzI1...",
     "user": {
       "_id": "...",
       "email": "test@example.com",
       "firstName": "Test",
       "lastName": "User"
     }
   }
   ```
4. Save the tokens and user ID as environment variables:
   - Right-click → Set to environment variable:
     - `accessToken` → `access_token`
     - `refreshToken` → `refresh_token`
     - `user._id` → `userId`

#### Step 4: Get Current User Profile

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/me`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "user": {
       "_id": "...",
       "email": "test@example.com",
       "firstName": "Test",
       "lastName": "User",
       "createdAt": "..."
     }
   }
   ```

#### Step 5: Test Token Refresh (Optional)

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/auth/refresh`
   - Body (JSON):
     ```json
     {
       "refreshToken": "{{refresh_token}}"
     }
     ```
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "accessToken": "eyJhbGciOiJIUzI1...",
     "refreshToken": "eyJhbGciOiJIUzI1..."
   }
   ```
4. Update the tokens in environment variables

### Flow 2: Social Media Integration

#### Step 6: Connect to Facebook (Manual Process)

> **Note**: This step requires browser interaction as Postman cannot handle the OAuth UI flow.

1. Open a browser and visit: `{{base_url}}/api/social/connect/facebook`
   - You need to be logged in to your application first
   - You will be redirected to Facebook for authorization
   - After authorizing, Facebook will redirect back to your application
   - Your backend should complete the connection process

2. After connecting, note the `socialAccountId` from the response or UI

#### Step 7: Get Connected Social Accounts

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/social/accounts`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "data": [
       {
         "_id": "...",
         "platform": "facebook",
         "platformUserId": "...",
         "accountName": "Your Facebook Page",
         "accountType": "page",
         "isActive": true
       }
     ]
   }
   ```
4. Save the social account ID:
   - Right-click → Set to environment variable:
     - `data[0]._id` → `socialAccountId`

### Flow 3: Content Management & Publishing

#### Step 8: Upload Media for Post

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/media/upload`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
   - Body (form-data):
     - Key: `file` (file), Value: Select an image file
     - Key: `type`, Value: `image`
     - Key: `altText`, Value: `Test image description`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "data": {
       "_id": "...",
       "url": "http://localhost:5000/uploads/...",
       "type": "image",
       "altText": "Test image description"
     }
   }
   ```
4. Save the media ID:
   - Right-click → Set to environment variable:
     - `data._id` → `mediaId`

#### Step 9: Create a New Post

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/posts`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
   - Body (JSON):
     ```json
     {
       "content": "This is a test post from Postman! #testing",
       "link": "https://example.com",
       "media": ["{{mediaId}}"],
       "platforms": [
         {
           "socialAccount": "{{socialAccountId}}"
         }
       ]
     }
     ```
2. Send the request
3. Expected response (201 Created):
   ```json
   {
     "success": true,
     "data": {
       "_id": "...",
       "content": "This is a test post from Postman! #testing",
       "link": "https://example.com",
       "status": "draft",
       "platforms": [
         {
           "socialAccount": "{{socialAccountId}}",
           "status": "pending"
         }
       ],
       "user": "{{userId}}"
     }
   }
   ```
4. Save the post ID:
   - Right-click → Set to environment variable:
     - `data._id` → `postId`

#### Step 10: Schedule the Post

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/posts/{{postId}}/schedule`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
   - Body (JSON):
     ```json
     {
       "scheduledAt": "2023-12-31T12:00:00.000Z"
     }
     ```
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "data": {
       "_id": "{{postId}}",
       "status": "scheduled",
       "scheduledAt": "2023-12-31T12:00:00.000Z"
     }
   }
   ```

#### Step 11: Get Post Details

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/posts/{{postId}}`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK) should include the post with media and platform information

#### Step 12: Update Post Content (Optional)

1. Create a new request:
   - Method: `PUT`
   - URL: `{{base_url}}/api/posts/{{postId}}`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
   - Body (JSON):
     ```json
     {
       "content": "Updated post content with new text"
     }
     ```
2. Send the request
3. Expected response (200 OK) with updated post details

#### Step 13: Publish Post Immediately (Alternative to Scheduling)

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/posts/{{postId}}/publish`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "data": {
       "_id": "{{postId}}",
       "status": "published",
       "publishedAt": "..."
     }
   }
   ```

### Flow 4: Post Listing and Filtering

#### Step 14: Get All Posts

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/posts`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK) with a list of posts and pagination data

#### Step 15: Filter Posts by Status

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/posts?status=published`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK) with only published posts

### Flow 5: Cleanup (Optional)

#### Step 16: Delete the Post

1. Create a new request:
   - Method: `DELETE`
   - URL: `{{base_url}}/api/posts/{{postId}}`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "message": "Post deleted successfully"
   }
   ```

#### Step 17: Disconnect Social Account

1. Create a new request:
   - Method: `DELETE`
   - URL: `{{base_url}}/api/social/accounts/{{socialAccountId}}`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "message": "Social account disconnected successfully"
   }
   ```

#### Step 18: Logout

1. Create a new request:
   - Method: `POST`
   - URL: `{{base_url}}/api/auth/logout`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
   - Body (JSON):
     ```json
     {
       "refreshToken": "{{refresh_token}}"
     }
     ```
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "message": "Logged out successfully"
   }
   ```

## Business Requirements Coverage

This testing flow validates the following key business requirements:

1. **Account Management**
   - User registration and authentication ✅
   - JWT-based security ✅
   - Profile management ✅

2. **Social Media Integration**
   - Platform connection via OAuth ✅
   - Platform account management ✅
   - Token storage and security ✅

3. **Content Management**
   - Post creation with text and media ✅
   - Draft creation and editing ✅
   - Platform-specific publishing ✅

4. **Publishing System**
   - Scheduled publishing ✅
   - Immediate publishing ✅
   - Status tracking ✅

## Creating a Postman Collection

1. Create a new collection named "Schedulify API Tests"
2. Add all the requests from the steps above to the collection
3. Organize them into folders by flow
4. Save the collection for reuse
5. Export the collection and environment for sharing

## Troubleshooting Common Issues

### Authentication Problems
- Ensure your tokens are valid and not expired
- Check if the token format in Authorization header is correct (`Bearer <token>`)
- Verify the user exists and is verified if required

### Social Integration Issues
- Check that Facebook App settings are correctly configured
- Verify callback URLs match your application configuration
- Ensure proper scopes/permissions are requested

### Media Upload Problems
- Check file size limits (typically 10MB max)
- Verify supported file types (images, videos)
- Ensure the uploads directory exists and is writable

### Post Publishing Issues
- Verify the social account is still connected and tokens valid
- Check for platform-specific content restrictions
- Look for detailed error messages in the post platform status

## Automated Testing (Advanced)

For automated testing with Newman (Postman CLI):

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Schedulify.postman_collection.json -e Schedulify.postman_environment.json
```

## Contact

If you encounter persistent issues, please contact the development team or open an issue on GitHub.

## Testing OAuth Authentication with Postman

Testing OAuth authentication flows (Google/Facebook) with Postman requires a special approach because OAuth involves browser redirects that Postman cannot automatically follow. Here's how to test these flows:

### Prerequisites

1. Ensure your development environment is configured with proper OAuth credentials:
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google OAuth
   - `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` for Facebook OAuth
   - Proper redirect URIs configured in your Google/Facebook developer console

2. Create the following variables in your Postman environment:
   - `base_url`: `http://localhost:5000` (or your server URL)
   - `access_token`: (will be extracted manually)
   - `refresh_token`: (will be extracted manually)

### Testing OAuth Configuration Status

First, check if OAuth is properly configured on your server:

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/oauth-status`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "oauthProviders": {
       "google": true,
       "facebook": true
     }
   }
   ```
4. If either value is `false`, check your server's `.env` file for the required credentials.

### Testing Google OAuth

#### Step 1: Generate OAuth URL

1. Create a new request to check the Google OAuth endpoint:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/google`
   - DO NOT send the request (it would redirect to Google login page)

#### Step 2: Copy the URL to Browser

1. Right-click the URL in Postman and copy it
2. Open a new browser window in incognito/private mode
3. Paste the URL in the browser address bar and navigate to it
4. You should be redirected to Google's authentication page
5. Complete the Google login process

#### Step 3: Extract Tokens from Callback URL

1. After successful Google authentication, you'll be redirected to a URL like:
   ```
   http://localhost:3000/oauth-callback?accessToken=eyJhbGciOiJIUzI1NiIsInR5...&refreshToken=eyJhbGciOiJIUzI1NiIs...
   ```

2. Copy the entire callback URL from your browser
3. Extract the `accessToken` and `refreshToken` query parameters
4. In Postman, set these as your environment variables:
   - Click on the "Environment" dropdown (top right)
   - Select "Edit" on your environment
   - Update the `access_token` variable with the extracted access token
   - Update the `refresh_token` variable with the extracted refresh token
   - Save the environment

#### Step 4: Verify Authentication with the Extracted Token

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/me`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "user": {
       "id": "...",
       "email": "your.google.email@gmail.com",
       "firstName": "YourFirstName",
       "lastName": "YourLastName",
       "profileImage": "https://...",
       "isVerified": true,
       "authType": "google"
     }
   }
   ```

### Testing Facebook OAuth

#### Step 1: Generate OAuth URL

1. Create a new request to check the Facebook OAuth endpoint:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/facebook`
   - DO NOT send the request (it would redirect to Facebook login page)

#### Step 2: Copy the URL to Browser

1. Right-click the URL in Postman and copy it
2. Open a new browser window in incognito/private mode
3. Paste the URL in the browser address bar and navigate to it
4. You should be redirected to Facebook's authentication page
5. Complete the Facebook login process

#### Step 3: Extract Tokens from Callback URL

1. After successful Facebook authentication, you'll be redirected to a URL like:
   ```
   http://localhost:3000/oauth-callback?accessToken=eyJhbGciOiJIUzI1NiIsInR5...&refreshToken=eyJhbGciOiJIUzI1NiIs...
   ```

2. Copy the entire callback URL from your browser
3. Extract the `accessToken` and `refreshToken` query parameters
4. In Postman, set these as your environment variables:
   - Click on the "Environment" dropdown (top right)
   - Select "Edit" on your environment
   - Update the `access_token` variable with the extracted access token
   - Update the `refresh_token` variable with the extracted refresh token
   - Save the environment

#### Step 4: Verify Authentication with the Extracted Token

1. Create a new request:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/me`
   - Headers:
     - `Authorization`: `Bearer {{access_token}}`
2. Send the request
3. Expected response (200 OK):
   ```json
   {
     "success": true,
     "user": {
       "id": "...",
       "email": "your.facebook.email@example.com",
       "firstName": "YourFirstName",
       "lastName": "YourLastName",
       "profileImage": "https://...",
       "isVerified": true,
       "authType": "facebook"
     }
   }
   ```

### Troubleshooting OAuth Testing

- **Invalid Callback Error**: Verify that the redirect URIs in your Google/Facebook developer console match what's configured in your server
- **Authentication Failed**: Check server logs for more detailed error messages
- **Token Extraction Problems**:
  - Ensure you're copying the full callback URL from the browser
  - Check if the server is properly generating tokens in the OAuth callback
  - If the URL doesn't contain tokens, check your server logs for errors in the OAuth callback

### Testing OAuth Error Scenarios

#### Test Case 1: Invalid OAuth Configuration

1. Temporarily remove or modify the Google/Facebook credentials in your `.env` file
2. Make a request to `/api/auth/oauth-status` and verify that the provider status shows `false`
3. Restore your credentials when testing is complete

#### Test Case 2: OAuth Provider Unavailable

1. Create a request to a misspelled or non-existent OAuth endpoint:
   - Method: `GET`
   - URL: `{{base_url}}/api/auth/googlee` (notice the extra 'e')
2. Send the request
3. Expected response: 404 Not Found

## Automated OAuth Testing Considerations

While direct OAuth flows are difficult to automate in Postman, you can:

1. Mock the OAuth callback by creating a direct request to your callback handling endpoint (requires backend modification for testing)
2. Use Postman's test scripts to extract and validate tokens that are manually acquired
3. Set up monitors that test the OAuth configuration status endpoint automatically

If you encounter persistent issues, please contact the development team or open an issue on GitHub. 