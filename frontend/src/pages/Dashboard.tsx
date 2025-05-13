import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Facebook as FacebookIcon, 
  Instagram as InstagramIcon,
  Add as AddIcon,
  PostAdd as PostAddIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { SocialAccount } from '../api/social';
import { getUserAccounts } from '../api/social';

const Dashboard: React.FC = () => {
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accounts = await getUserAccounts();
        setSocialAccounts(accounts);
      } catch (err) {
        setError('Failed to load social accounts. Please try again later.');
        console.error('Error fetching social accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);
  
  // Get social account counts by platform
  const facebookAccounts = socialAccounts.filter(account => account.platform === 'facebook').length;
  const instagramAccounts = socialAccounts.filter(account => account.platform === 'instagram').length;
  
  const renderSocialAccountSummary = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (socialAccounts.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" gutterBottom>
            You don't have any connected social accounts yet.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/social-accounts"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Connect Account
          </Button>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FacebookIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Facebook</Typography>
              </Box>
              <Typography variant="body1">{facebookAccounts} connected accounts</Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/social-accounts"
              >
                Manage
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InstagramIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Instagram</Typography>
              </Box>
              <Typography variant="body1">{instagramAccounts} connected accounts</Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                to="/social-accounts"
              >
                Manage
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName || 'User'}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Social Account Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connected Social Accounts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderSocialAccountSummary()}
          </Paper>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/posts/create"
                  startIcon={<PostAddIcon />}
                  sx={{ py: 2 }}
                >
                  Create New Post
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/posts"
                  startIcon={<ListIcon />}
                  sx={{ py: 2 }}
                >
                  View Posts
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/social-accounts"
                  startIcon={<AddIcon />}
                  sx={{ py: 2 }}
                >
                  Connect Account
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 