"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/business";

export function useDashboardStats(token?: string | null) {
  return useQuery({
    queryKey: ["business", "dashboard"],
    enabled: Boolean(token),
    queryFn: () => getDashboardStats(token as string),
  });
}
