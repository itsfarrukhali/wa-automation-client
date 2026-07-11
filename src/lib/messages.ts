// src/lib/messages.ts
import { apiRequest } from "@/lib/api";

export type MessageDirection = "in" | "out";
export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "bounced"
  | "deleted"
  | "expired";

export type MessageType =
  | "booking_confirmation"
  | "booking_reminder"
  | "booking_cancellation"
  | "booking_rescheduled"
  | "booking_followup"
  | "campaign_winback"
  | "campaign_promo"
  | "campaign_review"
  | "campaign_birthday"
  | "campaign_announcement"
  | "manual"
  | "quick_reply"
  | "ai_reply"
  | "inbound"
  | "inbound_reply";

export type Message = {
  _id: string;
  direction: MessageDirection;
  contentType:
    | "text"
    | "media"
    | "interactive"
    | "template"
    | "location"
    | "contact";
  content?: string;
  status: MessageStatus;
  type: MessageType;
  waCustomerPhone?: string;
  customerId?: {
    _id: string;
    name: string;
    phone: string;
    whatsappNumber?: string;
  };
  staffId?: { _id: string; name: string };
  sentAt: string;
  createdAt: string;
};

export type Conversation = {
  customer: {
    _id: string;
    name: string;
    phone: string;
    whatsappNumber?: string;
    optedOut: boolean;
    whatsappOptIn: boolean;
  };
  lastMessage: Message;
  lastMessageAt: string;
  unreadCount: number;
  needsHuman: boolean;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function getInbox(
  params: {
    limit?: number;
    status?: "all" | "unread" | "needs_human";
    search?: string;
  },
  token: string,
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{ conversations: Conversation[]; total: number }>
  >(`/messages/inbox?${query.toString()}`, { token });
  return res.data;
}

export async function getConversationThread(
  customerId: string,
  params: { before?: string; limit?: number },
  token: string,
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{
      customerId: string;
      messages: Message[];
      nextBefore: string | null;
    }>
  >(`/messages/conversations/${customerId}?${query.toString()}`, { token });
  return res.data;
}

export async function sendTextMessage(
  body: { customerId: string; text: string; type?: MessageType },
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ message: Message }>>(
    "/messages/text",
    {
      method: "POST",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.message;
}

export async function markMessageRead(messageId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ message: Message }>>(
    `/messages/${messageId}/read`,
    {
      method: "PATCH",
      token,
    },
  );
  return res.data.message;
}
