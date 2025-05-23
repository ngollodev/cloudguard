import { create } from 'zustand';
import { AuthState, LoginCredentials, RegisterData, ResetPasswordData } from '../types/auth';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Mock API for demonstration purposes
const mockLogin = async (credentials: LoginCredentials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          id: 1,
          name: 'ngollo.dev',
          email: credentials.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        token: 'mock-token-12345',
      });
    }, 1000);
  });
};

// For web platform use localStorage as a fallback since SecureStore is not available
const secureStorage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  checkAuth: () => Promise<void>;
}

interface UpdateProfileData {
  [key: string]: any;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UseAuthStoreActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}

const useAuthStore = create<AuthState & UseAuthStoreActions>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (credentials: LoginCredentials): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await mockLogin(credentials);
      const { user, token } = response;
      
      await secureStorage.setItem('auth_token', token);
      await secureStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        token, 
        isLoading: false, 
        isAuthenticated: true 
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to login' 
      });
    }
  },

  register: async (data: RegisterData): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Mock registration success
      set({ isLoading: false });
      // After registration, we'd typically log the user in
      await get().login({ email: data.email, password: data.password });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to register' 
      });
    }
  },

  logout: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      await secureStorage.removeItem('auth_token');
      await secureStorage.removeItem('user');
      set({ 
        user: null, 
        token: null, 
        isLoading: false, 
        isAuthenticated: false 
      });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to logout' 
      });
    }
  },

  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Mock password reset success
      setTimeout(() => {
        set({ isLoading: false });
      }, 1000);
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to reset password' 
      });
    }
  },

  checkAuth: async (): Promise<void> => {
    set({ isLoading: true });
    try {
      const token = await secureStorage.getItem('auth_token');
      const userString = await secureStorage.getItem('user');
      
      if (token && userString) {
        const user = JSON.parse(userString);
        set({ 
          user, 
          token, 
          isLoading: false, 
          isAuthenticated: true 
        });
      } else {
        set({ 
          user: null, 
          token: null, 
          isLoading: false, 
          isAuthenticated: false 
        });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        isAuthenticated: false 
      });
    }
  },
  updateProfile: async (data: UpdateProfileData): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const user = { ...get().user, ...data };
      await secureStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to update profile' 
      });
    }
  },
  changePassword: async (data: ChangePasswordData ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      // Mock password change success
      setTimeout(() => {
        set({ isLoading: false });
      }, 1000);
    } catch (error: any) {
      set({ 
        isLoading: false, 
        error: error.message || 'Failed to change password' 
      });
    }
  }
}));

export default useAuthStore;