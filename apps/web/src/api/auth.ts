import apiClient from "./client";

export interface RegisterPayload {
    email: string;
    password: string;
    name: string;
}

export interface LoginPayload {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface VerifyEmailPayload {
    email: string;
    otp: string;
}

export interface ResendVerificationPayload {
    email: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    emailVerifiedAt: string | null;
    name: string;
    avatarUrl: string | null;
    status: string;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    user: User;
}

export interface RegisterResponse {
    message: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export interface MessageResponse {
    message: string;
}

export const register = async (
    payload: RegisterPayload,
) => {
    const response =
        await apiClient.post<RegisterResponse>(
            "/auth/register",
            payload,
        );

    return response.data;
};

export const verifyEmail = async (
    payload: VerifyEmailPayload,
) => {
    const response =
        await apiClient.post<MessageResponse>(
            "/auth/verify-email",
            payload,
        );

    return response.data;
};

export const resendVerification = async (
    payload: ResendVerificationPayload,
) => {
    const response =
        await apiClient.post<MessageResponse>(
            "/auth/resend-verification",
            payload,
        );

    return response.data;
};

export const login = async (
    payload: LoginPayload,
) => {
    const response =
        await apiClient.post<AuthResponse>(
            "/auth/login",
            payload,
        );

    return response.data;
};

export const getMe = async () => {
    const response =
        await apiClient.get<AuthResponse>(
            "/auth/me",
        );

    return response.data;
};

export const forgotPassword = async (
    payload: ForgotPasswordPayload,
) => {
    const response =
        await apiClient.post<MessageResponse>(
            "/auth/forgot-password",
            payload,
        );

    return response.data;
};

export const resetPassword = async (
    payload: ResetPasswordPayload,
) => {
    const response =
        await apiClient.post<MessageResponse>(
            "/auth/reset-password",
            payload,
        );

    return response.data;
};