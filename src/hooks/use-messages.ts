// src/hooks/use-messages.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  getConversationThread,
  getInbox,
  markMessageRead,
  sendTextMessage,
} from "@/lib/messages";

const KEY = "messages";
const REFETCH_INTERVAL_MS = 15_000; // near-real-time without a websocket layer

export function useInbox(
  params: { status?: "all" | "unread" | "needs_human"; search?: string } = {},
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "inbox", params],
    queryFn: () => getInbox({ limit: 50, ...params }, token as string),
    enabled: Boolean(token),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useConversationThread(customerId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "thread", customerId],
    queryFn: () =>
      getConversationThread(
        customerId as string,
        { limit: 50 },
        token as string,
      ),
    enabled: Boolean(token) && Boolean(customerId),
    refetchInterval: REFETCH_INTERVAL_MS,
  });
}

export function useSendTextMessage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { customerId: string; text: string }) =>
      sendTextMessage(body, token as string),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [KEY, "thread", variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
    },
  });
}

export function useMarkMessageRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) =>
      markMessageRead(messageId, token as string),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] }),
  });
}
