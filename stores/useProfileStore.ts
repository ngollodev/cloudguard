import { ToastType } from '@/context/ToastContext';
import api from '@/services/api';
import { User } from '@/types/auth';
import { create } from 'zustand';

interface ProfileState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name: string; email: string; phone?: string }, showToast: (message: string, type?: ToastType) => void) => Promise<void>;
  updatePassword: (data: { current_password: string; password: string; password_confirmation: string }, showToast: (message: string, type?: ToastType) => void) => Promise<void>;
  updateAvatar: (file: any, showToast: (message: string, type?: ToastType) => void) => Promise<void>;
  clearError: () => void;
}

const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/profile');
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  updateProfile: async (data, showToast) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/profile', data);
      set({ 
        user: response.data.user,
        isLoading: false 
      });
      showToast(response.data.message || 'Profile updated successfully', 'success');
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  updatePassword: async (data, showToast) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/profile/password', data);
      set({ isLoading: false });
      showToast(response.data.message || 'Password updated successfully', 'success');
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  updateAvatar: async (file, showToast) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: file.uri,
        type: file.type || 'image/jpeg',
        name: file.name || 'avatar.jpg'
      } as any);
      
      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        transformRequest: (data, headers) => {
          return data;
        },
      });
      
      set(state => ({ 
        user: state.user ? { ...state.user, avatar: response.data.avatar_url } : null,
        isLoading: false 
      }));
      showToast(response.data.message || 'Avatar updated successfully', 'success');
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message,
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useProfileStore;