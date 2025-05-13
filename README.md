# Schedulify - Social Media Management Platform

Schedulify is a comprehensive social media management platform that allows users to schedule posts, analyze performance, connect with freelancers, and leverage AI for content creation.

![Schedulify Logo](https://via.placeholder.com/500x150?text=Schedulify)

## Features

- **Multiple Platform Management**: Connect and manage Facebook, Instagram, Twitter, and LinkedIn accounts
- **Post Scheduling**: Create and schedule posts across multiple platforms simultaneously
- **Media Management**: Upload and organize images and videos for your posts
- **Calendar View**: Visualize your posting schedule in an intuitive calendar interface
- **Authentication System**: Secure user account management with email verification and OAuth

## Tech Stack

### Backend
- Node.js and Express
- MongoDB for database
- JWT for authentication
- Passport.js for OAuth strategies

### Frontend
- React with TypeScript
- Redux for state management
- TailwindCSS for styling
- Formik and Yup for form validation

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables example file:
   ```bash
   cp env.backup .env
   ```

4. Configure your environment variables in the `.env` file:
   - Set your MongoDB connection URI
   - Configure JWT secrets
   - Set up email provider credentials
   - Add OAuth credentials for social platforms

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Project Structure

```
schedulify-dev/
├── backend/              # Backend Node.js code
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── frontend/             # Frontend React code
│   ├── public/           # Static files
│   └── src/              # React source files
│       ├── components/   # Reusable components
│       ├── pages/        # Page components
│       ├── services/     # API services
│       ├── store/        # Redux store
│       └── types/        # TypeScript types
└── docs/                 # Documentation files
```

## Documentation

For more detailed documentation, please refer to the docs directory:

- [**MVP Roadmap**](docs/MVP-ROADMAP.md): Project roadmap and feature prioritization
- [**Authentication Implementation**](docs/AUTH-IMPLEMENTATION.md): Details of the authentication system
- [**Post Management**](docs/POST-MANAGEMENT.md): Post creation and scheduling implementation
- [**API Endpoints**](docs/API-ENDPOINTS.md): Comprehensive API documentation
- [**Frontend Implementation**](docs/FRONTEND-IMPLEMENTATION.md): Frontend architecture and components

## Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Backend Deployment

The backend can be deployed to any Node.js hosting platform:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

### Frontend Deployment

The React frontend can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)