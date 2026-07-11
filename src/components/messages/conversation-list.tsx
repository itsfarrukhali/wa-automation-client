// src/components/messages/conversation-list.tsx
"use client";

import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInbox } from "@/hooks/use-messages";
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
  const { data, isLoading } = useInbox({ status, search: search || undefined });

  const conversations = data?.conversations ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b p-3">
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

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No conversations here.
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.customer._id}
              onClick={() => onSelect(conversation.customer._id)}
              className={cn(
                "flex w-full flex-col gap-1 border-b p-3 text-left transition-colors hover:bg-muted/60",
                selectedCustomerId === conversation.customer._id && "bg-muted",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium">
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

// Small local hooks kept in-file to avoid over-engineering a shared filter store.
import { useState } from "react";
function useStatusFilter() {
  return useState<"all" | "unread" | "needs_human">("all");
}
function useSearchFilter() {
  return useState("");
}
