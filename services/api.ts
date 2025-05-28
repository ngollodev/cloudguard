import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

// Define validation error interface to match Laravel's format
interface ValidationError {
    message: string;
    errors: {
        [key: string]: string[];
    };
    formErrors?: {
        [key: string]: string[];
    };
}

export const API_URL = 'http://192.168.1.190:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 60000, // Increase timeout to 60 seconds
});

// Request interceptor
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await AsyncStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error: Error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url} - Status: ${response.status}`);
        return response;
    },
    async (error: AxiosError<ValidationError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle network errors
        if (!error.response) {
            console.error('Network error details:', error.message, error.cause);

            // Check if it's a timeout specifically
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                return Promise.reject({
                    response: {
                        data: {
                            message: 'Request timed out. The server is taking too long to respond.'
                        }
                    }
                });
            }

            // Check if it's a connection refused error
            if (error.message.includes('Connection refused') || error.message.includes('ECONNREFUSED')) {
                return Promise.reject({
                    response: {
                        data: {
                            message: 'Connection refused. Please ensure the API server is running.'
                        }
                    }
                });
            }

            // Generic network error
            return Promise.reject({
                response: {
                    data: {
                        message: 'Network error. Please check your internet connection and that the API server is running.'
                    }
                }
            });
        }

        // Handle 401 Unauthorized errors
        if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
                    const { token } = response.data;
                    await AsyncStorage.setItem('token', token);
                    if (originalRequest) {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Token refresh error:', refreshError);
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('refreshToken');
            }
        }

        // Handle validation errors (Laravel typically returns 422 for validation)
        if (error.response.status === 422) {
            const validationErrors = error.response.data.errors;

            // Format validation errors in a user-friendly way
            if (validationErrors) {
                // Get all error messages combined
                const errorMessages = Object.values(validationErrors)
                    .flat()
                    .filter(message => typeof message === 'string');

                // Add a readable message property to the error
                error.response.data.message = errorMessages[0] || 'Validation failed';

                // Add formatted errors for each field
                error.response.data.formErrors = validationErrors;

                console.log('Validation errors:', validationErrors);
            }

            return Promise.reject(error);
        }

        // Handle other errors
        return Promise.reject(error);
    }
);

export const authService = {
    async ping(): Promise<boolean> {
        try {
            // Attempt a ping to the server to check connectivity
            const response = await axios.get(`${API_URL}/ping`, { timeout: 10000 });
            return response.status === 200;
        } catch (error) {
            console.error('Ping failed:', error);
            return false;
        }
    },

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Add device_name required by Laravel Sanctum
            const payload = {
                ...credentials,
                device_name: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device'
            };

            console.log('Login request:', JSON.stringify(payload, null, 2));

            // Try pinging the server first but don't block login if it fails
            try {
                await this.ping();
            } catch (pingError) {
                console.log('Ping attempt failed, proceeding with login anyway');
            }

            const response = await api.post<AuthResponse>('/login', payload);

            // Properly format response based on Laravel's response structure
            return {
                user: response.data.user,
                access_token: response.data.access_token || response.data.token,
                token_type: response.data.token_type || 'Bearer'
            };
        } catch (error: any) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        try {
            console.log('Starting registration with credentials:', {
                name: credentials.name,
                email: credentials.email,
                avatar: credentials.avatar ? 'avatar present' : 'no avatar'
            });

            // Format data for Laravel's registration endpoint
            const formData = new FormData();

            // Add all credentials to FormData
            Object.keys(credentials).forEach(key => {
                // Handle the avatar specially if it's a base64 string
                if (key === 'avatar' && credentials.avatar) {
                    formData.append('avatar', {
                        uri: `data:image/jpeg;base64,${credentials.avatar}`,
                        type: 'image/jpeg',
                        name: 'avatar.jpg'
                    } as any);
                } else if (key !== 'avatar') {
                    // @ts-ignore
                    formData.append(key, credentials[key]);
                }
            });

            // Add device_name required by Laravel Sanctum
            formData.append('device_name', Platform.OS === 'ios' ? 'iOS Device' : 'Android Device');

            // Add password_confirmation as required by Laravel
            if (credentials.password) {
                formData.append('password_confirmation', credentials.password_confirmation || credentials.password);
            }

            console.log('Starting registration process...');

            // Use multipart/form-data for file uploads
            const response = await api.post<AuthResponse>('/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            console.log('Registration success:', JSON.stringify(response.data, null, 2));

            // Properly format response based on Laravel's response structure
            return {
                user: response.data.user,
                access_token: response.data.access_token || response.data.token,
                token_type: response.data.token_type || 'Bearer'
            };
        } catch (error: any) {
            console.error('Registration error details:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                status: error.response?.status,
            });
            throw error;
        }
    },

    async logout(): Promise<void> {
        try {
            await api.post('/logout');
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        } catch (error: any) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    async checkAuth(): Promise<{ authenticated: boolean; user: any }> {
        try {
            const response = await api.get('/check-auth');
            return response.data;
        } catch (error: any) {
            console.error('Auth check error:', error);
            throw error;
        }
    },

    async verifyEmail(token: string): Promise<void> {
        try {
            // Create a new instance of axios without authentication
            const verifyApi = axios.create({
                baseURL: API_URL,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                timeout: 60000,
            });

            const response = await verifyApi.post('/email/verify', { token });

            // Update the user object to reflect email verification
            try {
                const userStr = await AsyncStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.email_verified_at = new Date().toISOString();
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                }
            } catch (e) {
                console.error('Failed to update user verification status:', e);
            }

            return response.data;
        } catch (error: any) {
            console.error('Email verification error:', error);
            throw error;
        }
    },

    async resendVerificationEmail(email: string): Promise<void> {
        try {
            // For resending, we might have a token or we might need to request without auth
            const response = await api.post('/email/resend', { email });
            return response.data;
        } catch (error: any) {
            console.error('Resend verification email error:', error);
            throw error;
        }
    },
};

export default api;
