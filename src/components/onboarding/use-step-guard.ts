// src/components/onboarding/use-step-guard.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";

/**
 * Blocks visiting /onboarding/step-N directly via URL when the business
 * hasn't reached step N yet — mirrors the backend's assertStepOrder check
 * (business.service.js) so the frontend and backend never disagree.
 */
export function useStepGuard(stepNumber: number) {
  const { status } = useOnboarding();
  const router = useRouter();

  useEffect(() => {
    if (stepNumber > status.currentStep) {
      router.replace(`/onboarding/step-${status.currentStep}`);
    }
  }, [stepNumber, status.currentStep, router]);
}
