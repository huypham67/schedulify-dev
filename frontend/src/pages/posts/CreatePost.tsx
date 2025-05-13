import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Switch,
  Tooltip
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { SocialAccount, getUserAccounts } from '../../api/social';
import { createPost, schedulePost, publishPost } from '../../api/posts';
import { uploadMedia, deleteMedia } from '../../api/media';

const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaFilePreviews, setMediaFilePreviews] = useState<string[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchAccounts();
  }, []);
  
  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      mediaFilePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [mediaFilePreviews]);
  
  const fetchAccounts = async () => {
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
  
  const handleAccountChange = (accountId: string) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };
  
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      
      // Check file size and type
      const validFiles = newFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        
        return (isImage || isVideo) && isValidSize;
      });
      
      if (validFiles.length !== newFiles.length) {
        setError('Some files were skipped. Only images and videos under 10MB are allowed.');
      }
      
      // Create preview URLs
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      
      setMediaFiles(prev => [...prev, ...validFiles]);
      setMediaFilePreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const removeMedia = (index: number) => {
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(mediaFilePreviews[index]);
    
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaFilePreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  const validateForm = (): boolean => {
    // Reset error
    setError(null);
    
    // Check for content
    if (content.trim() === '') {
      setError('Post content is required');
      return false;
    }
    
    // Check for selected accounts
    if (selectedAccounts.length === 0) {
      setError('Please select at least one social account');
      return false;
    }
    
    // Check scheduled time if in schedule mode
    if (isScheduleMode && !scheduledDateTime) {
      setError('Please select a date and time for scheduling');
      return false;
    }
    
    // Check if scheduled time is in the future
    if (isScheduleMode && scheduledDateTime && scheduledDateTime <= new Date()) {
      setError('Scheduled time must be in the future');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (immediate: boolean = false) => {
    if (!validateForm()) {
      return;
    }
    
    if (immediate) {
      setConfirmDialog(true);
      return;
    }
    
    await createAndSchedulePost();
  };
  
  const handleConfirmPublish = async () => {
    setConfirmDialog(false);
    await createAndSchedulePost(true);
  };
  
  const createAndSchedulePost = async (publishImmediately: boolean = false) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create the post
      const postData = {
        content,
        link: link.trim() || undefined,
        platforms: selectedAccounts.map(id => ({ socialAccount: id })),
        scheduledAt: isScheduleMode && scheduledDateTime ? scheduledDateTime.toISOString() : undefined
      };
      
      const post = await createPost(postData, mediaFiles);
      
      // If not scheduled and publishing immediately
      if (publishImmediately && !isScheduleMode) {
        await publishPost(post._id);
        setSuccess('Post published successfully!');
      } else if (isScheduleMode) {
        setSuccess('Post scheduled successfully!');
      } else {
        setSuccess('Post saved as draft!');
      }
      
      // Clear form after successful submission
      setTimeout(() => {
        navigate('/posts');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderAccountCheckboxes = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      );
    }
    
    if (accounts.length === 0) {
      return (
        <Alert severity="warning">
          You don't have any connected social accounts. Please connect an account first.
        </Alert>
      );
    }
    
    return (
      <FormGroup>
        {accounts.map(account => (
          <FormControlLabel
            key={account._id}
            control={
              <Checkbox 
                checked={selectedAccounts.includes(account._id)}
                onChange={() => handleAccountChange(account._id)}
              />
            }
            label={`${account.accountName} (${account.platform})`}
          />
        ))}
      </FormGroup>
    );
  };
  
  const renderMediaPreviews = () => {
    if (mediaFilePreviews.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Media Attachments
        </Typography>
        <Grid container spacing={2}>
          {mediaFilePreviews.map((preview, index) => (
            <Grid item key={index} xs={6} sm={4} md={3}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component={mediaFiles[index].type.startsWith('video/') ? 'video' : 'img'}
                  src={preview}
                  sx={{ height: 140, objectFit: 'cover' }}
                  controls={mediaFiles[index].type.startsWith('video/')}
                />
                <IconButton
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                  onClick={() => removeMedia(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Create New Post
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
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Post Content
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TextField
              fullWidth
              label="Write your post content"
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              margin="normal"
              placeholder="What would you like to share?"
              required
            />
            
            <TextField
              fullWidth
              label="Link (optional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              margin="normal"
              placeholder="Add a URL"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            {renderMediaPreviews()}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCameraIcon />}
              >
                Add Media
                <input
                  type="file"
                  accept="image/*,video/*"
                  hidden
                  onChange={handleMediaUpload}
                  multiple
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Supported formats: JPG, PNG, GIF, MP4. Maximum size: 10MB.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Post Settings
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Select Accounts</FormLabel>
              {renderAccountCheckboxes()}
            </FormControl>
            
            <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <FormLabel component="legend">Schedule for later</FormLabel>
                <Switch
                  checked={isScheduleMode}
                  onChange={(e) => setIsScheduleMode(e.target.checked)}
                  color="primary"
                />
              </Stack>
              
              {isScheduleMode && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Schedule Date & Time"
                    value={scheduledDateTime}
                    onChange={(newValue) => setScheduledDateTime(newValue)}
                    sx={{ mt: 2 }}
                    disablePast
                  />
                </LocalizationProvider>
              )}
            </FormControl>
            
            <Box sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                {!isScheduleMode && (
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      startIcon={<SendIcon />}
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting || loading || accounts.length === 0}
                    >
                      {isSubmitting ? <CircularProgress size={24} /> : 'Publish Now'}
                    </Button>
                  </Grid>
                )}
                <Grid item xs={isScheduleMode ? 12 : 6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color={isScheduleMode ? "primary" : "secondary"}
                    startIcon={isScheduleMode ? <ScheduleIcon /> : undefined}
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || loading || accounts.length === 0}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : isScheduleMode ? (
                      'Schedule Post'
                    ) : (
                      'Save as Draft'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog for Immediate Publishing */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Publish Post Immediately</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This post will be published immediately to all selected social accounts. This action cannot be undone.
            Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmPublish} color="primary" autoFocus>
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreatePost; 