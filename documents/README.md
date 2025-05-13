# Schedulify Documentation

This is the official documentation for Schedulify - a social media management platform that enables scheduling and publishing of content across multiple social networks.

## About Schedulify

Schedulify helps users:
- Create and manage social media content from a centralized dashboard
- Connect to Facebook (pages and business accounts)
- Schedule posts for future publication
- Track post status and publication results

## Documentation Overview

### Business Documentation
- [**Business Requirements**](BUSINESS-REQUIREMENTS.md) - Domain logic and business needs
- [**MVP Roadmap**](MVP-ROADMAP.md) - Core features and implementation timeline

### Technical Documentation
- [**Project Structure**](PROJECT-STRUCTURE.md) - Architecture and codebase organization
- [**API Endpoints**](API-ENDPOINTS.md) - Available API endpoints with examples
- [**Authentication System**](AUTH-IMPLEMENTATION.md) - JWT authentication implementation
- [**Testing Guide**](TESTING-GUIDE.md) - Step-by-step API testing with Postman

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory
2. Copy `env.backup` to `.env` and configure environment variables
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## Technology Stack

- **Backend**: Node.js + Express, MongoDB with Mongoose
- **Authentication**: JWT tokens, Passport.js for OAuth
- **Media Handling**: Multer for file uploads
- **Scheduled Tasks**: Node-cron for post publishing

## Current Implementation Status

- ✅ User authentication (local + OAuth)
- ✅ Facebook page connection
- ✅ Post creation with media support
- ✅ Post scheduling and publishing
- ✅ Publication status tracking

Refer to the specific documentation files for detailed implementation information.

## Documentation

- [BUSINESS-REQUIREMENTS.md](./BUSINESS-REQUIREMENTS.md) - Business requirements and feature specifications
- [PROJECT-STRUCTURE.md](./PROJECT-STRUCTURE.md) - Detailed project structure and architecture
- [API-ENDPOINTS.md](./API-ENDPOINTS.md) - API documentation and examples
- [AUTH-IMPLEMENTATION.md](./AUTH-IMPLEMENTATION.md) - Authentication system implementation details
- [OAUTH-GUIDE.md](./OAUTH-GUIDE.md) - Comprehensive guide for OAuth setup and testing
- [FRONTEND-ROADMAP.md](./FRONTEND-ROADMAP.md) - Frontend development roadmap
- [MVP-ROADMAP.md](./MVP-ROADMAP.md) - Minimum Viable Product implementation plan
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Testing procedures and guidelines 