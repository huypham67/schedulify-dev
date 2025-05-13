import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Container
} from '@mui/material';
import { completeFacebookConnection, FacebookConnectionData } from '../../api/social';

const Connect: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Extract query parameters from URL
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const platform = searchParams.get('platform');
  
  useEffect(() => {
    const completeConnection = async () => {
      if (!code || !state) {
        setError('Invalid connection parameters. Please try again.');
        setIsProcessing(false);
        return;
      }

      try {
        // Currently only Facebook is implemented
        if (platform === 'facebook' || !platform) {
          const connectionData: FacebookConnectionData = {
            authCode: code,
            state: state
          };

          await completeFacebookConnection(connectionData);
          setSuccess(true);
        } else {
          setError(`Connection for platform ${platform} is not implemented yet.`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete connection. Please try again.');
        console.error('Connection error:', err);
      } finally {
        setIsProcessing(false);
      }
    };

    if (code && state) {
      completeConnection();
    } else {
      setError('Missing required connection parameters');
      setIsProcessing(false);
    }
  }, [code, state, platform]);

  const handleNavigateToAccounts = () => {
    navigate('/social-accounts');
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Completing connection...
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Please wait while we connect your account. This may take a few moments.
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNavigateToAccounts}
          >
            Back to Social Accounts
          </Button>
        </Box>
      );
    }

    if (success) {
      return (
        <Box sx={{ my: 4 }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Account successfully connected!
          </Alert>
          <Typography paragraph>
            Your social media account has been connected successfully. You can now schedule posts to this account.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNavigateToAccounts}
          >
            Go to Social Accounts
          </Button>
        </Box>
      );
    }

    return null;
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Connecting Social Account
        </Typography>
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default Connect; 