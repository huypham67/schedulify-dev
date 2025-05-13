import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { SocialAccount, getUserAccounts, disconnectAccount, initFacebookConnect } from '../../api/social';

const SocialAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, account: SocialAccount | null }>({
    open: false,
    account: null
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchAccounts();
  }, []);
  
  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const accountsData = await getUserAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load social accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectFacebook = async () => {
    setConnectLoading(true);
    setError(null);
    
    try {
      const { redirectUrl } = await initFacebookConnect();
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate Facebook connection');
      console.error('Error connecting Facebook:', err);
    } finally {
      setConnectLoading(false);
    }
  };
  
  const handleDeleteClick = (account: SocialAccount) => {
    setDeleteDialog({
      open: true,
      account
    });
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await disconnectAccount(deleteDialog.account._id);
      setSuccess(`${deleteDialog.account.accountName} has been disconnected`);
      setAccounts(prevAccounts => prevAccounts.filter(acc => acc._id !== deleteDialog.account?._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect account');
      console.error('Error disconnecting account:', err);
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, account: null });
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, account: null });
  };
  
  const renderAccountIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <FacebookIcon fontSize="large" color="primary" />;
      case 'instagram':
        return <InstagramIcon fontSize="large" color="secondary" />;
      default:
        return <Avatar>{platform.charAt(0).toUpperCase()}</Avatar>;
    }
  };
  
  const renderAccounts = () => {
    if (loading && accounts.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (accounts.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" gutterBottom>
            You don't have any connected social accounts yet.
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Connect your social media accounts to start scheduling posts.
          </Typography>
        </Box>
      );
    }
    
    return (
      <List>
        {accounts.map(account => (
          <ListItem
            key={account._id}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="delete" 
                onClick={() => handleDeleteClick(account)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            }
            sx={{ 
              mb: 2, 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <ListItemAvatar>
              {renderAccountIcon(account.platform)}
            </ListItemAvatar>
            <ListItemText
              primary={account.accountName}
              secondary={`Type: ${account.accountType} • Platform ID: ${account.platformUserId}`}
            />
          </ListItem>
        ))}
      </List>
    );
  };
  
  const renderConnectOptions = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FacebookIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h6">Facebook</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Connect your Facebook Page to schedule posts directly to your timeline.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleConnectFacebook}
                disabled={connectLoading}
              >
                {connectLoading ? <CircularProgress size={24} /> : 'Connect Facebook'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InstagramIcon color="secondary" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h6">Instagram</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Connect your Instagram Business account through Facebook to schedule posts.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                variant="contained"
                startIcon={<AddIcon />}
                disabled
              >
                Coming Soon
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
        Social Accounts
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connected Accounts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderAccounts()}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Connect New Account
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderConnectOptions()}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Disconnect Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to disconnect {deleteDialog.account?.accountName}? 
            All scheduled posts for this account will be canceled.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialAccounts; 