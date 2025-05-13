# Schedulify Project Structure

## Backend Structure (Node.js/Express)

```
schedulify/
├── backend/
│   ├── config/
│   │   ├── database.js       # MongoDB database configuration
│   │   ├── passport.js       # OAuth authentication strategies
│   │   └── environment.js    # Environment variables management
│   │
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication & user management
│   │   ├── social.controller.js      # Social media platform connections
│   │   ├── post.controller.js        # Post creation & management
│   │   └── media.controller.js       # Media file handling
│   │
│   ├── models/
│   │   ├── user.model.js             # User authentication & profile
│   │   ├── socialAccount.model.js    # Connected platform credentials
│   │   ├── post.model.js             # Post content & scheduling
│   │   └── media.model.js            # Image & video attachments
│   │
│   ├── routes/
│   │   ├── auth.routes.js            # Authentication endpoints
│   │   ├── social.routes.js          # Social account endpoints
│   │   ├── post.routes.js            # Post management endpoints
│   │   └── media.routes.js           # Media upload endpoints
│   │
│   ├── services/
│   │   ├── auth.service.js           # Authentication business logic
│   │   ├── email.service.js          # Email notifications
│   │   ├── social/
│   │   │   ├── facebook.service.js   # Facebook Graph API integration
│   │   │   └── common.service.js     # Shared social platform utilities
│   │   │
│   │   └── scheduler.service.js      # Scheduled publishing system
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT validation & user authentication
│   │   ├── error.middleware.js       # Global error handling
│   │   └── validation.middleware.js  # Request payload validation
│   │
│   ├── utils/
│   │   ├── token.utils.js            # JWT generation & validation
│   │   ├── encryption.utils.js       # Secure data encryption
│   │   └── logger.utils.js           # Application logging
│   │
│   ├── app.js                        # Express application setup
│   ├── server.js                     # Server entry point
│   └── package.json                  # Dependencies & scripts
│
└── frontend/
    # Frontend structure (separate repository)
```

## Database Schema (MongoDB)

### User Collection
```js
{
  _id: ObjectId,
  email: String,          // Unique, required
  password: String,       // Hashed, required for local auth
  firstName: String,
  lastName: String,
  isVerified: Boolean,    // Email verification status
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  oauth: {                // For OAuth-based authentication
    provider: String,     // 'facebook', 'google'
    id: String           // Provider's user ID
  },
  lastLogin: Date,
  refreshTokens: [{       // Active refresh tokens
    token: String,
    expires: Date,
    userAgent: String,
    ip: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### SocialAccount Collection
```js
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  platform: String,       // 'facebook', 'instagram'
  platformId: String,     // Platform's internal ID
  platformUserId: String, // User ID on the platform
  accessToken: String,    // Platform OAuth token (encrypted)
  refreshToken: String,   // For token refresh (if applicable)
  tokenExpiry: Date,
  accountName: String,    // Display name of account
  accountType: String,    // 'page', 'profile', etc.
  profileUrl: String,
  profileImage: String,
  isActive: Boolean,      // Connection status
  meta: Object,           // Platform-specific details
  createdAt: Date,
  updatedAt: Date
}
```

### Post Collection
```js
{
  _id: ObjectId,
  user: ObjectId,         // Reference to User
  content: String,        // Post text content
  link: String,           // Optional URL to include
  scheduledAt: Date,      // When post should publish
  publishedAt: Date,      // When post was actually published
  status: String,         // 'draft', 'scheduled', 'published', 'failed'
  platforms: [            // Target platforms
    {
      socialAccount: ObjectId,  // Reference to SocialAccount
      platformPostId: String,   // ID of post on platform (after publishing)
      status: String,           // 'pending', 'published', 'failed'
      publishedAt: Date,
      errorMessage: String      // Error details if failed
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Media Collection
```js
{
  _id: ObjectId,
  post: ObjectId,         // Reference to Post
  type: String,           // 'image', 'video'
  url: String,            // Path to stored file
  altText: String,        // Accessibility description
  orderIndex: Number,     // For ordering multiple media
  createdAt: Date
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/facebook` - Initiate Facebook OAuth

### Social Media Accounts
- `GET /api/social/accounts` - List connected accounts
- `GET /api/social/connect/facebook` - Connect Facebook account
- `GET /api/social/facebook/callback` - Facebook OAuth callback
- `POST /api/social/connect/facebook/callback/complete` - Complete Facebook connection
- `DELETE /api/social/accounts/:accountId` - Disconnect account

### Posts
- `GET /api/posts` - List user's posts with filtering/pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/schedule` - Schedule post for publishing
- `POST /api/posts/:id/publish` - Publish post immediately

### Media
- `POST /api/media/upload` - Upload media file
- `DELETE /api/media/:id` - Delete media file
- `GET /api/posts/:postId/media` - Get media for a post

## Implementation Alignment with Business Requirements

### Account Management
- Self-service registration with email verification ✅
- OAuth integration for streamlined signup ✅
- JWT-based authentication for secure access ✅

### Social Media Integration
- Facebook Graph API integration for pages ✅
- Secure OAuth connection with token management ✅
- Platform account selection and management ✅

### Content Management
- Post creation with text, link and media support ✅
- Multi-platform scheduling capabilities ✅
- Draft saving and content editing ✅

### Publishing System
- Automated publishing via scheduler service ✅
- Immediate publishing option ✅
- Publication status tracking ✅
- Error handling for failed publications ✅

This architecture fully supports the MVP requirements while providing a foundation for future expansion to include additional platforms and advanced features. 