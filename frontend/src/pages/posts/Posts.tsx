import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Send as SendIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon
} from '@mui/icons-material';
import { Post, getPosts, deletePost, publishPost } from '../../api/posts';
import { SocialAccount, getUserAccounts } from '../../api/social';

// Type for post status filter tabs
interface TabStatus {
  label: string;
  value: string;
}

const statusTabs: TabStatus[] = [
  { label: 'All', value: '' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' },
  { label: 'Failed', value: 'failed' },
];

const PAGE_SIZE = 10;

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [accounts, setAccounts] = useState<Record<string, SocialAccount>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [actionAnchorEl, setActionAnchorEl] = useState<Record<string, HTMLElement | null>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, post: Post | null }>({
    open: false,
    post: null
  });
  const [publishDialog, setPublishDialog] = useState<{ open: boolean, post: Post | null }>({
    open: false,
    post: null
  });
  
  // Load posts and accounts on initial render and when filters change
  useEffect(() => {
    fetchPosts();
    fetchAccounts();
  }, [statusFilter, page]);
  
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { posts: fetchedPosts, totalCount } = await getPosts({
        status: statusFilter,
        page,
        limit: PAGE_SIZE,
      });
      
      setPosts(fetchedPosts);
      setTotalPosts(totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error fetching posts:', err);
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
  
  const handleSearch = () => {
    // Reset to page 1 when searching
    setPage(1);
    fetchPosts();
  };
  
  const handleStatusChange = (_event: React.SyntheticEvent, newValue: string) => {
    setStatusFilter(newValue);
    setPage(1); // Reset to page 1 when changing filter
  };
  
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  const handleActionsOpen = (event: React.MouseEvent<HTMLElement>, postId: string) => {
    setActionAnchorEl({
      ...actionAnchorEl,
      [postId]: event.currentTarget
    });
  };
  
  const handleActionsClose = (postId: string) => {
    setActionAnchorEl({
      ...actionAnchorEl,
      [postId]: null
    });
  };
  
  const handleDeleteClick = (post: Post) => {
    setDeleteDialog({
      open: true,
      post
    });
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.post) return;
    
    try {
      await deletePost(deleteDialog.post._id);
      setSuccess(`Post successfully deleted`);
      setPosts(posts.filter(p => p._id !== deleteDialog.post?._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      console.error('Error deleting post:', err);
    } finally {
      setDeleteDialog({ open: false, post: null });
    }
  };
  
  const handlePublishClick = (post: Post) => {
    setPublishDialog({
      open: true,
      post
    });
  };
  
  const handlePublishConfirm = async () => {
    if (!publishDialog.post) return;
    
    try {
      const updatedPost = await publishPost(publishDialog.post._id);
      setSuccess(`Post successfully published`);
      
      // Update the post in the list
      setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
      console.error('Error publishing post:', err);
    } finally {
      setPublishDialog({ open: false, post: null });
    }
  };
  
  const renderPostStatusChip = (status: string) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="primary" size="small" />;
      case 'published':
        return <Chip label="Published" color="success" size="small" />;
      case 'failed':
        return <Chip label="Failed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  const renderPlatformIcon = (platformId: string) => {
    const account = accounts[platformId];
    if (!account) return null;
    
    switch (account.platform) {
      case 'facebook':
        return (
          <Tooltip title={account.accountName}>
            <FacebookIcon fontSize="small" color="primary" />
          </Tooltip>
        );
      case 'instagram':
        return (
          <Tooltip title={account.accountName}>
            <InstagramIcon fontSize="small" color="secondary" />
          </Tooltip>
        );
      default:
        return null;
    }
  };
  
  const renderPosts = () => {
    if (loading && posts.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (posts.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" gutterBottom>
            No posts found.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/posts/create"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create New Post
          </Button>
        </Box>
      );
    }
    
    return (
      <>
        <Grid container spacing={2}>
          {posts.map(post => (
            <Grid item xs={12} key={post._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box>
                      {renderPostStatusChip(post.status)}
                      {post.scheduledAt && (
                        <Chip 
                          icon={<ScheduleIcon fontSize="small" />} 
                          label={new Date(post.scheduledAt).toLocaleString()} 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    <Box>
                      {post.platforms.map(platform => (
                        <Box component="span" key={platform.socialAccount} sx={{ mx: 0.5 }}>
                          {renderPlatformIcon(platform.socialAccount)}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" sx={{ mt: 2, wordBreak: 'break-word' }}>
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </Typography>
                  
                  {post.link && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      <a href={post.link} target="_blank" rel="noopener noreferrer">
                        {post.link}
                      </a>
                    </Typography>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                    Created: {new Date(post.createdAt).toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  {post.status === 'draft' && (
                    <Button 
                      size="small" 
                      startIcon={<SendIcon />}
                      onClick={() => handlePublishClick(post)}
                    >
                      Publish
                    </Button>
                  )}
                  
                  <IconButton 
                    size="small" 
                    component={Link} 
                    to={`/posts/${post._id}/edit`}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(post)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => handleActionsOpen(e, post._id)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  
                  <Menu
                    anchorEl={actionAnchorEl[post._id]}
                    open={Boolean(actionAnchorEl[post._id])}
                    onClose={() => handleActionsClose(post._id)}
                  >
                    <MenuItem 
                      component={Link} 
                      to={`/posts/${post._id}`}
                      onClick={() => handleActionsClose(post._id)}
                    >
                      View Details
                    </MenuItem>
                    {post.status === 'draft' && (
                      <MenuItem 
                        onClick={() => {
                          handleActionsClose(post._id);
                          handlePublishClick(post);
                        }}
                      >
                        Publish Now
                      </MenuItem>
                    )}
                    <MenuItem 
                      component={Link} 
                      to={`/posts/${post._id}/edit`}
                      onClick={() => handleActionsClose(post._id)}
                    >
                      Edit Post
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        handleActionsClose(post._id);
                        handleDeleteClick(post);
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      Delete Post
                    </MenuItem>
                  </Menu>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {totalPosts > PAGE_SIZE && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={Math.ceil(totalPosts / PAGE_SIZE)} 
              page={page} 
              onChange={handlePageChange} 
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };
  
  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h4">
            Posts
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Button
            variant="contained"
            component={Link}
            to="/posts/create"
            startIcon={<AddIcon />}
          >
            Create New Post
          </Button>
        </Grid>
      </Grid>
      
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
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={statusFilter}
          onChange={handleStatusChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button onClick={handleSearch}>Search</Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderPosts()}
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, post: null })}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, post: null })}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Publish Confirmation Dialog */}
      <Dialog
        open={publishDialog.open}
        onClose={() => setPublishDialog({ open: false, post: null })}
      >
        <DialogTitle>Publish Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This post will be published immediately to all selected social accounts.
            Are you sure you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog({ open: false, post: null })}>Cancel</Button>
          <Button onClick={handlePublishConfirm} color="primary" autoFocus>
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Posts; 