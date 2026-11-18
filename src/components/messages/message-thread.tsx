// src/components/messages/message-thread.tsx
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, FileText, Loader2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useConversationThread,
  useSendTemplateMessage,
  useSendTextMessage,
} from "@/hooks/use-messages";
import { useTemplateList } from "@/hooks/use-templates";
import { ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export function MessageThread({ customerId }: { customerId: string | null }) {
  const { data, isLoading } = useConversationThread(customerId);
  const sendMessage = useSendTextMessage();
  const sendTemplate = useSendTemplateMessage();
  const { data: templateData } = useTemplateList();
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const [templateId, setTemplateId] = useState("");
  const [sendError, setSendError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ? [...data.messages].reverse() : [];
  const populatedCustomer = data?.messages
    .map((message) => message.customerId)
    .find(
      (customer): customer is Exclude<typeof customer, string | undefined> =>
        Boolean(customer) && typeof customer !== "string",
    );
  const isOptedOut = populatedCustomer?.whatsappOptIn === false;
  const approvedTemplates = (templateData?.templates ?? []).filter(
    (template) => template.status === "APPROVED",
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!customerId) return;
    setSendError("");
    try {
      if (mode === "template") {
        const template = approvedTemplates.find(
          (item) => item.id === templateId,
        );
        if (!template) return;
        await sendTemplate.mutateAsync({
          customerId,
          templateName: template.name,
          language: template.language,
        });
      } else {
        if (!draft.trim()) return;
        const text = draft.trim();
        setDraft("");
        try {
          await sendMessage.mutateAsync({ customerId, text });
        } catch (error) {
          setDraft(text);
          throw error;
        }
      }
    } catch (err) {
      setSendError(
        err instanceof ApiError && err.statusCode === 403
          ? "Message blocked: this customer opted out. Ask them to send START on WhatsApp, then try again."
          : err instanceof ApiError
            ? err.message
            : "Failed to send message",
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
        className="space-y-2 border-t p-3"
      >
        {(isOptedOut || sendError) && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              {sendError ||
                "This customer opted out. They must send START on WhatsApp before you can message them."}
            </span>
          </div>
        )}
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "text" ? "default" : "ghost"}
            onClick={() => setMode("text")}
            disabled={isOptedOut}
          >
            <MessageSquare className="size-4" />
            Text
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "template" ? "default" : "ghost"}
            onClick={() => setMode("template")}
            disabled={isOptedOut}
          >
            <FileText className="size-4" />
            Template
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {mode === "template" ? (
            <select
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              value={templateId}
              onChange={(event) => setTemplateId(event.target.value)}
              disabled={sendTemplate.isPending || isOptedOut}
              aria-label="Approved WhatsApp template"
            >
              <option value="">Select an approved template</option>
              {approvedTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.language})
                </option>
              ))}
            </select>
          ) : (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              maxLength={4096}
              disabled={sendMessage.isPending || isOptedOut}
            />
          )}
          <Button
            type="submit"
            size="icon"
            aria-label={mode === "template" ? "Send template" : "Send message"}
            disabled={
              sendMessage.isPending ||
              sendTemplate.isPending ||
              isOptedOut ||
              (mode === "text" ? !draft.trim() : !templateId)
            }
          >
            {sendMessage.isPending || sendTemplate.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
