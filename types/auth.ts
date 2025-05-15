export interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }
  
  export interface AuthResponse {
    user: User;
    token: string;
  }
  
  export interface ResetPasswordData {
    email: string;
  }