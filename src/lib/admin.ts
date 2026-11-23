import { apiRequest } from "@/lib/api";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PlatformStats = {
  users: {
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  businesses: {
    total: number;
    active: number;
    inactive: number;
    onboarded: number;
    inProgress: number;
    whatsappConnected: number;
    newLast30Days: number;
  };
  plans: Record<string, number>;
  roles: Record<string, number>;
};

export type PlatformUser = {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: "superadmin" | "admin" | "owner" | "staff";
  isActive: boolean;
  isEmailVerified: boolean;
  businessId?: string | null;
  lastLoginAt?: string | null;
  createdAt: string;
};

export type PlatformBusiness = {
  _id: string;
  name: string;
  type: string;
  city?: string;
  slug?: string;
  onboardingStep: number;
  onboardingComplete: boolean;
  isActive: boolean;
  isVerified: boolean;
  plan?: { currentPlan?: string; isTrial?: boolean };
  whatsapp?: { connectionStatus?: string };
  ownerId?: { _id?: string; name?: string; email?: string } | null;
  createdAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export async function getPlatformOverview(token: string) {
  const [stats, users, businesses] = await Promise.all([
    apiRequest<ApiEnvelope<PlatformStats>>("/admin/stats", { token }),
    apiRequest<
      ApiEnvelope<{ users: PlatformUser[]; pagination: Pagination }>
    >("/admin/users?limit=8", { token }),
    apiRequest<
      ApiEnvelope<{ businesses: PlatformBusiness[]; pagination: Pagination }>
    >("/admin/businesses?limit=8", { token }),
  ]);

  return {
    stats: stats.data,
    users: users.data,
    businesses: businesses.data,
  };
}
