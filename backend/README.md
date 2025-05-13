# Schedulify Backend

The backend implementation for Schedulify - a social media management platform that allows users to schedule posts, manage content, and integrate with multiple social media platforms.

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Copy the environment file:

```bash
cp env.backup .env
```

5. Edit the `.env` file with your configuration
6. Start the development server:

```bash
npm run dev
```

## Project Structure

```
backend/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── middleware/     # Express middleware
├── models/         # Mongoose schemas
├── routes/         # API routes
├── scripts/        # Utility scripts
├── services/       # Business logic
├── uploads/        # Media storage
├── utils/          # Helper functions
├── app.js          # Express application
└── server.js       # Server entry point
```

## API Documentation

For detailed API documentation, please refer to `/documents/API-ENDPOINTS.md`.

### Available Endpoints

**Authentication:**
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

**Social Media Integration:**
- `GET /api/social/accounts` - Get connected social accounts
- `GET /api/social/connect/:platform` - Connect to a social platform
- `DELETE /api/social/accounts/:id` - Disconnect a social account

**Post Management:**
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/schedule` - Schedule a post
- `POST /api/posts/:id/publish` - Publish a post immediately

**Media Management:**
- `POST /api/media/upload` - Upload a media file
- `DELETE /api/media/:id` - Delete a media file

## Implementation Details

For detailed implementation guides:

- **Business Requirements**: See `documents/BUSINESS-REQUIREMENTS.md`
- **MVP Roadmap**: See `documents/MVP-ROADMAP.md`
- **Authentication System**: See `documents/AUTH-IMPLEMENTATION.md`
- **Project Structure**: See `documents/PROJECT-STRUCTURE.md`
- **Testing the API**: See `documents/TESTING-GUIDE.md`

## Features

- **Authentication System**
  - JWT-based authentication with refresh tokens
  - OAuth integration for social platforms
  - Email verification and password reset

- **Social Media Integration**
  - Connect with Facebook, Instagram
  - Securely store access tokens

- **Post Management System**
  - Create and schedule posts
  - Support for text, images, and videos
  - Publish to multiple platforms

- **Auto Publishing**
  - Cron job for scheduled posts
  - Real-time status updates

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm test` - Run tests

## Technologies Used

- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **Passport.js** - Authentication
- **Multer** - File uploads
- **node-cron** - Task scheduling
- **Winston** - Logging

## Error Handling

The application uses a standardized error handling approach:

- All errors follow the format:
  ```json
  {
    "success": false,
    "message": "Error description"
  }
  ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Create a pull request

## License

This project is licensed under the MIT License 