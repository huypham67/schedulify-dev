import { getStoredToken, setStoredTokens, removeStoredTokens } from '../utils/auth';

// Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// API calls
const API_URL = '/api/auth';

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
};

/**
 * Login user with email and password
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const authData = await response.json();
  
  // Store tokens
  if (authData.accessToken && authData.refreshToken) {
    setStoredTokens(authData.accessToken, authData.refreshToken);
  }

  return authData;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      removeStoredTokens();
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to get user profile');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  const token = getStoredToken();
  
  if (token) {
    try {
      await fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
  }
  
  // Always remove tokens regardless of API call result
  removeStoredTokens();
};

/**
 * Verify email with verification token
 */
export const verifyEmail = async (token: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Email verification failed');
  }

  return response.json();
};

/**
 * Request password reset
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Password reset request failed');
  }

  return response.json();
};

/**
 * Reset password with token
 */
export const resetPassword = async (token: string, password: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Password reset failed');
  }

  return response.json();
};

/**
 * Update user profile
 */
export const updateProfile = async (data: ProfileUpdateData): Promise<{ success: boolean; user: User }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Profile update failed');
  }

  return response.json();
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
  const token = getStoredToken();
  
  if (!token) {
    throw new Error('No authentication token');
  }

  const response = await fetch(`${API_URL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Password change failed');
  }

  return response.json();
}; 