// src/hooks/use-reports.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  getBookingReport,
  getCustomerReport,
  getOverviewReport,
  getRevenueReport,
  type DateRangeParams,
} from "@/lib/reports";

const KEY = "reports";

export function useOverviewReport(params: DateRangeParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "overview", params],
    queryFn: () => getOverviewReport(params, token as string),
    enabled: Boolean(token),
  });
}

export function useRevenueReport(params: DateRangeParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "revenue", params],
    queryFn: () => getRevenueReport(params, token as string),
    enabled: Boolean(token),
  });
}

export function useBookingReport(params: DateRangeParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "bookings", params],
    queryFn: () => getBookingReport(params, token as string),
    enabled: Boolean(token),
  });
}

export function useCustomerReport() {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "customers"],
    queryFn: () => getCustomerReport(token as string),
    enabled: Boolean(token),
  });
}
