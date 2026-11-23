"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";
import { Card } from "@/components/ui/card";
import { useMessageEvents } from "@/hooks/use-messages";
import { cn } from "@/lib/utils";

export function InboxWorkspace({
  initialCustomerId,
}: {
  initialCustomerId: string | null;
}) {
  const router = useRouter();
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId);

  useMessageEvents();

  function selectConversation(customerId: string) {
    setSelectedCustomerId(customerId);
    router.replace(
      `/dashboard/inbox?customerId=${encodeURIComponent(customerId)}`,
      { scroll: false },
    );
  }

  function closeConversation() {
    setSelectedCustomerId(null);
    router.replace("/dashboard/inbox", { scroll: false });
  }

  return (
    <div className="h-[calc(100dvh-9rem)] min-h-[32rem] lg:h-[calc(100dvh-6.5rem)]">
      <Card className="grid h-full min-h-0 grid-cols-1 overflow-hidden md:grid-cols-[22rem_minmax(0,1fr)]">
        <div
          className={cn(
            "min-h-0 border-r-0 md:block md:border-r",
            selectedCustomerId ? "hidden" : "block",
          )}
        >
          <ConversationList
            selectedCustomerId={selectedCustomerId}
            onSelect={selectConversation}
          />
        </div>
        <div
          className={cn(
            "min-h-0 min-w-0 md:flex",
            selectedCustomerId ? "flex" : "hidden",
          )}
        >
          <MessageThread
            key={selectedCustomerId ?? "empty"}
            customerId={selectedCustomerId}
            onBack={closeConversation}
          />
        </div>
      </Card>
    </div>
  );
}
