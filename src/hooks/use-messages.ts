// src/hooks/use-messages.ts
"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { API_BASE_URL } from "@/lib/api";
import {
  ConversationThread,
  Message,
  getConversationThread,
  getInbox,
  markMessageRead,
  sendTemplateMessage,
  sendTextMessage,
} from "@/lib/messages";

const KEY = "messages";
const FALLBACK_REFETCH_INTERVAL_MS = 60_000;

export function useInbox(
  params: { status?: "all" | "unread" | "needs_human"; search?: string } = {},
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "inbox", params],
    queryFn: () => getInbox({ limit: 50, ...params }, token as string),
    enabled: Boolean(token),
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
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
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useMessageEvents() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1_000;

    const refreshMessages = (customerId?: string) => {
      queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
      if (customerId) {
        queryClient.invalidateQueries({
          queryKey: [KEY, "thread", customerId],
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [KEY, "thread"] });
      }
    };

    const connect = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/messages/events`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error(`Message event stream failed (${response.status})`);
        }

        retryDelay = 1_000;
        refreshMessages();
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const block of events) {
            const dataLine = block
              .split("\n")
              .find((line) => line.startsWith("data: "));
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine.slice(6)) as {
                customerId?: string;
              };
              refreshMessages(event.customerId);
            } catch {
              // Ignore malformed events and keep the stream alive.
            }
          }
        }

        if (!controller.signal.aborted) throw new Error("Message stream closed");
      } catch {
        if (controller.signal.aborted) return;
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
      }
    };

    connect();
    return () => {
      controller.abort();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [queryClient, token]);
}

export function useSendTextMessage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: { customerId: string; text: string }) =>
      sendTextMessage(body, token as string),
    onMutate: async (variables) => {
      return addOptimisticMessage(queryClient, variables.customerId, {
        content: variables.text,
        contentType: "text",
      });
    },
    onError: (_error, variables, context) => {
      restoreThread(queryClient, variables.customerId, context?.previous);
    },
    onSuccess: (message, variables, context) => {
      replaceOptimisticMessage(
        queryClient,
        variables.customerId,
        context?.optimisticId,
        message,
      );
      queryClient.invalidateQueries({
        queryKey: [KEY, "thread", variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
    },
  });
}

export function useSendTemplateMessage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      customerId: string;
      templateName: string;
      language?: string;
      components?: unknown[];
    }) => sendTemplateMessage(body, token as string),
    onMutate: async (variables) => {
      return addOptimisticMessage(queryClient, variables.customerId, {
        content: variables.templateName,
        contentType: "template",
      });
    },
    onError: (_error, variables, context) => {
      restoreThread(queryClient, variables.customerId, context?.previous);
    },
    onSuccess: (message, variables, context) => {
      replaceOptimisticMessage(
        queryClient,
        variables.customerId,
        context?.optimisticId,
        message,
      );
      queryClient.invalidateQueries({
        queryKey: [KEY, "thread", variables.customerId],
      });
      queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
      queryClient.invalidateQueries({ queryKey: ["templates", "list"] });
    },
  });
}

async function addOptimisticMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  customerId: string,
  input: Pick<Message, "content" | "contentType">,
) {
  const queryKey = [KEY, "thread", customerId] as const;
  await queryClient.cancelQueries({ queryKey });
  const previous = queryClient.getQueryData<ConversationThread>(queryKey);
  const now = new Date().toISOString();
  const optimisticId = `optimistic-${Date.now()}`;
  const optimisticMessage: Message = {
    _id: optimisticId,
    direction: "out",
    content: input.content,
    contentType: input.contentType,
    status: "pending",
    type: "manual",
    customerId,
    sentAt: now,
    createdAt: now,
  };

  queryClient.setQueryData<ConversationThread>(queryKey, (current) =>
    current
      ? { ...current, messages: [optimisticMessage, ...current.messages] }
      : current,
  );
  return { previous, optimisticId };
}

function restoreThread(
  queryClient: ReturnType<typeof useQueryClient>,
  customerId: string,
  previous?: ConversationThread,
) {
  if (previous) {
    queryClient.setQueryData([KEY, "thread", customerId], previous);
  }
}

function replaceOptimisticMessage(
  queryClient: ReturnType<typeof useQueryClient>,
  customerId: string,
  optimisticId: string | undefined,
  message: Message,
) {
  queryClient.setQueryData<ConversationThread>(
    [KEY, "thread", customerId],
    (current) =>
      current
        ? {
            ...current,
            messages: current.messages.map((item) =>
              item._id === optimisticId ? message : item,
            ),
          }
        : current,
  );
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
