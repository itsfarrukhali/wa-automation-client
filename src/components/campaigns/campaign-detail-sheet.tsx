// src/components/campaigns/campaign-detail-sheet.tsx
"use client";

import { Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useCampaign } from "@/hooks/use-campaigns";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { CampaignActions } from "@/components/campaigns/campaign-actions";

export function CampaignDetailSheet({
  campaignId,
  onOpenChange,
  onLaunch,
}: {
  campaignId: string | null;
  onOpenChange: (open: boolean) => void;
  onLaunch: () => void;
}) {
  const { data: campaign, isLoading } = useCampaign(campaignId);

  return (
    <Sheet open={Boolean(campaignId)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !campaign ? (
          <div className="grid h-full place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{campaign.name}</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-4 px-4 pb-6">
              <div className="flex items-center gap-2">
                <CampaignStatusBadge status={campaign.status} />
                <span className="text-xs text-muted-foreground">
                  {campaign.type.replace("_", " ")}
                </span>
              </div>

              <CampaignActions campaign={campaign} onLaunch={onLaunch} />

              {campaign.metrics.totalTargeted > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="text-muted-foreground">
                      {campaign.metrics.sent} / {campaign.metrics.totalTargeted}
                    </span>
                  </div>
                  <Progress
                    className="mt-1.5"
                    value={
                      (campaign.metrics.sent / campaign.metrics.totalTargeted) *
                      100
                    }
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 text-center">
                <StatBox
                  label="Delivered"
                  value={`${Math.round(campaign.metrics.deliveryRate)}%`}
                />
                <StatBox
                  label="Read"
                  value={`${Math.round(campaign.metrics.readRate)}%`}
                />
                <StatBox label="Failed" value={campaign.metrics.failed} />
              </div>

              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium">Message</div>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                  {campaign.message}
                </p>
              </div>

              {campaign.failureReason && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {campaign.failureReason}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-2.5">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
