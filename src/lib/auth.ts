// src/lib/auth.ts
import { apiRequest } from "@/lib/api";

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "superadmin" | "admin" | "owner" | "staff";
  businessId: string | null;
  isEmailVerified: boolean;
};

export type AuthPayload = {
  accessToken: string;
  user: AuthUser;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type SignupPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  businessName: string;
  businessType: string;
  consentToDataProcessing: boolean;
};

export async function login(payload: { email: string; password: string }) {
  const response = await apiRequest<ApiEnvelope<AuthPayload>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function signup(payload: SignupPayload) {
  const response = await apiRequest<ApiEnvelope<AuthPayload>>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
  return response.data;
}

export async function fetchMe(token: string) {
  const response = await apiRequest<ApiEnvelope<{ user: AuthUser }>>(
    "/auth/me",
    {
      token,
    },
  );
  return response.data.user;
}

export async function refreshAccessToken() {
  // Cookie-based (httpOnly refreshToken cookie sent automatically via credentials: "include")
  const response = await apiRequest<ApiEnvelope<{ accessToken: string }>>(
    "/auth/refresh",
    { method: "POST" },
  );
  return response.data.accessToken;
}

export async function resendVerification(token: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(
    "/auth/resend-verification",
    { method: "POST", token },
  );
  return response.message;
}

export async function forgotPassword(email: string) {
  const response = await apiRequest<ApiEnvelope<unknown>>(
    "/auth/forgot-password",
    { method: "POST", body: JSON.stringify({ email }) },
  );
  return response.message;
}

export async function resetPassword(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const response = await apiRequest<ApiEnvelope<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.message;
}

export async function verifyEmail(token: string) {
  return apiRequest<ApiEnvelope<{ user: AuthUser }>>(
    `/auth/verify-email/${token}`,
  );
}

export async function logout(token?: string | null) {
  await apiRequest("/auth/logout", {
    method: "POST",
    token: token ?? undefined,
  });
}
