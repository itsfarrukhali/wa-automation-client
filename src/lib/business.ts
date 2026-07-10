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

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function getOnboardingStatus(token: string) {
  const res = await apiRequest<ApiEnvelope<OnboardingStatus>>(
    "/business/onboarding/status",
    { token },
  );
  return res.data;
}

export async function getDashboardStats(token: string) {
  const res = await apiRequest<ApiEnvelope<Record<string, unknown>>>(
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
