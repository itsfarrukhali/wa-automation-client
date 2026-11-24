// src/lib/business.ts
import { apiRequest } from "@/lib/api";

export type OnboardingStep = {
  step: number;
  label: string;
  completed: boolean;
  current: boolean;
};

export type OnboardingStatus = {
  onboardingComplete: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  businessId: string;
  businessName: string;
  businessType: string;
};

export type DashboardStats = {
  business: {
    id: string;
    name: string;
    type: string;
    isOpenNow: boolean;
    onboardingComplete: boolean;
    whatsappConnected: boolean;
  };
  plan?: {
    current: string;
    isTrial: boolean;
    trialEndsAt?: string;
    messagesUsed: number;
    messagesLimit: number;
  };
  customers: { total: number; active: number; inactive: number };
  bookings: { today: number; pending: number; completed: number };
  messages: {
    total: number;
    thisMonth: number;
    delivered: number;
    failed: number;
  };
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function getOnboardingStatus(token: string) {
  const res = await apiRequest<ApiEnvelope<OnboardingStatus>>(
    "/business/onboarding/status",
    { token },
  );
  return res.data;
}

export async function getDashboardStats(token: string) {
  const res = await apiRequest<ApiEnvelope<DashboardStats>>(
    "/business/dashboard",
    { token },
  );
  return res.data;
}

export async function patchOnboardingStep(
  step: 1 | 2 | 3 | 4 | 5,
  body: Record<string, unknown>,
  token: string,
) {
  const res = await apiRequest<
    ApiEnvelope<{ business: unknown; nextStep?: number }>
  >(`/business/onboarding/step-${step}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token,
  });
  return res.data;
}
