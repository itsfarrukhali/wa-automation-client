// src/components/campaigns/launch-campaign-dialog.tsx
"use client";

import { useState } from "react";
import { Loader2, Rocket } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLaunchCampaign } from "@/hooks/use-campaigns";
import { ApiError } from "@/lib/api";
import type { Campaign, LaunchDryRunResult } from "@/lib/campaigns";

export function LaunchCampaignDialog({
  campaign,
  onOpenChange,
}: {
  campaign: Campaign | null;
  onOpenChange: (open: boolean) => void;
}) {
  const launchCampaign = useLaunchCampaign();
  const [dryRunResult, setDryRunResult] = useState<LaunchDryRunResult | null>(
    null,
  );
  const [error, setError] = useState("");

  async function runDryRun() {
    if (!campaign) return;
    setError("");
    try {
      const result = await launchCampaign.mutateAsync({
        id: campaign._id,
        body: { dryRun: true },
      });
      if (result.dryRun) setDryRunResult(result);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to preview launch",
      );
    }
  }

  async function confirmLaunch() {
    if (!campaign) return;
    setError("");
    try {
      await launchCampaign.mutateAsync({
        id: campaign._id,
        body: { dryRun: false, allowPartial: true },
      });
      handleClose();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to launch campaign",
      );
    }
  }

  function handleClose() {
    setDryRunResult(null);
    setError("");
    onOpenChange(false);
  }

  return (
    <Dialog
      open={Boolean(campaign)}
      onOpenChange={(open) => !open && handleClose()}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Launch &quot;{campaign?.name}&quot;</DialogTitle>
        </DialogHeader>

        {!dryRunResult ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We&apos;ll first show you exactly who will receive this and how
              many messages count against your monthly limit — nothing sends
              yet.
            </p>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              className="w-full"
              onClick={runDryRun}
              disabled={launchCampaign.isPending}
            >
              {launchCampaign.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Rocket className="size-4" />
              )}
              Preview launch
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <StatBox label="Eligible" value={dryRunResult.totalEligible} />
              <StatBox label="Will send" value={dryRunResult.sendable} />
              <StatBox
                label="Skipped (limit)"
                value={dryRunResult.skippedForLimit}
                warn={dryRunResult.skippedForLimit > 0}
              />
            </div>

            {dryRunResult.skippedForLimit > 0 && (
              <Badge variant="warning" className="w-full justify-center py-1.5">
                {dryRunResult.skippedForLimit} recipients will be skipped —
                monthly message limit reached
              </Badge>
            )}

            <div className="max-h-40 overflow-y-auto rounded-md border p-2 text-xs">
              {dryRunResult.preview.slice(0, 5).map((p) => (
                <div
                  key={p.customerId}
                  className="border-b py-1.5 last:border-0"
                >
                  <div className="font-medium">
                    {p.name} · {p.phone}
                  </div>
                  <div className="text-muted-foreground line-clamp-1">
                    {p.message}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {dryRunResult && (
            <Button
              onClick={confirmLaunch}
              disabled={launchCampaign.isPending || dryRunResult.sendable === 0}
            >
              {launchCampaign.isPending
                ? "Sending..."
                : `Send to ${dryRunResult.sendable} customers`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatBox({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-2.5 ${warn ? "border-amber-300 bg-amber-50" : ""}`}
    >
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
