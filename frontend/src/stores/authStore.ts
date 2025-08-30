// frontend/src/stores/authStore.ts
import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  bio?: string;
  location?: string;
  interests?: string[];
  photos?: string[];
  isVerified?: boolean;
  isActive?: boolean;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  signUp: (credentials: {
    email: string;
    password: string;
    name: string;
    age: number;
    bio?: string;
    location?: string;
    interests?: string[];
    photos?: string[];
  }) => Promise<void>;
  
  signIn: (credentials: { 
    email: string; 
    password: string; 
  }) => Promise<void>;
  
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, userId: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  clearError: () => void;
  
  // Token management
  refreshToken: () => Promise<boolean>;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  signUp: async (credentials) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.register(credentials);
      
      if (response.data.success) {
        // Store tokens if provided
        const tokens = response.data.data?.tokens;
        if (tokens?.accessToken) {
          localStorage.setItem('accessToken', tokens.accessToken);
        }
        if (tokens?.refreshToken) {
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        
        const userData = response.data.data.user;
        set({ 
          user: userData, 
          loading: false, 
          isAuthenticated: true,
          error: null 
        });
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Signup failed. Please try again.';
      
      set({ 
        error: errorMessage,
        loading: false,
        user: null,
        isAuthenticated: false
      });
      
      throw error;
    }
  },

  signIn: async (credentials) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        // Store tokens
        const tokens = response.data.data.tokens;
        if (tokens?.accessToken && tokens?.refreshToken) {
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
        }
        
        const userData = response.data.data.user;
        set({ 
          user: userData, 
          loading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please check your credentials.';
      
      set({ 
        error: errorMessage,
        loading: false,
        user: null,
        isAuthenticated: false
      });
      
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authAPI.logout({ refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null, 
        loading: false,
        isAuthenticated: false,
        error: null
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      set({ 
        user: null, 
        loading: false,
        isAuthenticated: false 
      });
      return;
    }

    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.getMe();
      
      if (response.data.success) {
        const userData = response.data.data.user;
        
        set({ 
          user: userData, 
          loading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
      
      // If it's a 401 error, try to refresh the token
      if (error.response?.status === 401) {
        const refreshSuccess = await get().refreshToken();
        
        if (refreshSuccess) {
          // Retry auth check after successful refresh
          try {
            const retryResponse = await authAPI.getMe();
            if (retryResponse.data.success) {
              const userData = retryResponse.data.data.user;
              set({ 
                user: userData, 
                loading: false,
                isAuthenticated: true,
                error: null
              });
              return;
            }
          } catch (retryError) {
            console.error('Retry auth check failed:', retryError);
          }
        }
      }
      
      // Clear invalid tokens and user data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null, 
        loading: false,
        isAuthenticated: false,
        error: null
      });
    }
  },

  updateProfile: async (updates) => {
    const currentUser = get().user;
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.updateProfile(updates);
      
      if (response?.data.success) {
        const updatedUser = { ...currentUser, ...response.data.data.user };
        
        set({ 
          user: updatedUser, 
          loading: false,
          error: null
        });
      } else {
        throw new Error(response?.data.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Profile update failed';
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.verifyEmail(token);
      
      if (response.data.success) {
        // Update user verification status if user is logged in
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, isVerified: true },
            loading: false,
            error: null
          });
        } else {
          set({ loading: false, error: null });
        }
      } else {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Email verification failed';
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  },

  resendVerification: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.resendVerification();
      
      if (response.data.success) {
        set({ loading: false, error: null });
      } else {
        throw new Error(response.data.message || 'Failed to resend verification email');
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to resend verification email';
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.forgotPassword({ email });
      
      if (response.data.success) {
        set({ loading: false, error: null });
      } else {
        throw new Error(response.data.message || 'Failed to send reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to send reset email';
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  },

  resetPassword: async (token: string, userId: string, newPassword: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.resetPassword({ token, userId, newPassword });
      
      if (response.data.success) {
        set({ loading: false, error: null });
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Password reset failed';
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await authAPI.changePassword({ currentPassword, newPassword });
      
      if (response.data.success) {
        set({ loading: false, error: null });
      } else {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Password change failed';
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw error;
    }
  },

  refreshToken: async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await authAPI.refreshToken({ refreshToken });
      
      if (response.data.success) {
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        return true;
      } else {
        return false;
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      
      // Clear invalid refresh token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      set({ 
        user: null,
        isAuthenticated: false,
        error: null
      });
      
      return false;
    }
  },

  isTokenValid: (): boolean => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      // Basic token validation (you might want to decode JWT and check expiry)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      
      // You can add more sophisticated validation here
      // For now, just check if token exists and has proper format
      return true;
    } catch {
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Initialize auth check when the store is created
let isInitialized = false;

if (!isInitialized) {
  isInitialized = true;
  
  // Check auth status when the app loads
  setTimeout(() => {
    useAuthStore.getState().checkAuth();
  }, 100);
}

export default useAuthStore;