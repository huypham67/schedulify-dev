import { getStoredToken } from '../utils/auth';

// Types
export interface Platform {
  socialAccount: string;
  status?: string;
}

export interface Post {
  _id: string;
  content: string;
  link?: string;
  status: string;
  platforms: Platform[];
  scheduledAt?: string;
  media?: string[];
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  link?: string;
  platforms: { socialAccount: string }[];
  scheduledAt?: string;
}

export interface UpdatePostData {
  content?: string;
  link?: string;
  platforms?: { socialAccount: string }[];
  clearMedia?: boolean;
}

export interface PostFilters {
  status?: string;
  platform?: string;
  page?: number;
  limit?: number;
}

// API calls
const API_URL = '/api/posts';

/**
 * Get posts with optional filtering
 */
export const getPosts = async (filters: PostFilters = {}): Promise<{ posts: Post[], totalCount: number }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  // Build query string
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.platform) queryParams.append('platform', filters.platform);
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.limit) queryParams.append('limit', filters.limit.toString());

  const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get posts');
  }

  const data = await response.json();
  return {
    posts: data.data,
    totalCount: data.pagination?.total || data.data.length,
  };
};

/**
 * Get a single post by ID
 */
export const getPostById = async (postId: string): Promise<Post> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/${postId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Create a new post
 */
export const createPost = async (postData: CreatePostData, mediaFiles?: File[]): Promise<Post> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  // Use FormData to handle file uploads
  const formData = new FormData();
  formData.append('content', postData.content);
  
  if (postData.link) {
    formData.append('link', postData.link);
  }
  
  formData.append('platforms', JSON.stringify(postData.platforms));
  
  if (postData.scheduledAt) {
    formData.append('scheduledAt', postData.scheduledAt);
  }
  
  // Add media files if any
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach(file => {
      formData.append('media', file);
    });
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Update a post
 */
export const updatePost = async (postId: string, updateData: UpdatePostData, mediaFiles?: File[]): Promise<Post> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  // Use FormData to handle file uploads
  const formData = new FormData();
  
  if (updateData.content !== undefined) {
    formData.append('content', updateData.content);
  }
  
  if (updateData.link !== undefined) {
    formData.append('link', updateData.link);
  }
  
  if (updateData.platforms) {
    formData.append('platforms', JSON.stringify(updateData.platforms));
  }
  
  if (updateData.clearMedia !== undefined) {
    formData.append('clearMedia', updateData.clearMedia.toString());
  }
  
  // Add media files if any
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach(file => {
      formData.append('media', file);
    });
  }

  const response = await fetch(`${API_URL}/${postId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Delete a post
 */
export const deletePost = async (postId: string): Promise<{ success: boolean }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/${postId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete post');
  }

  return response.json();
};

/**
 * Schedule a post
 */
export const schedulePost = async (postId: string, scheduledAt: string): Promise<Post> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/${postId}/schedule`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scheduledAt }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to schedule post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Publish a post immediately
 */
export const publishPost = async (postId: string): Promise<Post> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/${postId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to publish post');
  }

  const data = await response.json();
  return data.data;
}; 