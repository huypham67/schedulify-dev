import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    setIsProfileSubmitting(true);
    
    // Simple form validation
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      setIsProfileSubmitting(false);
      return;
    }
    
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      // Show success message
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile. Please try again.');
    } finally {
      setIsProfileSubmitting(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsPasswordSubmitting(true);
    
    // Password validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
      setPasswordError('All fields are required');
      setIsPasswordSubmitting(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      setIsPasswordSubmitting(false);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('Passwords do not match');
      setIsPasswordSubmitting(false);
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Clear password fields and show success message
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setPasswordSuccess('Password changed successfully. Please use your new password next time you login.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password. Please try again.');
    } finally {
      setIsPasswordSubmitting(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'primary.main',
                  fontSize: '1.5rem',
                  mr: 2
                }}
              >
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </Avatar>
              <Typography variant="h6">
                {user?.firstName} {user?.lastName}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleProfileChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    disabled
                    helperText="Email cannot be changed"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isProfileSubmitting}
                  >
                    {isProfileSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
        
        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            
            <Divider sx={{ mb: 3 }} />
            
            {passwordError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {passwordError}
              </Alert>
            )}
            
            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {passwordSuccess}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handlePasswordSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle current password visibility"
                            onClick={toggleCurrentPasswordVisibility}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    helperText="Password must be at least 8 characters long"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle new password visibility"
                            onClick={toggleNewPasswordVisibility}
                            edge="end"
                          >
                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmNewPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isPasswordSubmitting}
                  >
                    {isPasswordSubmitting ? <CircularProgress size={24} /> : 'Change Password'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 