// src/lib/templates.ts
import { apiRequest } from "@/lib/api";

export type TemplateCategory =
  | "UTILITY"
  | "MARKETING"
  | "AUTHENTICATION"
  | "ALERT_UPDATE"
  | "TRANSACTIONAL"
  | "OTP"
  | "OTHER";
export type TemplateStatus = "PENDING" | "APPROVED" | "REJECTED" | "DISABLED";

export type Template = {
  id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  status: TemplateStatus;
  components: unknown[];
  usageCount: number;
  lastUsed?: string;
};

export type TemplateSource = {
  wabaIdSuffix: string | null;
  displayPhoneNumber: string | null;
  verifiedName: string | null;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function listTemplates(token: string) {
  const res = await apiRequest<
    ApiEnvelope<{
      templates: Template[];
      total: number;
      source: TemplateSource;
    }>
  >("/whatsapp/templates", { token });
  return res.data;
}

export async function syncTemplatesFromMeta(token: string) {
  const res = await apiRequest<
    ApiEnvelope<{
      synced: number;
      created: number;
      updated: number;
      removed: number;
      source: TemplateSource;
      templates: Template[];
    }>
  >("/whatsapp/templates/sync", { method: "POST", token });
  return res.data;
}
