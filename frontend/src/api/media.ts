import { getStoredToken } from '../utils/auth';

// Types
export interface Media {
  _id: string;
  filename: string;
  originalFilename: string;
  mimetype: string;
  path: string;
  size: number;
  user: string;
  post?: string;
  createdAt: string;
  updatedAt: string;
}

// API calls
const API_URL = '/api/media';

/**
 * Upload a media file
 */
export const uploadMedia = async (file: File): Promise<Media> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload media');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Get media for a post
 */
export const getMediaForPost = async (postId: string): Promise<Media[]> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`/api/posts/${postId}/media`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get media for post');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Delete a media file
 */
export const deleteMedia = async (mediaId: string): Promise<{ success: boolean }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/${mediaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete media');
  }

  return response.json();
}; 