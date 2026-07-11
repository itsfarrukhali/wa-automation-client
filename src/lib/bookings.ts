import { apiRequest } from "@/lib/api";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "arrived"
  | "in_progress"
  | "completed"
  | "no_show"
  | "cancelled"
  | "rescheduled";

export type PaymentStatus =
  | "unpaid"
  | "partial"
  | "paid"
  | "refunded"
  | "waived";
export type PaymentMethod =
  | "cash"
  | "card"
  | "jazzcash"
  | "easypaisa"
  | "bank_transfer";
export type CancellationReason =
  | "customer_request"
  | "staff_unavailable"
  | "weather"
  | "emergency"
  | "double_booked"
  | "payment_issue"
  | "other";

export type Booking = {
  _id: string;
  scheduledAt: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  customerId?: { _id: string; name: string; phone: string };
  serviceId?: { _id: string; name: string; duration: number; price: number };
  staffId?: { _id: string; name: string } | null;
  payments: Array<{
    _id: string;
    amount: number;
    method: PaymentMethod;
    paidAt: string;
    reference?: string;
  }>;
  cancellationReason?: CancellationReason;
  createdAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

// Mirrors STATUS_TRANSITIONS in booking.service.js — keep in sync.
export const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["arrived", "cancelled", "no_show"],
  arrived: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
  rescheduled: [],
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  arrived: "Arrived",
  in_progress: "In progress",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
};

export type BookingListParams = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  customerId?: string;
  serviceId?: string;
  staffId?: string;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: "asc" | "desc";
};

export async function listBookings(params: BookingListParams, token: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{ bookings: Booking[]; pagination: Pagination }>
  >(`/bookings?${query.toString()}`, { token });
  return res.data;
}

export async function getDailySchedule(date: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ bookings: Booking[] }>>(
    `/bookings/schedule?date=${date}`,
    { token },
  );
  return res.data.bookings;
}

export async function getBooking(bookingId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ booking: Booking }>>(
    `/bookings/${bookingId}`,
    { token },
  );
  return res.data.booking;
}

export type CreateBookingInput = {
  customerId: string;
  serviceId: string;
  staffId?: string;
  scheduledAt: string; // ISO
  totalAmount?: number;
  amountPaid?: number;
  preferredPaymentMethod?: PaymentMethod;
  notes?: string;
  source?: string;
};

export async function createBooking(body: CreateBookingInput, token: string) {
  const res = await apiRequest<ApiEnvelope<{ booking: Booking }>>("/bookings", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return res.data.booking;
}

export async function updateBookingStatus(
  bookingId: string,
  body: {
    status: BookingStatus;
    reason?: CancellationReason;
    notes?: string;
    feedback?: { rating: number; comment?: string };
  },
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ booking: Booking }>>(
    `/bookings/${bookingId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.booking;
}

export async function rescheduleBooking(
  bookingId: string,
  scheduledAt: string,
  token: string,
) {
  const res = await apiRequest<
    ApiEnvelope<{ booking: Booking; previousBooking: Booking }>
  >(`/bookings/${bookingId}/reschedule`, {
    method: "POST",
    body: JSON.stringify({ scheduledAt }),
    token,
  });
  return res.data;
}

export async function addPayment(
  bookingId: string,
  body: { amount: number; method: PaymentMethod; reference?: string },
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ booking: Booking }>>(
    `/bookings/${bookingId}/payments`,
    {
      method: "POST",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.booking;
}

export async function deleteBooking(bookingId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ id: string }>>(
    `/bookings/${bookingId}`,
    {
      method: "DELETE",
      token,
    },
  );
  return res.data;
}
