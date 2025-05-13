# Schedulify Project Structure

## Backend Structure (Node.js/Express)

```
schedulify/
├── backend/
│   ├── config/
│   │   ├── database.js       # Database configuration
│   │   ├── passport.js       # Authentication strategies
│   │   └── environment.js    # Environment variables
│   │
│   ├── controllers/
│   │   ├── auth.controller.js        # Authentication logic
│   │   ├── user.controller.js        # User management
│   │   ├── social.controller.js      # Social media connections
│   │   └── post.controller.js        # Post management
│   │
│   ├── models/
│   │   ├── user.model.js             # User schema
│   │   ├── socialAccount.model.js    # Connected platforms
│   │   ├── post.model.js             # Post content and metadata
│   │   ├── media.model.js            # Media attachments
│   │   └── schedule.model.js         # Scheduling information
│   │
│   ├── routes/
│   │   ├── auth.routes.js            # Authentication endpoints
│   │   ├── user.routes.js            # User management endpoints
│   │   ├── social.routes.js          # Social account endpoints
│   │   └── post.routes.js            # Post management endpoints
│   │
│   ├── services/
│   │   ├── auth.service.js           # Auth business logic
│   │   ├── email.service.js          # Email notifications
│   │   ├── social/
│   │   │   ├── facebook.service.js   # Facebook API integration
│   │   │   ├── instagram.service.js  # Instagram API integration
│   │   │   └── common.service.js     # Shared social media logic
│   │   │
│   │   └── scheduler.service.js      # Post scheduling logic
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js        # JWT verification
│   │   ├── error.middleware.js       # Error handling
│   │   └── validation.middleware.js  # Request validation
│   │
│   ├── utils/
│   │   ├── token.utils.js            # JWT generation/validation
│   │   ├── encryption.utils.js       # Sensitive data encryption
│   │   └── logger.utils.js           # Application logging
│   │
│   ├── app.js                        # Express application setup
│   ├── server.js                     # Server entry point
│   └── package.json                  # Dependencies
│
└── frontend/
    # Frontend structure to be determined based on chosen framework
```

## Database Schema (PostgreSQL)

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP
);
```

### SocialAccounts Table
```sql
CREATE TABLE social_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255) NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  account_name VARCHAR(255),
  account_type VARCHAR(50),
  profile_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);
```

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  link VARCHAR(2048),
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### PostPlatforms Table
```sql
CREATE TABLE post_platforms (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  social_account_id INTEGER REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform_post_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Media Table
```sql
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  alt_text VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Social Accounts
- `GET /api/social/accounts` - List connected accounts
- `POST /api/social/connect/:platform` - Connect platform
- `DELETE /api/social/disconnect/:id` - Disconnect platform
- `GET /api/social/authorize/:platform` - OAuth redirect

### Posts
- `GET /api/posts` - List user's posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post details
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/schedule` - Schedule post
- `POST /api/posts/:id/publish` - Publish post immediately

## Implementation Priority

1. Authentication System
   - User registration/login
   - JWT token management
   - Password reset flow

2. Social Media Connection
   - OAuth integration for Facebook
   - Account management
   - Token storage and refresh

3. Post Management
   - Post creation and storage
   - Scheduling mechanism
   - Basic media handling

This structure provides a solid foundation for building your MVP while allowing for future expansion to include additional features like the AI content assistant, marketplace, analytics, and payment systems. 