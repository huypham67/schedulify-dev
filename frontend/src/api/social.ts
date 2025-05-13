import { getStoredToken } from '../utils/auth';

// Types
export interface SocialAccount {
  _id: string;
  platform: string;
  platformUserId: string;
  accountName: string;
  accountType: string;
  isActive: boolean;
}

// API calls
const API_URL = '/api/social';

/**
 * Get user's connected social accounts
 */
export const getUserAccounts = async (): Promise<SocialAccount[]> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/accounts`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get social accounts');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Initialize Facebook connection
 * Returns the URL to redirect the user to
 */
export const initFacebookConnect = async (): Promise<{ redirectUrl: string }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/connect/facebook`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to initialize Facebook connection');
  }

  return response.json();
};

/**
 * Complete Facebook connection after OAuth
 */
export interface FacebookConnectionData {
  authCode: string;
  state: string;
}

export const completeFacebookConnection = async (data: FacebookConnectionData): Promise<{ success: boolean }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/connect/facebook/callback/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to complete Facebook connection');
  }

  return response.json();
};

/**
 * Disconnect a social account
 */
export const disconnectAccount = async (accountId: string): Promise<{ success: boolean }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/accounts/${accountId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to disconnect account');
  }

  return response.json();
}; 