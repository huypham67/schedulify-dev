# Schedulify Documentation

Welcome to the official Schedulify documentation - a comprehensive guide for developers working on this social media management platform.

## About Schedulify

Schedulify is a social media management platform that enables users to:
- Schedule and publish posts across multiple social media platforms
- Connect social media accounts (Facebook, Instagram)
- Manage content with support for text, images, and videos

## Documentation Structure

This documentation is organized into the following key sections:

### Business Understanding
- [**Business Requirements**](BUSINESS-REQUIREMENTS.md) - Comprehensive overview of business needs and domain logic
- [**MVP Roadmap**](MVP-ROADMAP.md) - Development plan for MVP features and release timeline

### Core Implementation Guides
- [**Project Structure**](PROJECT-STRUCTURE.md) - Overall architecture and organization
- [**API Endpoints**](API-ENDPOINTS.md) - Complete list of available endpoints
- [**Authentication System**](AUTH-IMPLEMENTATION.md) - JWT-based authentication implementation

### Testing and Development
- [**Testing Guide**](TESTING-GUIDE.md) - Guide for testing various API endpoints

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory
2. Copy `.env.backup` to `.env` and configure environment variables
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

### Project Structure

```
schedulify/
├── backend/           # Node.js/Express backend
│   ├── config/        # Configuration (DB, env, auth)
│   ├── controllers/   # Request handlers
│   ├── models/        # MongoDB schemas
│   ├── routes/        # API endpoint definitions
│   ├── services/      # Business logic
│   ├── middleware/    # Express middleware
│   └── utils/         # Helper functions
└── frontend/          # React frontend (separate repository)
```

## Technology Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Passport.js for OAuth
- Multer for file uploads

## Development Status

Current implemented features:
- Complete authentication system (local + OAuth)
- Social media account connections
- Post creation, scheduling and management
- Media file uploads

For detailed implementation information, refer to the specific guides linked above. 