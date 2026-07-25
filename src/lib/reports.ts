// src/lib/reports.ts
import { apiRequest } from "@/lib/api";

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export type DateRangeParams = {
  dateFrom?: string;
  dateTo?: string;
  days?: number;
};

export type OverviewReport = {
  range: { start: string; end: string };
  bookings: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    upcoming: number;
    completionRate: number;
  };
  revenue: { collected: number; bookedValue: number };
  customers: {
    total: number;
    optedIn: number;
    optedOut: number;
    optInRate: number;
    avgEngagement: number;
  };
  messages: {
    total: number;
    byStatus: Record<string, number>;
    deliveryRate: number;
    readRate: number;
    failureRate: number;
  };
  campaigns: {
    total: number;
    sent: number;
    failed: number;
    read: number;
    readRate: number;
  };
};

export type RevenueReport = {
  range: { start: string; end: string };
  totals: {
    collected: number;
    bookedValue: number;
    completedRevenue: number;
    bookings: number;
  };
  daily: Array<{
    date: string;
    collected: number;
    bookedValue: number;
    completedRevenue: number;
    bookings: number;
  }>;
};

export type BookingReport = {
  range: { start: string; end: string };
  byStatus: Record<string, number>;
  topServices: Array<{ service: string; bookings: number; revenue: number }>;
};

export type CustomerReport = {
  segments: Array<{ tag: string; count: number }>;
  topCustomers: Array<{
    _id: string;
    name: string;
    phone: string;
    whatsappNumber?: string;
    totalSpent: number;
    totalVisits: number;
    tags: string[];
    engagement?: { score: number };
  }>;
};

function buildQuery(params: DateRangeParams) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
}

export async function getOverviewReport(
  params: DateRangeParams,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<OverviewReport>>(
    `/reports/overview?${buildQuery(params)}`,
    { token },
  );
  return res.data;
}

export async function getRevenueReport(params: DateRangeParams, token: string) {
  const res = await apiRequest<ApiEnvelope<RevenueReport>>(
    `/reports/revenue?${buildQuery(params)}`,
    { token },
  );
  return res.data;
}

export async function getBookingReport(params: DateRangeParams, token: string) {
  const res = await apiRequest<ApiEnvelope<BookingReport>>(
    `/reports/bookings?${buildQuery(params)}`,
    { token },
  );
  return res.data;
}

// No date params — mirrors the backend route exactly (no validator, controller ignores query).
export async function getCustomerReport(token: string) {
  const res = await apiRequest<ApiEnvelope<CustomerReport>>(
    "/reports/customers",
    { token },
  );
  return res.data;
}
