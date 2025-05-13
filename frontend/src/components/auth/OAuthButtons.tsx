import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Stack, 
  Divider, 
  Box, 
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';

// Add material icons for Google and Facebook
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.68-.06-1.34-.17-1.96z"/>
    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.8 4.8 0 0 1 4.48-3.3z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
    <path fill="#1877F2" d="M18 9a9 9 0 1 0-10.4 8.88v-6.29H5.33V9h2.27V7.01c0-2.25 1.34-3.5 3.4-3.5.98 0 2.01.18 2.01.18v2.22h-1.13c-1.11 0-1.46.69-1.46 1.4V9h2.48l-.4 2.59h-2.08v6.29A9 9 0 0 0 18 9z"/>
  </svg>
);

const OAuthButtons: React.FC = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthStatus, setOauthStatus] = useState<{google: boolean, facebook: boolean}>({
    google: true,
    facebook: true
  });

  // Check OAuth configuration
  useEffect(() => {
    const checkOAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/oauth-status');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.oauthProviders) {
            setOauthStatus(data.oauthProviders);
          }
        }
      } catch (error) {
        console.error('Failed to check OAuth status:', error);
        // If we can't reach the endpoint, assume OAuth is not available
        setOauthStatus({ google: false, facebook: false });
      }
    };
    
    checkOAuthStatus();
  }, []);

  const handleGoogleLogin = () => {
    if (!oauthStatus.google) {
      setError('Google authentication is not configured on the server.');
      return;
    }

    try {
      setIsGoogleLoading(true);
      setError(null);
      
      // Add a small timeout to show loading state
      setTimeout(() => {
        window.location.href = '/api/auth/google';
      }, 300);
      
      // Set a timeout to show error if redirect doesn't happen
      setTimeout(() => {
        if (document.hasFocus()) {
          setIsGoogleLoading(false);
          setError('Failed to connect to Google. Please try again later.');
        }
      }, 5000);
    } catch (error) {
      console.error('Error redirecting to Google OAuth:', error);
      setIsGoogleLoading(false);
      setError('Failed to connect to Google. Please try again.');
    }
  };

  const handleFacebookLogin = () => {
    if (!oauthStatus.facebook) {
      setError('Facebook authentication is not configured on the server.');
      return;
    }

    try {
      setIsFacebookLoading(true);
      setError(null);
      
      // Add a small timeout to show loading state
      setTimeout(() => {
        window.location.href = '/api/auth/facebook';
      }, 300);
      
      // Set a timeout to show error if redirect doesn't happen
      setTimeout(() => {
        if (document.hasFocus()) {
          setIsFacebookLoading(false);
          setError('Failed to connect to Facebook. Please try again later.');
        }
      }, 5000);
    } catch (error) {
      console.error('Error redirecting to Facebook OAuth:', error);
      setIsFacebookLoading(false);
      setError('Failed to connect to Facebook. Please try again.');
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 3 }}>
        <Divider sx={{ flexGrow: 1 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          OR
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>
      
      {(!oauthStatus.google && !oauthStatus.facebook) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          OAuth login is not available. The server might be misconfigured.
        </Alert>
      )}
      
      <Stack spacing={2}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={!isGoogleLoading && <GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isFacebookLoading || !oauthStatus.google}
          sx={{ 
            textTransform: 'none',
            borderColor: '#DADCE0',
            color: '#3c4043',
            '&:hover': {
              borderColor: '#DADCE0',
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          {isGoogleLoading ? <CircularProgress size={24} /> : 'Continue with Google'}
        </Button>
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={!isFacebookLoading && <FacebookIcon />}
          onClick={handleFacebookLogin}
          disabled={isGoogleLoading || isFacebookLoading || !oauthStatus.facebook}
          sx={{ 
            textTransform: 'none',
            borderColor: '#E7E9EC',
            color: '#1877F2',
            '&:hover': {
              borderColor: '#1877F2',
              backgroundColor: '#F5F9FF'
            }
          }}
        >
          {isFacebookLoading ? <CircularProgress size={24} /> : 'Continue with Facebook'}
        </Button>
      </Stack>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={handleCloseError}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OAuthButtons; 