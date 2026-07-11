"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  addPayment,
  createBooking,
  deleteBooking,
  getBooking,
  getDailySchedule,
  listBookings,
  rescheduleBooking,
  updateBookingStatus,
  type BookingListParams,
  type BookingStatus,
  type CancellationReason,
  type CreateBookingInput,
  type PaymentMethod,
} from "@/lib/bookings";
import { getMyBusinessProfile } from "@/lib/business-profile";

const KEY = "bookings";

export function useBusinessProfile() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["business", "profile"],
    queryFn: () => getMyBusinessProfile(token as string),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookingList(params: BookingListParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => listBookings(params, token as string),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useDailySchedule(date: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "schedule", date],
    queryFn: () => getDailySchedule(date, token as string),
    enabled: Boolean(token) && Boolean(date),
    retry: 1,
  });
}

export function useBooking(bookingId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "detail", bookingId],
    queryFn: () => getBooking(bookingId as string, token as string),
    enabled: Boolean(token) && Boolean(bookingId),
  });
}

function useInvalidateBookings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [KEY] });
}

export function useCreateBooking() {
  const { token } = useAuth();
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (body: CreateBookingInput) =>
      createBooking(body, token as string),
    onSuccess: invalidate,
  });
}

export function useUpdateBookingStatus() {
  const { token } = useAuth();
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (args: {
      id: string;
      status: BookingStatus;
      reason?: CancellationReason;
      notes?: string;
      feedback?: { rating: number; comment?: string };
    }) => updateBookingStatus(args.id, args, token as string),
    onSuccess: invalidate,
  });
}

export function useRescheduleBooking() {
  const { token } = useAuth();
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      rescheduleBooking(id, scheduledAt, token as string),
    onSuccess: invalidate,
  });
}

export function useAddPayment() {
  const { token } = useAuth();
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: ({
      id,
      amount,
      method,
      reference,
    }: {
      id: string;
      amount: number;
      method: PaymentMethod;
      reference?: string;
    }) => addPayment(id, { amount, method, reference }, token as string),
    onSuccess: invalidate,
  });
}

export function useDeleteBooking() {
  const { token } = useAuth();
  const invalidate = useInvalidateBookings();
  return useMutation({
    mutationFn: (id: string) => deleteBooking(id, token as string),
    onSuccess: invalidate,
  });
}
