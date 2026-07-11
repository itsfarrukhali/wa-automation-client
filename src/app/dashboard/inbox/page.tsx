// src/app/dashboard/inbox/page.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ConversationList } from "@/components/messages/conversation-list";
import { MessageThread } from "@/components/messages/message-thread";

export default function InboxPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );

  return (
    <div className="h-[calc(100vh-140px)]">
      <Card className="grid h-full grid-cols-1 overflow-hidden md:grid-cols-[320px_1fr]">
        <div className="border-b md:border-b-0 md:border-r">
          <ConversationList
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
          />
        </div>
        <MessageThread customerId={selectedCustomerId} />
      </Card>
    </div>
  );
}
