import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardMedia,
  ImageList,
  ImageListItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { Post, getPostById, deletePost, publishPost } from '../../api/posts';
import { SocialAccount, getUserAccounts } from '../../api/social';
import { Media, getMediaForPost } from '../../api/media';

const PostDetail: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [accounts, setAccounts] = useState<Record<string, SocialAccount>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [publishDialog, setPublishDialog] = useState(false);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      fetchPost(id);
      fetchAccounts();
    }
  }, [id]);
  
  const fetchPost = async (postId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const postData = await getPostById(postId);
      setPost(postData);
      
      // Fetch media for this post
      if (postData.media && postData.media.length > 0) {
        const mediaData = await getMediaForPost(postId);
        setMedia(mediaData);
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
      
      // Convert array to object map for easier lookup
      const accountsMap: Record<string, SocialAccount> = {};
      accountsData.forEach(account => {
        accountsMap[account._id] = account;
      });
      
      setAccounts(accountsMap);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };
  
  const handleDeleteClick = () => {
    setDeleteDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      await deletePost(id);
      setSuccess('Post successfully deleted');
      
      // Navigate back to posts list after a short delay
      setTimeout(() => {
        navigate('/posts');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      console.error('Error deleting post:', err);
    } finally {
      setDeleteDialog(false);
    }
  };
  
  const handlePublishClick = () => {
    setPublishDialog(true);
  };
  
  const handlePublishConfirm = async () => {
    if (!id) return;
    
    try {
      const updatedPost = await publishPost(id);
      setPost(updatedPost);
      setSuccess('Post published successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
      console.error('Error publishing post:', err);
    } finally {
      setPublishDialog(false);
    }
  };
  
  const renderPostStatusChip = (status: string) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="primary" />;
      case 'published':
        return <Chip label="Published" color="success" />;
      case 'failed':
        return <Chip label="Failed" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };
  
  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <FacebookIcon color="primary" />;
      case 'instagram':
        return <InstagramIcon color="secondary" />;
      default:
        return <Avatar>{platform.charAt(0).toUpperCase()}</Avatar>;
    }
  };
  
  const renderMediaItems = () => {
    if (media.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Media Attachments
        </Typography>
        <ImageList cols={media.length > 1 ? 2 : 1} rowHeight={250}>
          {media.map((item) => (
            <ImageListItem key={item._id}>
              {item.mimetype.startsWith('image/') ? (
                <img
                  src={`/api/media/${item._id}`}
                  alt={item.originalFilename}
                  loading="lazy"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              ) : (
                <video
                  src={`/api/media/${item._id}`}
                  controls
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      </Box>
    );
  };
  
  const renderPlatforms = () => {
    if (!post || !post.platforms || post.platforms.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Publishing Platforms
        </Typography>
        <List>
          {post.platforms.map((platform) => {
            const account = accounts[platform.socialAccount];
            if (!account) return null;
            
            return (
              <ListItem key={platform.socialAccount}>
                <ListItemAvatar>
                  {renderPlatformIcon(account.platform)}
                </ListItemAvatar>
                <ListItemText
                  primary={account.accountName}
                  secondary={`Status: ${platform.status || 'pending'}`}
                />
              </ListItem>
            );
          })}
        </List>
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
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!post) {
    return (
      <Alert severity="warning">
        Post not found. <Link to="/posts">Back to Posts</Link>
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button
          component={Link}
          to="/posts"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Posts
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Post Details
        </Typography>
        <Box>
          {post.status === 'draft' && (
            <Button
              variant="contained"
              color="success"
              startIcon={<SendIcon />}
              onClick={handlePublishClick}
              sx={{ mr: 1 }}
            >
              Publish
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            component={Link}
            to={`/posts/${post._id}/edit`}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteClick}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {renderPostStatusChip(post.status)}
              {post.scheduledAt && (
                <Chip 
                  icon={<ScheduleIcon />} 
                  label={new Date(post.scheduledAt).toLocaleString()} 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
            
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap', mt: 3 }}>
              {post.content}
            </Typography>
            
            {post.link && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <LinkIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="body2" component="a" href={post.link} target="_blank" rel="noopener noreferrer">
                  {post.link}
                </Typography>
              </Box>
            )}
            
            {renderMediaItems()}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Post Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1">
                {new Date(post.updatedAt).toLocaleString()}
              </Typography>
            </Box>
            
            {post.scheduledAt && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Scheduled For
                </Typography>
                <Typography variant="body1">
                  {new Date(post.scheduledAt).toLocaleString()}
                </Typography>
              </Box>
            )}
            
            {renderPlatforms()}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishDialog}
        onClose={() => setPublishDialog(false)}
      >
        <DialogTitle>Publish Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This post will be published immediately to all selected social accounts.
            Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog(false)}>Cancel</Button>
          <Button onClick={handlePublishConfirm} color="primary" autoFocus>
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostDetail; 