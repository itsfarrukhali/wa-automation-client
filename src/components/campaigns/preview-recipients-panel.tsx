// src/components/campaigns/preview-recipients-panel.tsx
"use client";

import { useEffect } from "react";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreviewRecipients } from "@/hooks/use-campaigns";
import type { CampaignTarget } from "@/lib/campaigns";

export function PreviewRecipientsPanel({ target }: { target: CampaignTarget }) {
  const preview = usePreviewRecipients();

  useEffect(() => {
    const timeout = setTimeout(() => {
      preview.mutate({ target, limit: 5 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400); // debounce so every keystroke in filters doesn't fire a request
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(target)]);

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="size-4" />
        Estimated recipients
      </div>
      {preview.isPending ? (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Calculating...
        </div>
      ) : preview.data ? (
        <>
          <p className="mt-1 text-2xl font-semibold">{preview.data.total}</p>
          {preview.data.recipients.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {preview.data.recipients.map((r) => (
                <li key={r.id}>
                  {r.name} · {r.phone}
                </li>
              ))}
              {preview.data.total > preview.data.recipients.length && (
                <li>
                  + {preview.data.total - preview.data.recipients.length} more
                </li>
              )}
            </ul>
          )}
        </>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="mt-1"
          onClick={() => preview.mutate({ target, limit: 5 })}
        >
          Calculate now
        </Button>
      )}
    </div>
  );
}
