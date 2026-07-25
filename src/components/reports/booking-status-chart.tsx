// src/components/reports/booking-status-chart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(38 92% 50%)",
  confirmed: "hsl(221 83% 53%)",
  arrived: "hsl(199 89% 48%)",
  in_progress: "hsl(262 83% 58%)",
  completed: "hsl(142 71% 45%)",
  no_show: "hsl(0 84% 60%)",
  cancelled: "hsl(0 0% 60%)",
  rescheduled: "hsl(280 65% 60%)",
};

const chartConfig: ChartConfig = { count: { label: "Bookings" } };

export function BookingStatusChart({
  byStatus,
}: {
  byStatus: Record<string, number>;
}) {
  const data = Object.entries(byStatus).map(([status, count]) => ({
    status: status.replace("_", " "),
    count,
    fill: STATUS_COLORS[status] ?? "hsl(var(--muted-foreground))",
  }));

  if (data.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        No bookings in this range.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="status"
          tickLine={false}
          axisLine={false}
          width={90}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
