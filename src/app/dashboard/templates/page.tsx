// src/app/dashboard/templates/page.tsx
"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
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
import { useSyncTemplates, useTemplateList } from "@/hooks/use-templates";
import { TemplateStatusBadge } from "@/components/templates/template-status-badge";
import { ApiError } from "@/lib/api";

export default function TemplatesPage() {
  const { data, isLoading } = useTemplateList();
  const syncTemplates = useSyncTemplates();
  const [syncError, setSyncError] = useState("");
  const [syncSummary, setSyncSummary] = useState("");

  const templates = data?.templates ?? [];

  async function handleSync() {
    setSyncError("");
    setSyncSummary("");
    try {
      const result = await syncTemplates.mutateAsync();
      setSyncSummary(
        `Synced ${result.synced} from Meta: ${result.created} added, ${result.updated} updated, ${result.removed} removed.`,
      );
    } catch (err) {
      setSyncError(err instanceof ApiError ? err.message : "Sync failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Message templates</h1>
          <p className="text-sm text-muted-foreground">
            {data ? `${data.total} templates` : "Loading..."} · Managed in Meta,
            mirrored here.
          </p>
          {data?.source && (
            <p className="text-xs text-muted-foreground">
              Source: {data.source.verifiedName || "WhatsApp account"}
              {data.source.displayPhoneNumber
                ? ` · ${data.source.displayPhoneNumber}`
                : ""}
              {data.source.wabaIdSuffix
                ? ` · WABA …${data.source.wabaIdSuffix}`
                : ""}
            </p>
          )}
        </div>
        <Button onClick={handleSync} disabled={syncTemplates.isPending}>
          <RefreshCw
            className={
              syncTemplates.isPending ? "size-4 animate-spin" : "size-4"
            }
          />
          {syncTemplates.isPending ? "Syncing..." : "Sync from Meta"}
        </Button>
      </div>

      {syncError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {syncError}
        </div>
      )}

      {syncSummary && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {syncSummary}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="grid h-40 place-items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="grid h-40 place-items-center px-6 text-center text-sm text-muted-foreground">
              No templates yet. Create templates in Meta Business Manager, then
              click &quot;Sync from Meta&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>{template.category}</TableCell>
                      <TableCell>
                        <TemplateStatusBadge status={template.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        {template.usageCount}×
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
