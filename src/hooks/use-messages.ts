// src/hooks/use-messages.ts
"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
type RealtimeStatus = "connecting" | "connected" | "disconnected";
type MessageEvent = {
  action?: string;
  customerId?: string;
  messageId?: string;
  message?: Message;
};

let realtimeStatus: RealtimeStatus = "disconnected";
const realtimeListeners = new Set<() => void>();

const subscribeToRealtimeStatus = (listener: () => void) => {
  realtimeListeners.add(listener);
  return () => realtimeListeners.delete(listener);
};

const getRealtimeStatus = () => realtimeStatus;

const setRealtimeStatus = (status: RealtimeStatus) => {
  if (status === realtimeStatus) return;
  realtimeStatus = status;
  realtimeListeners.forEach((listener) => listener());
};

export function useMessageRealtimeStatus() {
  return useSyncExternalStore(
    subscribeToRealtimeStatus,
    getRealtimeStatus,
    getRealtimeStatus,
  );
}

export function useInbox(
  params: { status?: "all" | "unread" | "needs_human"; search?: string } = {},
) {
  const { token } = useAuth();
  const status = useMessageRealtimeStatus();
  return useQuery({
    queryKey: [KEY, "inbox", params],
    queryFn: () => getInbox({ limit: 50, ...params }, token as string),
    enabled: Boolean(token),
    refetchInterval:
      status === "connected" ? false : FALLBACK_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

export function useConversationThread(customerId: string | null) {
  const { token } = useAuth();
  const status = useMessageRealtimeStatus();
  return useInfiniteQuery({
    queryKey: [KEY, "thread", customerId],
    queryFn: ({ pageParam }) =>
      getConversationThread(
        customerId as string,
        { before: pageParam, limit: 50 },
        token as string,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.messages.length === 50 && lastPage.nextBefore
        ? lastPage.nextBefore
        : undefined,
    enabled: Boolean(token) && Boolean(customerId),
    refetchInterval:
      status === "connected" ? false : FALLBACK_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}

type ThreadHistory = InfiniteData<ConversationThread, string | undefined>;

export function useMessageEvents() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryDelay = 1_000;

    const connect = async () => {
      setRealtimeStatus("connecting");
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
        setRealtimeStatus("connected");
        queryClient.invalidateQueries({ queryKey: [KEY] });
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
            const eventLine = block
              .split("\n")
              .find((line) => line.startsWith("event:"));
            const dataLine = block
              .split("\n")
              .find((line) => line.startsWith("data:"));
            if (!dataLine || eventLine?.slice(6).trim() !== "message.updated") {
              continue;
            }
            try {
              const event = JSON.parse(dataLine.slice(5).trim()) as MessageEvent;
              applyMessageEvent(queryClient, event);
            } catch {
              // Ignore malformed events and keep the stream alive.
            }
          }
        }

        if (!controller.signal.aborted) throw new Error("Message stream closed");
      } catch {
        if (controller.signal.aborted) return;
        setRealtimeStatus("disconnected");
        const jitter = Math.floor(Math.random() * Math.min(retryDelay, 1_000));
        retryTimer = setTimeout(connect, retryDelay + jitter);
        retryDelay = Math.min(retryDelay * 2, 30_000);
      }
    };

    connect();
    return () => {
      controller.abort();
      if (retryTimer) clearTimeout(retryTimer);
      setRealtimeStatus("disconnected");
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
      if (realtimeStatus !== "connected") {
        queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
      }
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
      if (realtimeStatus !== "connected") {
        queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
      }
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
  const previous = queryClient.getQueryData<ThreadHistory>(queryKey);
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

  queryClient.setQueryData<ThreadHistory>(queryKey, (current) => {
    if (!current?.pages[0]) return current;
    return {
      ...current,
      pages: [
        {
          ...current.pages[0],
          messages: [optimisticMessage, ...current.pages[0].messages],
        },
        ...current.pages.slice(1),
      ],
    };
  });
  return { previous, optimisticId };
}

function restoreThread(
  queryClient: ReturnType<typeof useQueryClient>,
  customerId: string,
  previous?: ThreadHistory,
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
  queryClient.setQueryData<ThreadHistory>(
    [KEY, "thread", customerId],
    (current) => {
      if (!current) return current;
      return {
        ...current,
        pages: current.pages.map((page, pageIndex) => {
          const withoutServerDuplicate = page.messages.filter(
            (item) => item._id !== message._id,
          );
          const messages = withoutServerDuplicate.map((item) =>
            item._id === optimisticId ? message : item,
          );
          if (pageIndex === 0 && !messages.some((item) => item._id === message._id)) {
            const replacedOptimistic = page.messages.some(
              (item) => item._id === optimisticId,
            );
            if (!replacedOptimistic) messages.unshift(message);
          }
          return { ...page, messages };
        }),
      };
    },
  );
}

function applyMessageEvent(queryClient: QueryClient, event: MessageEvent) {
  const { customerId, message, messageId } = event;

  if (customerId && message?._id) {
    queryClient.setQueryData<ThreadHistory>(
      [KEY, "thread", customerId],
      (current) => {
        if (!current?.pages[0]) return current;
        const existing = current.pages
          .flatMap((page) => page.messages)
          .find((item) => item._id === message._id);
        const nextMessage = existing
          ? {
              ...existing,
              ...message,
              customerId:
                typeof message.customerId === "string" &&
                typeof existing.customerId === "object"
                  ? existing.customerId
                  : message.customerId,
            }
          : message;

        return {
          ...current,
          pages: current.pages.map((page, pageIndex) => ({
            ...page,
            messages: existing
              ? page.messages.map((item) =>
                  item._id === message._id ? nextMessage : item,
                )
              : pageIndex === 0
                ? [nextMessage, ...page.messages]
                : page.messages,
          })),
        };
      },
    );
  } else if (customerId && messageId) {
    queryClient.invalidateQueries({ queryKey: [KEY, "thread", customerId] });
  }

  if (
    customerId &&
    (event.action === "customer_opted_out" ||
      event.action === "customer_opted_in")
  ) {
    queryClient.invalidateQueries({ queryKey: [KEY, "thread", customerId] });
  }

  queryClient.invalidateQueries({ queryKey: [KEY, "inbox"] });
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
