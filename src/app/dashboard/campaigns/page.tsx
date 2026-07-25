// src/app/dashboard/campaigns/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCampaignAnalytics, useCampaignList } from "@/hooks/use-campaigns";
import {
  CAMPAIGN_STATUSES,
  type Campaign,
  type CampaignListParams,
  type CampaignStatus,
} from "@/lib/campaigns";
import { CampaignStatusBadge } from "@/components/campaigns/campaign-status-badge";
import { CampaignFormDialog } from "@/components/campaigns/campaign-form-dialog";
import { CampaignDetailSheet } from "@/components/campaigns/campaign-detail-sheet";
import { LaunchCampaignDialog } from "@/components/campaigns/launch-campaign-dialog";

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "">("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [launchingCampaign, setLaunchingCampaign] = useState<Campaign | null>(
    null,
  );

  const params: CampaignListParams = useMemo(
    () => ({ page, limit: 20, status: statusFilter || undefined }),
    [page, statusFilter],
  );
  const { data, isLoading, isFetching } = useCampaignList(params);
  const { data: analytics } = useCampaignAnalytics(30);

  const campaigns = data?.campaigns ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.pagination.total} total` : "Loading..."}
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New campaign
        </Button>
      </div>

      {analytics && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat label="Sent (30d)" value={analytics.totals.sent} />
          <SummaryStat
            label="Delivery rate"
            value={`${Math.round(analytics.rates.deliveryRate)}%`}
          />
          <SummaryStat
            label="Read rate"
            value={`${Math.round(analytics.rates.readRate)}%`}
          />
          <SummaryStat
            label="Revenue attributed"
            value={`Rs ${analytics.totals.revenue.toLocaleString()}`}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={statusFilter === "" ? "default" : "outline"}
          onClick={() => {
            setPage(1);
            setStatusFilter("");
          }}
        >
          All
        </Button>
        {CAMPAIGN_STATUSES.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? "default" : "outline"}
            onClick={() => {
              setPage(1);
              setStatusFilter(status);
            }}
          >
            {status}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="grid h-40 place-items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="grid h-40 place-items-center text-sm text-muted-foreground">
              No campaigns yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Targeted</TableHead>
                    <TableHead className="text-right">Sent</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow
                      key={campaign._id}
                      className="cursor-pointer"
                      onClick={() => setViewingId(campaign._id)}
                    >
                      <TableCell className="font-medium">
                        {campaign.name}
                      </TableCell>
                      <TableCell>{campaign.type.replace("_", " ")}</TableCell>
                      <TableCell>
                        <CampaignStatusBadge status={campaign.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.metrics.totalTargeted}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.metrics.sent}
                      </TableCell>
                      <TableCell>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data && data.pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t p-3 text-sm text-muted-foreground">
              <span>
                Page {data.pagination.page} of {data.pagination.pages}
                {isFetching && " · updating..."}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CampaignFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        campaign={null}
      />

      <CampaignDetailSheet
        campaignId={viewingId}
        onOpenChange={(open) => !open && setViewingId(null)}
        onLaunch={() => {
          const campaign = campaigns.find((c) => c._id === viewingId);
          if (campaign) setLaunchingCampaign(campaign);
        }}
      />

      <LaunchCampaignDialog
        campaign={launchingCampaign}
        onOpenChange={(open) => !open && setLaunchingCampaign(null)}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
