// src/app/dashboard/billing/page.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useCancelSubscription,
  useDowngradeToFree,
  usePlans,
  useSubscription,
} from "@/hooks/use-billing";
import { PlanCard } from "@/components/billing/plan-card";
import { UsageMeter } from "@/components/billing/usage-meter";
import { CheckoutDialog } from "@/components/billing/checkout-dialog";
import type { PlanCatalogEntry } from "@/lib/billing";
import { ApiError } from "@/lib/api";

const STATUS_VARIANT = {
  active: "success",
  past_due: "warning",
  cancelled: "destructive",
  never_paid: "secondary",
} as const;

export default function BillingPage() {
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const cancelSubscription = useCancelSubscription();
  const downgradeToFree = useDowngradeToFree();
  const [checkoutPlan, setCheckoutPlan] = useState<PlanCatalogEntry | null>(
    null,
  );
  const [actionError, setActionError] = useState("");

  if (plansLoading || subLoading || !plans || !subscription) {
    return (
      <div className="grid h-40 place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const trialDaysLeft =
    subscription.isTrial && subscription.trialEndsAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(subscription.trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : null;

  async function handleCancel() {
    setActionError("");
    try {
      await cancelSubscription.mutateAsync();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to cancel subscription",
      );
    }
  }

  async function handleDowngrade() {
    setActionError("");
    try {
      await downgradeToFree.mutateAsync();
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "Failed to downgrade",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing &amp; plan</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and usage.
        </p>
      </div>

      {subscription.isTrial && trialDaysLeft !== null && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Trial active — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""}{" "}
          remaining. Upgrade before it ends to keep uninterrupted access.
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current usage</CardTitle>
          <Badge variant={STATUS_VARIANT[subscription.paymentStatus]}>
            {subscription.paymentStatus.replace("_", " ")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageMeter
            label="Messages this month"
            used={subscription.usage.messagesThisMonth}
            limit={subscription.limits.monthlyMessages}
            percentage={subscription.usage.percentages.messages}
          />
          <UsageMeter
            label="Staff accounts"
            used={subscription.usage.activeStaffCount}
            limit={subscription.limits.staffAccounts}
            percentage={subscription.usage.percentages.staff}
          />
          <UsageMeter
            label="Customers"
            used={subscription.usage.customerCount}
            limit={subscription.limits.customers}
            percentage={subscription.usage.percentages.customers}
          />

          {actionError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t pt-4">
            {subscription.currentPlan !== "free" &&
              subscription.paymentStatus === "active" && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  disabled={cancelSubscription.isPending}
                  onClick={handleCancel}
                >
                  {cancelSubscription.isPending
                    ? "Cancelling..."
                    : "Cancel subscription"}
                </Button>
              )}
            {subscription.currentPlan !== "free" && (
              <Button
                variant="outline"
                disabled={downgradeToFree.isPending}
                onClick={handleDowngrade}
              >
                {downgradeToFree.isPending
                  ? "Downgrading..."
                  : "Downgrade to Free"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Compare plans</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.id === subscription.currentPlan}
              onSelect={() => {
                if (plan.id === "enterprise") {
                  window.location.href =
                    "mailto:support@zario.app?subject=Enterprise%20plan%20inquiry";
                  return;
                }
                setCheckoutPlan(plan);
              }}
            />
          ))}
        </div>
      </div>

      <CheckoutDialog
        plan={checkoutPlan}
        onOpenChange={(open) => !open && setCheckoutPlan(null)}
      />
    </div>
  );
}
