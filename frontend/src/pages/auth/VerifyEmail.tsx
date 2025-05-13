import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { verifyEmail } from '../../api/auth';

const VerifyEmail: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get token from URL or from location state
  const token = searchParams.get('token');
  const email = location.state?.email || '';
  
  useEffect(() => {
    // If token is present in URL, automatically verify email
    if (token) {
      verifyUserEmail(token);
    }
  }, [token]);
  
  const verifyUserEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      await verifyEmail(verificationToken);
      setVerificationStatus('success');
      
      // Redirect to login after successful verification (after 3 seconds)
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified successfully. Please log in.' } });
      }, 3000);
    } catch (err) {
      setVerificationStatus('failed');
      setError(err instanceof Error ? err.message : 'Email verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Schedulify
          </Typography>
          
          {!token && (
            <>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Verify Your Email
              </Typography>
              
              <Typography variant="body1" align="center" paragraph>
                We've sent a verification email to{' '}
                <strong>{email || 'your email address'}</strong>.
              </Typography>
              
              <Typography variant="body1" align="center" paragraph>
                Please check your inbox and click the verification link to complete your registration.
              </Typography>
              
              <Typography variant="body2" align="center" color="textSecondary" paragraph>
                If you don't see the email, check your spam folder or request a new verification email.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 1 }}
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!email || isVerifying}
                >
                  Resend Verification Email
                </Button>
              </Box>
            </>
          )}
          
          {token && (
            <>
              <Typography variant="h5" component="h2" align="center" gutterBottom>
                Email Verification
              </Typography>
              
              {isVerifying && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                  <CircularProgress />
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    Verifying your email...
                  </Typography>
                </Box>
              )}
              
              {!isVerifying && verificationStatus === 'success' && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Your email has been successfully verified! Redirecting to login page...
                </Alert>
              )}
              
              {!isVerifying && verificationStatus === 'failed' && (
                <>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Verification failed. Please try again.'}
                  </Alert>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to="/login"
                    >
                      Back to Login
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmail; 