// src/components/billing/plan-card.tsx
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlanCatalogEntry } from "@/lib/billing";
import { cn } from "@/lib/utils";

const LIMIT_LABELS: Record<keyof PlanCatalogEntry["limits"], string> = {
  monthlyMessages: "WhatsApp messages / month",
  staffAccounts: "Staff accounts",
  customers: "Customers",
  templates: "Message templates",
  campaigns: "Active campaigns",
  automationRules: "Automation rules",
  reportsHistory: "Reports history (days)",
};

function formatLimit(value: number) {
  return value === -1 ? "Unlimited" : value.toLocaleString();
}

export function PlanCard({
  plan,
  isCurrent,
  onSelect,
}: {
  plan: PlanCatalogEntry;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const isEnterprise = plan.id === "enterprise";
  const isFree = plan.id === "free";

  return (
    <Card className={cn(isCurrent && "border-primary ring-1 ring-primary")}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          {isCurrent && <Badge>Current plan</Badge>}
        </div>
        <div className="mt-2">
          {isEnterprise ? (
            <span className="text-2xl font-semibold">Custom</span>
          ) : (
            <>
              <span className="text-2xl font-semibold">
                Rs {plan.monthlyPrice?.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-1.5 text-sm">
          {(
            Object.keys(LIMIT_LABELS) as Array<keyof PlanCatalogEntry["limits"]>
          ).map((key) => (
            <li key={key} className="flex items-center gap-2">
              <Check className="size-3.5 shrink-0 text-primary" />
              <span>
                {formatLimit(plan.limits[key])} {LIMIT_LABELS[key]}
              </span>
            </li>
          ))}
        </ul>

        <Button
          className="w-full"
          variant={isCurrent ? "outline" : "default"}
          disabled={isCurrent || isFree}
          onClick={onSelect}
        >
          {isCurrent
            ? "Current plan"
            : isFree
              ? "Included by default"
              : isEnterprise
                ? "Contact sales"
                : "Upgrade"}
        </Button>
      </CardContent>
    </Card>
  );
}
