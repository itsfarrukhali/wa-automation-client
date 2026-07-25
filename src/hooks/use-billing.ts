// src/hooks/use-billing.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  cancelSubscription,
  confirmManualPayment,
  createCheckoutIntent,
  downgradeToFree,
  getSubscription,
  listPlans,
  type PaymentMethod,
  type PlanId,
} from "@/lib/billing";

const KEY = "billing";

export function usePlans() {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "plans"],
    queryFn: () => listPlans(token as string),
    enabled: Boolean(token),
    staleTime: 60 * 60 * 1000, // plan catalog rarely changes
  });
}

export function useSubscription() {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "subscription"],
    queryFn: () => getSubscription(token as string),
    enabled: Boolean(token),
  });
}

function useInvalidateBilling() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: [KEY, "subscription"] });
}

export function useCreateCheckoutIntent() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({
      plan,
      paymentMethod,
    }: {
      plan: PlanId;
      paymentMethod: PaymentMethod;
    }) => createCheckoutIntent(plan, paymentMethod, token as string),
  });
}

export function useConfirmManualPayment() {
  const { token } = useAuth();
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: (body: {
      plan: PlanId;
      paymentMethod: PaymentMethod;
      reference?: string;
      amount?: number;
    }) => confirmManualPayment(body, token as string),
    onSuccess: invalidate,
  });
}

export function useCancelSubscription() {
  const { token } = useAuth();
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => cancelSubscription(token as string),
    onSuccess: invalidate,
  });
}

export function useDowngradeToFree() {
  const { token } = useAuth();
  const invalidate = useInvalidateBilling();
  return useMutation({
    mutationFn: () => downgradeToFree(token as string),
    onSuccess: invalidate,
  });
}
