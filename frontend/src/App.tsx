import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth components
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ResetPassword from './pages/auth/ResetPassword';
import OAuthCallback from './pages/auth/OAuthCallback';

// Layout component
import Layout from './components/common/Layout';

// Main pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/profile/Profile';

// Social media pages
import SocialAccounts from './pages/social/SocialAccounts';
import Connect from './pages/social/Connect';

// Post management pages
import Posts from './pages/posts/Posts';
import CreatePost from './pages/posts/CreatePost';
import PostDetail from './pages/posts/PostDetail';
import EditPost from './pages/posts/EditPost';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth-callback" element={<OAuthCallback />} />
      <Route path="/social/connect/callback" element={<Connect />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Social account routes */}
      <Route path="/social-accounts" element={
        <ProtectedRoute>
          <SocialAccounts />
        </ProtectedRoute>
      } />
      
      {/* Post management routes */}
      <Route path="/posts" element={
        <ProtectedRoute>
          <Posts />
        </ProtectedRoute>
      } />
      <Route path="/posts/create" element={
        <ProtectedRoute>
          <CreatePost />
        </ProtectedRoute>
      } />
      <Route path="/posts/:id" element={
        <ProtectedRoute>
          <PostDetail />
        </ProtectedRoute>
      } />
      <Route path="/posts/:id/edit" element={
        <ProtectedRoute>
          <EditPost />
        </ProtectedRoute>
      } />
      
      {/* Profile route */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* Catch all - redirect to home or login depending on auth status */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
