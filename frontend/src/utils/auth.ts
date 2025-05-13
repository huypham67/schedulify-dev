// Token storage keys
const ACCESS_TOKEN_KEY = 'schedulify_access_token';
const REFRESH_TOKEN_KEY = 'schedulify_refresh_token';

/**
 * Store authentication tokens in localStorage
 */
export const setStoredTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Get access token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Remove stored tokens from localStorage
 */
export const removeStoredTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  if (!token) return false;
  
  // Optional: Add JWT expiration check here if needed
  
  return true;
};

/**
 * Parse JWT payload without using external libraries
 */
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  
  const expirationDate = new Date(payload.exp * 1000);
  const now = new Date();
  
  return now > expirationDate;
}; 