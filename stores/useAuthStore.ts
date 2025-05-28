import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { authService } from '../services/api';
import { LoginCredentials, RegisterCredentials, User } from '../types/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    clearError: () => void;
    resetPassword: (data: { email: string }) => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,

    login: async (credentials: LoginCredentials) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authService.login(credentials);

            // Store token and user data
            await AsyncStorage.setItem('token', response.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.access_token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Login error:', error);
            set({
                error: error.response?.data?.message || 'Login failed. Please try again.',
                isLoading: false,
                isAuthenticated: false,
            });
            throw error;
        }
    },

    register: async (credentials: RegisterCredentials) => {
        try {
            set({ isLoading: true, error: null });
            const response = await authService.register(credentials);

            // Store token and user data
            await AsyncStorage.setItem('token', response.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            set({
                user: response.user,
                token: response.access_token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Registration error:', error);
            set({
                error: error.response?.data?.message || 'Registration failed. Please try again.',
                isLoading: false,
                isAuthenticated: false,
            });
            throw error;
        }
    },

    logout: async () => {
        try {
            set({ isLoading: true, error: null });
            await authService.logout();

            // Clear stored data
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');

            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error: any) {
            console.error('Logout error:', error);
            set({
                error: error.response?.data?.message || 'Logout failed. Please try again.',
                isLoading: false,
            });
            throw error;
        }
    },

    checkAuth: async () => {
        // Don't set loading if we're already loading
        if (get().isLoading) return;

        try {
            set({ isLoading: true, error: null });
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (!token || !userStr) {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
                return;
            }

            try {
                const user = JSON.parse(userStr);
                const response = await authService.checkAuth();

                if (response.authenticated) {
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    // Clear invalid auth data
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                // Clear invalid user data
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error: any) {
            console.error('Auth check error:', error);
            // Clear potentially invalid auth data
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            set({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: error.response?.data?.message || 'Authentication check failed.',
            });
        }
    },

    resetPassword: async (data: { email: string }) => {
        try {
            set({ isLoading: true, error: null });
            await authService.resetPassword(data);
            set({ isLoading: false });
        } catch (error: any) {
            console.error('Reset password error:', error);
            set({
                error: error.response?.data?.message || 'Failed to send reset email. Please try again.',
                isLoading: false,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
