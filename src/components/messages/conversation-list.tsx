// src/components/messages/conversation-list.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, MessageCircleMore, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInbox, useMessageRealtimeStatus } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";

export function ConversationList({
  selectedCustomerId,
  onSelect,
}: {
  selectedCustomerId: string | null;
  onSelect: (customerId: string) => void;
}) {
  const [status, setStatus] = useStatusFilter();
  const [search, setSearch] = useSearchFilter();
  const realtimeStatus = useMessageRealtimeStatus();
  const { data, error, isLoading } = useInbox({
    status,
    search: search || undefined,
  });

  const conversations = data?.conversations ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="space-y-4 border-b p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Inbox</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data ? `${data.total} conversation${data.total === 1 ? "" : "s"}` : "Customer conversations"}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <span
              className={cn(
                "size-2 rounded-full",
                realtimeStatus === "connected"
                  ? "bg-emerald-500"
                  : realtimeStatus === "connecting"
                    ? "animate-pulse bg-amber-500"
                    : "bg-slate-400",
              )}
            />
            {realtimeStatus === "connected" ? "Live" : realtimeStatus === "connecting" ? "Connecting" : "Reconnecting"}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search conversations"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as typeof status)}
        >
          <TabsList className="w-full">
            <TabsTrigger className="flex-1" value="all">
              All
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="unread">
              Unread
            </TabsTrigger>
            <TabsTrigger className="flex-1" value="needs_human">
              Needs reply
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : error ? (
          <div className="m-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Conversations could not be loaded. Check your connection and try again.
          </div>
        ) : conversations.length === 0 ? (
          <div className="grid min-h-72 place-items-center px-6 text-center">
            <div>
              <MessageCircleMore className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium">No conversations found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? "Try a different search." : "New WhatsApp conversations will appear here."}
              </p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.customer._id}
              type="button"
              onClick={() => onSelect(conversation.customer._id)}
              aria-pressed={selectedCustomerId === conversation.customer._id}
              className={cn(
                "flex w-full flex-col gap-1.5 border-b px-4 py-3.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                selectedCustomerId === conversation.customer._id && "bg-emerald-50/80",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold">
                  {conversation.customer.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="truncate text-sm text-muted-foreground">
                {conversation.lastMessage.direction === "out" && "You: "}
                {conversation.lastMessage.content ?? "Media message"}
              </p>
              <div className="flex items-center gap-1.5">
                {conversation.unreadCount > 0 && (
                  <Badge variant="warning">
                    {conversation.unreadCount} new
                  </Badge>
                )}
                {conversation.needsHuman && (
                  <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 gap-1">
                    <AlertCircle className="size-3" />
                    Needs reply
                  </Badge>
                )}
                {!conversation.customer.whatsappOptIn && (
                  <Badge variant="secondary">Opted out</Badge>
                )}
              </div>
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div className="divide-y" aria-label="Loading conversations">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2 px-4 py-4">
          <div className="flex justify-between gap-4">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
            <div className="h-3 w-14 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// Small local hooks kept in-file to avoid over-engineering a shared filter store.
import { useState } from "react";
function useStatusFilter() {
  return useState<"all" | "unread" | "needs_human">("all");
}
function useSearchFilter() {
  return useState("");
}
