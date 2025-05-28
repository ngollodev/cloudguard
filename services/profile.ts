import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

export interface ProfileResponse {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    email_verified_at: string | null;
  };
  is_email_verified: boolean;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export const profileService = {
  async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await axios.get<ProfileResponse>(`${API_URL}/profile`);
      return response.data;
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<void> {
    try {
      await axios.put(`${API_URL}/profile`, data);
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  },

  async updatePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> {
    try {
      await axios.put(`${API_URL}/profile/password`, data);
    } catch (error: any) {
      console.error('Password update error:', error);
      throw error;
    }
  },

  async updateAvatar(file: any): Promise<ProfileResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Avatar update error:', error);
      throw error;
    }
  }
}
