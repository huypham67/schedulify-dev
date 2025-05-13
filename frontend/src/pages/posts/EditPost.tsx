import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { SocialAccount, getUserAccounts } from '../../api/social';
import { Post, getPostById, updatePost, schedulePost } from '../../api/posts';
import { Media, getMediaForPost, deleteMedia } from '../../api/media';

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [existingMedia, setExistingMedia] = useState<Media[]>([]);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [newMediaPreviews, setNewMediaPreviews] = useState<string[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchPostAndMedia(id);
      fetchAccounts();
    }
  }, [id]);
  
  // Cleanup file previews on unmount
  useEffect(() => {
    return () => {
      newMediaPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newMediaPreviews]);
  
  const fetchPostAndMedia = async (postId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const postData = await getPostById(postId);
      setPost(postData);
      
      // Set form data from post
      setContent(postData.content);
      setLink(postData.link || '');
      setSelectedAccounts(postData.platforms.map(platform => platform.socialAccount));
      
      // Set schedule mode if the post is scheduled
      if (postData.scheduledAt) {
        setIsScheduleMode(true);
        setScheduledDateTime(new Date(postData.scheduledAt));
      }
      
      // Fetch media for this post if it has any
      if (postData.media && postData.media.length > 0) {
        const mediaData = await getMediaForPost(postId);
        setExistingMedia(mediaData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post details');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAccounts = async () => {
    try {
      const accountsData = await getUserAccounts();
      setAccounts(accountsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load social accounts');
      console.error('Error fetching accounts:', err);
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
  
  const handleNewMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setNewMediaFiles(prev => [...prev, ...validFiles]);
      setNewMediaPreviews(prev => [...prev, ...newPreviews]);
    }
  };
  
  const removeExistingMedia = (mediaId: string) => {
    setExistingMedia(prev => prev.filter(media => media._id !== mediaId));
    setMediaToDelete(prev => [...prev, mediaId]);
  };
  
  const removeNewMedia = (index: number) => {
    // Revoke the preview URL to prevent memory leaks
    URL.revokeObjectURL(newMediaPreviews[index]);
    
    setNewMediaFiles(prev => prev.filter((_, i) => i !== index));
    setNewMediaPreviews(prev => prev.filter((_, i) => i !== index));
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
  
  const handleSubmit = async () => {
    if (!validateForm() || !id || !post) {
      return;
    }
    
    setConfirmDialog(true);
  };
  
  const handleConfirmUpdate = async () => {
    setConfirmDialog(false);
    
    if (!id || !post) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData = {
        content,
        link: link.trim() || undefined,
        platforms: selectedAccounts.map(id => ({ socialAccount: id })),
        clearMedia: mediaToDelete.length > 0
      };
      
      // Update the post
      const updatedPost = await updatePost(id, updateData, newMediaFiles);
      
      // Delete the marked media files
      if (mediaToDelete.length > 0) {
        await Promise.all(mediaToDelete.map(mediaId => deleteMedia(mediaId)));
      }
      
      // Handle scheduling
      if (isScheduleMode && scheduledDateTime) {
        await schedulePost(id, scheduledDateTime.toISOString());
        setSuccess('Post updated and scheduled successfully!');
      } else {
        setSuccess('Post updated successfully!');
      }
      
      // Navigate back to post details after a short delay
      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post. Please try again.');
      console.error('Error updating post:', err);
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
  
  const renderExistingMedia = () => {
    if (existingMedia.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Existing Media
        </Typography>
        <ImageList cols={3} rowHeight={140}>
          {existingMedia.map((media) => (
            <ImageListItem key={media._id} sx={{ position: 'relative' }}>
              {media.mimetype.startsWith('image/') ? (
                <img
                  src={`/api/media/${media._id}`}
                  alt={media.originalFilename}
                  loading="lazy"
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <video
                  src={`/api/media/${media._id}`}
                  style={{ height: '100%', objectFit: 'cover' }}
                />
              )}
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
                onClick={() => removeExistingMedia(media._id)}
              >
                <CloseIcon />
              </IconButton>
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    );
  };
  
  const renderNewMediaPreviews = () => {
    if (newMediaPreviews.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          New Media
        </Typography>
        <Grid container spacing={2}>
          {newMediaPreviews.map((preview, index) => (
            <Grid item key={index} xs={6} sm={4} md={3}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component={newMediaFiles[index].type.startsWith('video/') ? 'video' : 'img'}
                  src={preview}
                  sx={{ height: 140, objectFit: 'cover' }}
                  controls={newMediaFiles[index].type.startsWith('video/')}
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
                  onClick={() => removeNewMedia(index)}
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!post) {
    return (
      <Alert severity="error">
        Post not found. <Link to="/posts">Back to Posts</Link>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={Link}
          to={`/posts/${id}`}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Post
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Edit Post
        </Typography>
      </Box>
      
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
            
            {renderExistingMedia()}
            {renderNewMediaPreviews()}
            
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
                  onChange={handleNewMediaUpload}
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
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
      >
        <DialogTitle>Save Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isScheduleMode
              ? 'Your changes will be saved and the post will be scheduled. Continue?'
              : 'Your changes will be saved. Continue?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmUpdate} color="primary" autoFocus>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditPost; 