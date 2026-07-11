// src/components/templates/template-status-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { TemplateStatus } from "@/lib/templates";

const VARIANT_MAP: Record<
  TemplateStatus,
  "success" | "warning" | "destructive" | "secondary"
> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
  DISABLED: "secondary",
};

export function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{status}</Badge>;
}
