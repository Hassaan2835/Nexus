import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import * as authService from '../services/authService';
import * as userService from '../services/userService';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user and token on initial load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Optionally verify token with backend
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Auth initialization failed', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<any> => {
    setIsLoading(true);
    try {
      const response = await authService.loginUser({ email, password, role });
      
      if (response.requiresTwoFactor) {
        return { requiresTwoFactor: true, email: response.email };
      }

      if (response.success) {
        const { token, user: userData } = response;
        setUser(userData);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        toast.success('Successfully logged in!');
        return { success: true };
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.registerUser({ name, email, password, role });
      
      if (response.success) {
        const { token, user: userData } = response;
        setUser(userData);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await authService.forgotPassword(email);
      toast.success('Password reset instructions sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Reset failed');
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        toast.success('Password reset successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Reset failed');
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const response = await authService.updatePassword({ currentPassword, newPassword });
      if (response.success) {
        toast.success('Password updated successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed');
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const response = await userService.updateProfile(userId, updates);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Update failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const toggle2fa = async (): Promise<void> => {
    try {
      const response = await authService.toggle2fa();
      if (response.success) {
        const updatedUser = { ...user!, isTwoFactorEnabled: response.data.isTwoFactorEnabled };
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        toast.success(`2FA ${response.data.isTwoFactorEnabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error: any) {
      toast.error('Failed to toggle 2FA');
    }
  };

  const verify2fa = async (email: string, code: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.verify2fa({ email, code });
      if (response.success) {
        const { token, user: userData } = response;
        setUser(userData);
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        toast.success('2FA Verified! Logged in.');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Verification failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    toggle2fa,
    verify2fa,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};