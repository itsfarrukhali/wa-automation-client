// src/lib/campaigns.ts
import { apiRequest } from "@/lib/api";

export const CAMPAIGN_TYPES = [
  "winback",
  "birthday",
  "reminder",
  "promo",
  "review",
  "announcement",
  "seasonal",
  "follow_up",
] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_STATUSES = [
  "draft",
  "scheduled",
  "queued",
  "processing",
  "sending",
  "paused",
  "completed",
  "failed",
  "cancelled",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const TARGET_TAGS = [
  "vip",
  "new",
  "inactive",
  "regular",
  "at_risk",
  "lost",
  "all",
] as const;
export type TargetTag = (typeof TARGET_TAGS)[number];

export const CANCEL_REASONS_HINT = "Optional — shown in campaign history";

export type CampaignFilters = {
  minVisits?: number;
  maxVisits?: number;
  minSpent?: number;
  maxSpent?: number;
  lastVisitBefore?: string;
  lastVisitAfter?: string;
  gender?: "male" | "female" | "other" | "all";
  city?: string;
};

export type CampaignTarget = {
  tags?: TargetTag[];
  specificCustomers?: string[];
  excludeCustomers?: string[];
  filters?: CampaignFilters;
  estimatedRecipients?: number;
};

export type CampaignMetrics = {
  totalTargeted: number;
  eligibleRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  bounced: number;
  optedOut: number;
  responded: number;
  appointmentsBooked: number;
  revenue: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  conversionRate: number;
  cost: number;
  roi: number;
};

export type Campaign = {
  _id: string;
  name: string;
  description?: string;
  type: CampaignType;
  message: string;
  whatsappTemplate: {
    templateName: string;
    language: string;
    category: string;
  };
  target: CampaignTarget;
  status: CampaignStatus;
  scheduledAt?: string | null;
  metrics: CampaignMetrics;
  execution?: { startedAt?: string; completedAt?: string };
  tags?: string[];
  createdBy?: { _id: string; name: string; email: string };
  failureReason?: string;
  createdAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};
type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export type CampaignListParams = {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  type?: CampaignType;
  search?: string;
};

export async function listCampaigns(params: CampaignListParams, token: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{ campaigns: Campaign[]; pagination: Pagination }>
  >(`/campaigns?${query.toString()}`, { token });
  return res.data;
}

export async function getCampaign(campaignId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ campaign: Campaign }>>(
    `/campaigns/${campaignId}`,
    { token },
  );
  return res.data.campaign;
}

export type CampaignFormInput = {
  name: string;
  description?: string;
  type: CampaignType;
  message: string;
  whatsappTemplate: {
    templateName: string;
    language?: string;
    category?: string;
  };
  scheduledAt?: string;
  tags?: string[];
  target: CampaignTarget;
};

export async function createCampaign(body: CampaignFormInput, token: string) {
  const res = await apiRequest<
    ApiEnvelope<{
      campaign: Campaign;
      preview: {
        estimatedRecipients: number;
        sampleRecipients: Array<{ id: string; name: string; phone: string }>;
      };
    }>
  >("/campaigns", { method: "POST", body: JSON.stringify(body), token });
  return res.data;
}

export async function updateCampaign(
  campaignId: string,
  body: Partial<CampaignFormInput>,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<Campaign>>(
    `/campaigns/${campaignId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data;
}

export type PreviewRecipient = {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  totalVisits: number;
  totalSpent: number;
};

export async function previewCampaignRecipients(
  body: { campaignId?: string; target?: CampaignTarget; limit?: number },
  token: string,
) {
  const res = await apiRequest<
    ApiEnvelope<{ total: number; recipients: PreviewRecipient[] }>
  >("/campaigns/preview", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return res.data;
}

export type LaunchDryRunResult = {
  dryRun: true;
  totalEligible: number;
  sendable: number;
  skippedForLimit: number;
  preview: Array<{
    customerId: string;
    name: string;
    phone: string;
    message: string;
  }>;
};

export type LaunchResult = {
  dryRun: false;
  campaign: Campaign;
  totalEligible: number;
  processed: number;
  sent: number;
  failed: number;
  skippedForLimit: number;
  results: Array<{
    customerId: string;
    action: "sent" | "failed";
    reason?: string;
  }>;
};

export async function launchCampaign(
  campaignId: string,
  body: {
    dryRun?: boolean;
    allowPartial?: boolean;
    sendMode?: "text" | "template";
    limit?: number;
  },
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<LaunchDryRunResult | LaunchResult>>(
    `/campaigns/${campaignId}/launch`,
    { method: "POST", body: JSON.stringify(body), token },
  );
  return res.data;
}

export async function pauseCampaign(campaignId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<Campaign>>(
    `/campaigns/${campaignId}/pause`,
    { method: "POST", token },
  );
  return res.data;
}

export async function resumeCampaign(campaignId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<Campaign>>(
    `/campaigns/${campaignId}/resume`,
    { method: "POST", token },
  );
  return res.data;
}

export async function cancelCampaign(
  campaignId: string,
  reason: string | undefined,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<Campaign>>(
    `/campaigns/${campaignId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
      token,
    },
  );
  return res.data;
}

export async function cloneCampaign(
  campaignId: string,
  name: string | undefined,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<Campaign>>(
    `/campaigns/${campaignId}/clone`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
      token,
    },
  );
  return res.data;
}

export type CampaignAnalytics = {
  days: number;
  totals: {
    campaigns: number;
    targeted: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    revenue: number;
    cost: number;
  };
  rates: { deliveryRate: number; readRate: number; failureRate: number };
  byStatus: Record<string, number>;
  bestPerforming: Campaign | null;
};

export async function getCampaignAnalytics(days: number, token: string) {
  const res = await apiRequest<ApiEnvelope<CampaignAnalytics>>(
    `/campaigns/analytics?days=${days}`,
    { token },
  );
  return res.data;
}
