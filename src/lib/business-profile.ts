import { apiRequest } from "@/lib/api";

export type WorkingHoursDay = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type BusinessProfile = {
  _id: string;
  name: string;
  phone?: string;
  landline?: string;
  email?: string;
  timezone: string;
  workingHours: WorkingHoursDay[];
  settings?: {
    notifications?: {
      email?: boolean;
      whatsapp?: boolean;
    };
    language?: "en" | "ur";
    currency?: string;
  };
  engagement?: {
    reminderTime?: number;
    followUpDays?: number;
    winbackDays?: number;
    reviewRequestEnabled?: boolean;
    reviewPlatform?: "google" | "facebook" | "custom";
  };
  whatsapp?: {
    phoneNumberId?: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
    connectionStatus?: string;
    qualityRating?: string;
  };
};

export type WhatsAppConnectionStatus = {
  health:
    | "healthy"
    | "invalid"
    | "degraded"
    | "unreachable"
    | "not_configured";
  connectionStatus: string;
  tokenValid: boolean | null;
  credentialsStored: boolean;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
  qualityRating: string;
  wabaIdSuffix: string | null;
  lastConnectedAt: string | null;
  tokenExpiresAt: string | null;
  error?: string;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function getMyBusinessProfile(token: string) {
  const res = await apiRequest<ApiEnvelope<{ business: BusinessProfile }>>(
    "/business/me",
    { token },
  );
  return res.data.business;
}

async function updateBusiness(
  path: string,
  body: Record<string, unknown>,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ business: BusinessProfile }>>(
    path,
    { method: "PATCH", body: JSON.stringify(body), token },
  );
  return res.data.business;
}

export function updateBusinessProfile(
  body: { name: string; phone?: string; landline?: string; email?: string },
  token: string,
) {
  return updateBusiness("/business/profile", body, token);
}

export function updateBusinessSettings(
  body: {
    notifications: { email: boolean; whatsapp: boolean };
    language: "en" | "ur";
    currency: string;
  },
  token: string,
) {
  return updateBusiness("/business/settings", body, token);
}

export function updateWorkingHoursDay(
  day: WorkingHoursDay["day"],
  body: Pick<WorkingHoursDay, "isOpen" | "openTime" | "closeTime">,
  token: string,
) {
  return updateBusiness(`/business/working-hours/${day}`, body, token);
}

export function updateBusinessEngagement(
  body: {
    reminderTime: number;
    followUpDays: number;
    winbackDays: number;
    reviewRequestEnabled: boolean;
    reviewPlatform: "google" | "facebook" | "custom";
  },
  token: string,
) {
  return updateBusiness("/business/engagement", body, token);
}

export async function reconnectWhatsApp(
  body: { phoneNumberId: string; wabaId: string; accessToken: string },
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ business: BusinessProfile }>>(
    "/business/whatsapp/reconnect",
    { method: "PATCH", body: JSON.stringify(body), token },
  );
  return res.data.business;
}

export async function getWhatsAppConnectionStatus(token: string) {
  const res = await apiRequest<ApiEnvelope<WhatsAppConnectionStatus>>(
    "/business/whatsapp/status",
    { token },
  );
  return res.data;
}
