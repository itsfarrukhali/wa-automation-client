"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest, unwrapList } from "@/lib/api";
import {
  bookings,
  conversations,
  customers,
  type Booking,
  type Conversation,
  type Customer,
} from "@/lib/mock-data";

export function useConversations(token?: string | null) {
  return useQuery({
    queryKey: ["inbox"],
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const payload = await apiRequest<unknown>("/messages/inbox", { token });
        return unwrapList<Conversation>(payload, conversations);
      } catch {
        return conversations;
      }
    },
  });
}

export function useBookings(token?: string | null) {
  return useQuery({
    queryKey: ["bookings"],
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const payload = await apiRequest<unknown>("/bookings", { token });
        return unwrapList<Booking>(payload, bookings);
      } catch {
        return bookings;
      }
    },
  });
}

export function useCustomers(token?: string | null) {
  return useQuery({
    queryKey: ["customers"],
    enabled: Boolean(token),
    queryFn: async () => {
      try {
        const payload = await apiRequest<unknown>("/customers", { token });
        return unwrapList<Customer>(payload, customers);
      } catch {
        return customers;
      }
    },
  });
}
