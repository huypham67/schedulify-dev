# Schedulify Frontend

Frontend application for Schedulify - A social media scheduling platform.

## Features

- Authentication (login, register, email verification)
- Social media account connection (Facebook, Instagram)
- Post creation and scheduling
- Media upload and management
- Post management (edit, delete, publish)

## Tech Stack

- React
- TypeScript
- Material UI
- React Router
- Context API for state management

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd frontend
npm install
```

### Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for production:

```bash
npm run build
```

The build files will be available in the `build` directory.

## Project Structure

```
src/
├── api/                  # API service functions
│   ├── auth.ts           # Authentication API
│   ├── social.ts         # Social media API
│   ├── posts.ts          # Post management API
│   └── media.ts          # Media upload API
│
├── components/           # Reusable UI components
│   ├── common/           # Buttons, forms, etc.
│   ├── auth/             # Login/register forms
│   ├── social/           # Account connection 
│   ├── posts/            # Post editor, list items
│   └── media/            # Media upload, preview
│
├── context/              # React Context
│   ├── AuthContext.tsx   # Authentication state
│   ├── SocialContext.tsx # Social accounts state
│   └── PostContext.tsx   # Posts state
│
├── pages/                # Page components
│   ├── auth/             # Auth pages
│   ├── social/           # Social account pages
│   ├── posts/            # Post management pages
│   └── profile/          # User profile pages
│
├── utils/                # Utility functions
│   ├── auth.ts           # Token handling
│   ├── date.ts           # Date formatting
│   ├── validation.ts     # Form validation
│   └── media.ts          # Media helpers
│
└── App.tsx               # Main app component with routes
```

## Development Roadmap

Check the `documents/FRONTEND-ROADMAP.md` for the detailed development roadmap.

## API Integration

The frontend integrates with the backend API on `/api` endpoints. See `documents/API-ENDPOINTS.md` for the full API documentation.

## License

This project is proprietary and confidential.
