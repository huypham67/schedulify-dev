import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, CircularProgress, Typography, Paper, Alert, Button } from '@mui/material';
import { setStoredTokens } from '../../utils/auth';

const OAuthCallback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get access token and refresh token from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const accessToken = queryParams.get('accessToken');
        const refreshToken = queryParams.get('refreshToken');
        const errorParam = queryParams.get('error');
        const errorMessage = queryParams.get('message');
        
        if (errorParam) {
          setError(errorMessage || 'Authentication failed. Please try again.');
          setLoading(false);
          return;
        }

        if (!accessToken || !refreshToken) {
          setError('Invalid authentication response. Please try again.');
          setLoading(false);
          return;
        }

        // Store tokens
        setStoredTokens(accessToken, refreshToken);
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } catch (err) {
        console.error('OAuth callback processing error:', err);
        setError('Failed to process authentication. Please try again.');
        setLoading(false);
      }
    };

    processCallback();
  }, [location, navigate]);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {loading ? (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Completing Authentication
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we complete your login...
              </Typography>
            </>
          ) : error ? (
            <>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Typography variant="body1" sx={{ mb: 3 }}>
                There was a problem with the OAuth authentication.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleReturnToLogin}
              >
                Return to Login
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h5" color="primary" gutterBottom>
                Authentication Successful!
              </Typography>
              <Typography variant="body1">
                Redirecting to your dashboard...
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default OAuthCallback; 