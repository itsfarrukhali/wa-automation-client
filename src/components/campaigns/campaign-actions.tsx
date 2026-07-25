// src/components/campaigns/campaign-actions.tsx
"use client";

import { useState } from "react";
import { Copy, Pause, Play, Rocket, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCancelCampaign,
  useCloneCampaign,
  usePauseCampaign,
  useResumeCampaign,
} from "@/hooks/use-campaigns";
import type { Campaign } from "@/lib/campaigns";

export function CampaignActions({
  campaign,
  onLaunch,
}: {
  campaign: Campaign;
  onLaunch: () => void;
}) {
  const pauseCampaign = usePauseCampaign();
  const resumeCampaign = useResumeCampaign();
  const cancelCampaign = useCancelCampaign();
  const cloneCampaign = useCloneCampaign();
  const [cancelOpen, setCancelOpen] = useState(false);

  const canLaunch = ["draft", "scheduled"].includes(campaign.status);
  const canPause = ["scheduled", "queued", "processing", "sending"].includes(
    campaign.status,
  );
  const canResume = campaign.status === "paused";
  const canCancel = !["completed", "cancelled"].includes(campaign.status);

  return (
    <div className="flex flex-wrap gap-2">
      {canLaunch && (
        <Button size="sm" onClick={onLaunch}>
          <Rocket className="size-4" />
          Launch
        </Button>
      )}
      {canPause && (
        <Button
          size="sm"
          variant="outline"
          disabled={pauseCampaign.isPending}
          onClick={() => pauseCampaign.mutate(campaign._id)}
        >
          <Pause className="size-4" />
          Pause
        </Button>
      )}
      {canResume && (
        <Button
          size="sm"
          variant="outline"
          disabled={resumeCampaign.isPending}
          onClick={() => resumeCampaign.mutate(campaign._id)}
        >
          <Play className="size-4" />
          Resume
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={cloneCampaign.isPending}
        onClick={() => cloneCampaign.mutate({ id: campaign._id })}
      >
        <Copy className="size-4" />
        Clone
      </Button>
      {canCancel && (
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setCancelOpen(true)}
        >
          <XCircle className="size-4" />
          Cancel
        </Button>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel &quot;{campaign.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Any messages already sent stay sent. Remaining recipients
              won&apos;t be messaged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelCampaign.isPending}
              onClick={(e) => {
                e.preventDefault();
                cancelCampaign.mutate(
                  { id: campaign._id },
                  { onSuccess: () => setCancelOpen(false) },
                );
              }}
            >
              {cancelCampaign.isPending ? "Cancelling..." : "Confirm cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
