export interface User {
    id: number;
    email: string;
    name: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    device_name: string;
} 