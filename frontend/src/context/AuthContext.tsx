import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout, updateProfile as apiUpdateProfile, ProfileUpdateData, changePassword as apiChangePassword, ChangePasswordData } from '../api/auth';
import { isAuthenticated, getStoredToken } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated()) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Failed to get user data:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiLogin({ email, password });
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiRegister({ email, password, firstName, lastName });
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: ProfileUpdateData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiUpdateProfile(data);
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiChangePassword(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 