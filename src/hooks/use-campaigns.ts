// src/hooks/use-campaigns.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  cancelCampaign,
  cloneCampaign,
  createCampaign,
  getCampaign,
  getCampaignAnalytics,
  launchCampaign,
  listCampaigns,
  pauseCampaign,
  previewCampaignRecipients,
  resumeCampaign,
  updateCampaign,
  type CampaignFormInput,
  type CampaignListParams,
  type CampaignTarget,
} from "@/lib/campaigns";

const KEY = "campaigns";

export function useCampaignList(params: CampaignListParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => listCampaigns(params, token as string),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useCampaign(campaignId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "detail", campaignId],
    queryFn: () => getCampaign(campaignId as string, token as string),
    enabled: Boolean(token) && Boolean(campaignId),
    // Sending campaigns change fast — poll while open.
    refetchInterval: (query) =>
      query.state.data?.status === "sending" ||
      query.state.data?.status === "processing"
        ? 4000
        : false,
  });
}

export function useCampaignAnalytics(days = 30) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "analytics", days],
    queryFn: () => getCampaignAnalytics(days, token as string),
    enabled: Boolean(token),
  });
}

export function usePreviewRecipients() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: (body: {
      campaignId?: string;
      target?: CampaignTarget;
      limit?: number;
    }) => previewCampaignRecipients(body, token as string),
  });
}

function useInvalidateCampaigns() {
  const queryClient = useQueryClient();
  return (campaignId?: string) => {
    queryClient.invalidateQueries({ queryKey: [KEY, "list"] });
    queryClient.invalidateQueries({ queryKey: [KEY, "analytics"] });
    if (campaignId)
      queryClient.invalidateQueries({ queryKey: [KEY, "detail", campaignId] });
  };
}

export function useCreateCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: (body: CampaignFormInput) =>
      createCampaign(body, token as string),
    onSuccess: () => invalidate(),
  });
}

export function useUpdateCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<CampaignFormInput>;
    }) => updateCampaign(id, body, token as string),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useLaunchCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: {
        dryRun?: boolean;
        allowPartial?: boolean;
        sendMode?: "text" | "template";
        limit?: number;
      };
    }) => launchCampaign(id, body, token as string),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function usePauseCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: (id: string) => pauseCampaign(id, token as string),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useResumeCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: (id: string) => resumeCampaign(id, token as string),
    onSuccess: (_data, id) => invalidate(id),
  });
}

export function useCancelCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelCampaign(id, reason, token as string),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
}

export function useCloneCampaign() {
  const { token } = useAuth();
  const invalidate = useInvalidateCampaigns();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) =>
      cloneCampaign(id, name, token as string),
    onSuccess: () => invalidate(),
  });
}
