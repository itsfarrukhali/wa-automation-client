"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  FileText,
  Loader2,
  MessageCircleMore,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useConversationThread,
  useSendTemplateMessage,
  useSendTextMessage,
} from "@/hooks/use-messages";
import { useTemplateList } from "@/hooks/use-templates";
import { ApiError } from "@/lib/api";
import type { Message } from "@/lib/messages";
import { cn } from "@/lib/utils";

const HISTORY_TRIGGER_PX = 96;
const NEAR_BOTTOM_PX = 120;

export function MessageThread({
  customerId,
  onBack,
}: {
  customerId: string | null;
  onBack?: () => void;
}) {
  const {
    data,
    error: threadError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useConversationThread(customerId);
  const sendMessage = useSendTextMessage();
  const sendTemplate = useSendTemplateMessage();
  const { data: templateData } = useTemplateList();
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"text" | "template">("text");
  const [templateId, setTemplateId] = useState("");
  const [sendError, setSendError] = useState("");
  const [showNewMessageJump, setShowNewMessageJump] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const previousCustomerRef = useRef<string | null>(null);
  const previousNewestMessageRef = useRef<string | null>(null);
  const loadingOlderRef = useRef(false);

  const messages = useMemo(() => {
    const unique = new Map<string, Message>();
    data?.pages.forEach((page) => {
      page.messages.forEach((message) => unique.set(message._id, message));
    });
    return Array.from(unique.values()).sort((left, right) => {
      const timeDifference =
        new Date(left.sentAt).getTime() - new Date(right.sentAt).getTime();
      return timeDifference || left._id.localeCompare(right._id);
    });
  }, [data]);

  const populatedCustomer = messages
    .map((message) => message.customerId)
    .find(
      (customer): customer is Exclude<typeof customer, string | undefined> =>
        Boolean(customer) && typeof customer !== "string",
    );
  const isOptedOut =
    populatedCustomer?.whatsappOptIn === false || populatedCustomer?.optedOut;
  const approvedTemplates = (templateData?.templates ?? []).filter(
    (template) => template.status === "APPROVED",
  );
  const newestMessage = messages.at(-1);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || messages.length === 0) return;

    const customerChanged = previousCustomerRef.current !== customerId;
    const newestChanged =
      previousNewestMessageRef.current !== null &&
      previousNewestMessageRef.current !== newestMessage?._id;

    if (
      customerChanged ||
      previousNewestMessageRef.current === null ||
      (newestChanged &&
        (isNearBottom(container) || newestMessage?.direction === "out"))
    ) {
      requestAnimationFrame(() => {
        scrollToLatest("auto");
      });
      setShowNewMessageJump(false);
    } else if (newestChanged) {
      setShowNewMessageJump(true);
    }

    previousCustomerRef.current = customerId;
    previousNewestMessageRef.current = newestMessage?._id ?? null;
  }, [customerId, messages.length, newestMessage?._id, newestMessage?.direction]);

  function scrollToLatest(behavior: ScrollBehavior = "smooth") {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    setShowNewMessageJump(false);
  }

  async function loadOlderMessages() {
    const container = scrollRef.current;
    if (
      !container ||
      !hasNextPage ||
      isFetchingNextPage ||
      loadingOlderRef.current
    ) {
      return;
    }

    loadingOlderRef.current = true;
    const previousHeight = container.scrollHeight;
    const previousTop = container.scrollTop;

    try {
      await fetchNextPage();
      requestAnimationFrame(() => {
        const activeContainer = scrollRef.current;
        if (!activeContainer) return;
        activeContainer.scrollTop =
          activeContainer.scrollHeight - previousHeight + previousTop;
      });
    } finally {
      loadingOlderRef.current = false;
    }
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    if (container.scrollTop <= HISTORY_TRIGGER_PX) {
      void loadOlderMessages();
    }
    if (isNearBottom(container)) setShowNewMessageJump(false);
  }

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
        setTemplateId("");
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
      requestAnimationFrame(() => scrollToLatest());
    } catch (err) {
      setSendError(
        err instanceof ApiError && err.statusCode === 403
          ? "Message blocked because this customer opted out. Ask them to send START on WhatsApp, then try again."
          : err instanceof ApiError
            ? err.message
            : "The message could not be sent. Please try again.",
      );
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  if (!customerId) {
    return (
      <div className="grid h-full w-full place-items-center bg-slate-50/60 px-6 text-center">
        <div>
          <MessageCircleMore className="mx-auto size-10 text-muted-foreground/50" />
          <h2 className="mt-4 text-base font-semibold">Select a conversation</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a customer from the inbox to view messages and reply.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative flex h-full min-h-0 w-full flex-col bg-white">
      <header className="flex min-h-16 shrink-0 items-center gap-3 border-b px-3 sm:px-4">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="md:hidden"
          aria-label="Back to conversations"
          onClick={onBack}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
          {(populatedCustomer?.name || "C").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">
            {populatedCustomer?.name || "Customer conversation"}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {populatedCustomer?.whatsappNumber ||
              populatedCustomer?.phone ||
              "WhatsApp conversation"}
          </p>
        </div>
        <span
          className={cn(
            "ml-auto rounded-full px-2.5 py-1 text-xs font-medium",
            isOptedOut
              ? "bg-slate-100 text-slate-600"
              : "bg-emerald-50 text-emerald-700",
          )}
        >
          {isOptedOut ? "Opted out" : "Can receive messages"}
        </span>
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/50 px-3 py-4 sm:px-5"
      >
        {isFetchingNextPage && (
          <div className="mb-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Loading earlier messages
          </div>
        )}
        {!isFetchingNextPage && hasNextPage && messages.length > 0 && (
          <div className="mb-3 text-center">
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
              onClick={() => void loadOlderMessages()}
            >
              Load earlier messages
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid h-full min-h-72 place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : threadError ? (
          <div className="grid h-full min-h-72 place-items-center px-4 text-center">
            <div>
              <AlertCircle className="mx-auto size-8 text-destructive/70" />
              <p className="mt-3 text-sm font-medium">
                This conversation could not be loaded.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => void refetch()}
              >
                Try again
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="grid h-full min-h-72 place-items-center px-4 text-center">
            <div>
              <MessageSquare className="mx-auto size-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium">No messages yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Send the first message using the composer below.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl space-y-2">
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const showDate =
                !previousMessage ||
                new Date(previousMessage.sentAt).toDateString() !==
                  new Date(message.sentAt).toDateString();

              return (
                <div key={message._id}>
                  {showDate && <DateDivider date={message.sentAt} />}
                  <div
                    className={cn(
                      "flex",
                      message.direction === "out"
                        ? "justify-end"
                        : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] break-words rounded-2xl px-3.5 py-2.5 text-sm shadow-sm sm:max-w-[72%]",
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
                          "mt-1.5 flex items-center justify-end gap-1 text-[11px] opacity-70",
                          message.direction === "out"
                            ? "text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        <span>
                          {new Date(message.sentAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {message.direction === "out" && (
                          <span>· {friendlyStatus(message.status)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {showNewMessageJump && (
              <div className="sticky bottom-2 flex justify-center pt-2">
                <Button
                  type="button"
                  size="sm"
                  className="rounded-full shadow-lg"
                  onClick={() => scrollToLatest()}
                >
                  <ChevronDown className="size-4" />
                  New messages
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 space-y-2 border-t bg-white p-3 sm:p-4"
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

        <div className="flex items-center gap-1">
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

        <div className="flex items-end gap-2">
          {mode === "template" ? (
            <select
              className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
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
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Type a message"
              rows={1}
              maxLength={4096}
              disabled={sendMessage.isPending || isOptedOut}
              className="min-h-10 max-h-32 min-w-0 flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          )}
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0"
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
        {mode === "text" && (
          <p className="hidden text-xs text-muted-foreground sm:block">
            Press Enter to send · Shift + Enter for a new line
          </p>
        )}
      </form>
    </section>
  );
}
function isNearBottom(container: HTMLDivElement) {
  return (
    container.scrollHeight - container.scrollTop - container.clientHeight <=
    NEAR_BOTTOM_PX
  );
}
function friendlyStatus(status: Message["status"]) {
  if (status === "pending") return "Sending";
  if (status === "failed" || status === "bounced" || status === "expired") {
    return "Not delivered";
  }
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DateDivider({ date }: { date: string }) {
  const value = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const label =
    value.toDateString() === today.toDateString()
      ? "Today"
      : value.toDateString() === yesterday.toDateString()
        ? "Yesterday"
        : value.toLocaleDateString([], {
            day: "numeric",
            month: "short",
            year:
              value.getFullYear() === today.getFullYear()
                ? undefined
                : "numeric",
          });

  return (
    <div className="flex items-center gap-3 py-4" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

