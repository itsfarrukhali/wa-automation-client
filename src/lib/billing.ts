// src/lib/billing.ts
import { apiRequest } from "@/lib/api";

export const PLAN_IDS = ["free", "starter", "growth", "enterprise"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

// Real payment methods the SERVICE layer accepts — deliberately excludes
// "manual", which the validator allows but billing.service.js rejects.
export const PAYMENT_METHODS = [
  "jazzcash",
  "easypaisa",
  "card",
  "bank_transfer",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type PlanLimits = {
  monthlyMessages: number;
  staffAccounts: number;
  customers: number;
  templates: number;
  campaigns: number;
  automationRules: number;
  reportsHistory: number;
};

export type PlanCatalogEntry = {
  id: PlanId;
  name: string;
  monthlyPrice: number | null;
  currency: string;
  limits: PlanLimits;
};

export type Subscription = {
  currentPlan: PlanId;
  isTrial: boolean;
  trialEndsAt?: string;
  startedAt?: string;
  expiresAt?: string | null;
  paymentStatus: "active" | "past_due" | "cancelled" | "never_paid";
  paymentMethod: PaymentMethod | "none";
  lastPaymentAt?: string;
  nextBillingAt?: string;
  amount?: number;
  currency: string;
  limits: PlanLimits;
  usage: {
    messagesThisMonth: number;
    activeStaffCount: number;
    customerCount: number;
    messagesResetAt?: string;
    percentages: { messages: number; staff: number; customers: number };
  };
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function listPlans(token: string) {
  const res = await apiRequest<ApiEnvelope<{ plans: PlanCatalogEntry[] }>>(
    "/billing/plans",
    { token },
  );
  return res.data.plans;
}

export async function getSubscription(token: string) {
  const res = await apiRequest<ApiEnvelope<Subscription>>(
    "/billing/subscription",
    { token },
  );
  return res.data;
}

export type CheckoutIntent = {
  checkoutId: string;
  mode: string;
  plan: PlanId;
  amount: number | null;
  currency: string;
  paymentMethod: PaymentMethod;
  status: "pending";
  instructions: string;
};

export async function createCheckoutIntent(
  plan: PlanId,
  paymentMethod: PaymentMethod,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<CheckoutIntent>>(
    "/billing/checkout-intent",
    {
      method: "POST",
      body: JSON.stringify({ plan, paymentMethod }),
      token,
    },
  );
  return res.data;
}

export async function confirmManualPayment(
  body: {
    plan: PlanId;
    paymentMethod: PaymentMethod;
    reference?: string;
    amount?: number;
  },
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<Subscription>>(
    "/billing/manual-payment",
    {
      method: "POST",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data;
}

export async function cancelSubscription(token: string) {
  const res = await apiRequest<ApiEnvelope<Subscription>>("/billing/cancel", {
    method: "POST",
    token,
  });
  return res.data;
}

export async function downgradeToFree(token: string) {
  const res = await apiRequest<ApiEnvelope<Subscription>>(
    "/billing/downgrade-free",
    { method: "POST", token },
  );
  return res.data;
}
