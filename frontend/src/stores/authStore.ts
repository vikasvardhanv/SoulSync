import { create } from 'zustand';
import api from '../services/api';
import { produce } from 'immer';

// Define a user object that is not dependent on Supabase
interface User {
  id: string;
  email: string;
  name: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface Profile extends User {
  age?: number;
  bio?: string;
  location?: string;
  interests?: string[];
  photos?: string[];
  hasPremium?: boolean;
  subscription?: Subscription | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signUp: (credentials: { email: string; password: string; name: string }) => Promise<void>;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  signUp: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', credentials);
      const { user, profile } = response.data;
      set({ user, profile, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Signup failed', loading: false });
      throw error;
    }
  },

  signIn: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signin', credentials);
      const { user, profile } = response.data;
      set({ user, profile, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Signin failed', loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await api.post('/auth/signout');
      set({ user: null, profile: null, loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Signout failed', loading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/auth/me');
      if (response.data) {
        const { user, profile } = response.data;
        set({ user, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error) {
      set({ user: null, profile: null, loading: false });
    }
  },

  updateProfile: async (updates) => {
    if (!get().user) return;
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/users/${get().user!.id}`, updates);
      set(
        produce((state: AuthState) => {
          state.profile = { ...state.profile, ...response.data };
          state.loading = false;
        })
      );
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Profile update failed', loading: false });
      throw error;
    }
  },
}));

// Check auth status when the app loads
useAuthStore.getState().checkAuth(); 