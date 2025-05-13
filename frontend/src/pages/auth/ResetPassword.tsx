import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { forgotPassword, resetPassword } from '../../api/auth';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get token from URL
  const token = searchParams.get('token');
  
  // Switch between "request reset" and "set new password" modes
  const isResetMode = !!token;
  
  const handleRequestReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await forgotPassword(email);
      setSuccessMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request password reset. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      setError('Invalid password reset token');
      return;
    }
    
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await resetPassword(token, password);
      setSuccessMessage('Your password has been reset successfully!');
      
      // Redirect to login after successful reset (after 3 seconds)
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successfully. Please log in with your new password.' } });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Schedulify
          </Typography>
          
          <Typography variant="h5" component="h2" align="center" gutterBottom>
            {isResetMode ? 'Reset Your Password' : 'Forgot Password'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          {!isResetMode && !successMessage && (
            <Box component="form" onSubmit={handleRequestReset} noValidate>
              <Typography variant="body1" paragraph>
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Instructions'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link to="/login">
                  <Typography variant="body2">
                    Back to Login
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
          
          {isResetMode && !successMessage && (
            <Box component="form" onSubmit={handlePasswordReset} noValidate>
              <Typography variant="body1" paragraph>
                Enter your new password below.
              </Typography>
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
              
              <Box sx={{ textAlign: 'center' }}>
                <Link to="/login">
                  <Typography variant="body2">
                    Back to Login
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
          
          {successMessage && (
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login">
                <Button variant="outlined">
                  Back to Login
                </Button>
              </Link>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword; 