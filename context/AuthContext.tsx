import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api';
import { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        isAuthenticated: false,
    });

    useEffect(() => {
        // Check for existing auth on app start
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                try {
                    const response = await authService.checkAuth();
                    if (response.authenticated) {
                        const user = JSON.parse(userStr);
                        setState({
                            user,
                            token,
                            isLoading: false,
                            isAuthenticated: true,
                        });
                    } else {
                        // Clear invalid auth data
                        await AsyncStorage.removeItem('token');
                        await AsyncStorage.removeItem('user');
                        setState({
                            user: null,
                            token: null,
                            isLoading: false,
                            isAuthenticated: false,
                        });
                    }
                } catch (error) {
                    // If check fails, clear auth data
                    await AsyncStorage.removeItem('token');
                    await AsyncStorage.removeItem('user');
                    setState({
                        user: null,
                        token: null,
                        isLoading: false,
                        isAuthenticated: false,
                    });
                }
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            await AsyncStorage.setItem('token', response.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            setState({
                user: response.user,
                token: response.access_token,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            const response = await authService.register(credentials);
            await AsyncStorage.setItem('token', response.access_token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));

            setState({
                user: response.user,
                token: response.access_token,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setState({
                user: null,
                token: null,
                isLoading: false,
                isAuthenticated: false,
            });
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            await authService.verifyEmail(token);
            // Update user's email verification status
            if (state.user) {
                const updatedUser = { ...state.user, email_verified_at: new Date().toISOString() };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                setState(prev => ({ ...prev, user: updatedUser }));
            }
        } catch (error) {
            console.error('Email verification failed:', error);
            throw error;
        }
    };

    const resendVerificationEmail = async () => {
        try {
            await authService.resendVerificationEmail();
        } catch (error) {
            console.error('Resend verification email failed:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                verifyEmail,
                resendVerificationEmail,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
