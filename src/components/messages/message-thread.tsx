// src/components/messages/message-thread.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useConversationThread,
  useSendTextMessage,
} from "@/hooks/use-messages";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export function MessageThread({ customerId }: { customerId: string | null }) {
  const { data, isLoading } = useConversationThread(customerId);
  const sendMessage = useSendTextMessage();
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ? [...data.messages].reverse() : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId || !draft.trim()) return;
    setSendError("");
    try {
      await sendMessage.mutateAsync({ customerId, text: draft.trim() });
      setDraft("");
    } catch (err) {
      setSendError(
        err instanceof ApiError ? err.message : "Failed to send message",
      );
    }
  }

  if (!customerId) {
    return (
      <div className="grid h-full place-items-center text-sm text-muted-foreground">
        Select a conversation to start replying.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="grid h-full place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message._id}
                className={cn(
                  "flex",
                  message.direction === "out" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    message.direction === "out"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border bg-white",
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    {message.content ?? `[${message.contentType}]`}
                  </p>
                  <div
                    className={cn(
                      "mt-1 text-[10px] opacity-70",
                      message.direction === "out"
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {new Date(message.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {message.direction === "out" && ` · ${message.status}`}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t p-3"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          maxLength={4096}
          disabled={sendMessage.isPending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sendMessage.isPending || !draft.trim()}
        >
          {sendMessage.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
      {sendError && (
        <p className="border-t bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {sendError}
        </p>
      )}
    </div>
  );
}
