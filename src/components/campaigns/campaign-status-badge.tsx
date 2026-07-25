// src/components/campaigns/campaign-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { CampaignStatus } from "@/lib/campaigns";

const VARIANT_MAP: Record<
  CampaignStatus,
  "success" | "warning" | "destructive" | "secondary" | "default"
> = {
  draft: "secondary",
  scheduled: "warning",
  queued: "warning",
  processing: "default",
  sending: "default",
  paused: "secondary",
  completed: "success",
  failed: "destructive",
  cancelled: "destructive",
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{status}</Badge>;
}
