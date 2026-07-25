// src/components/reports/revenue-chart.tsx
"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { RevenueReport } from "@/lib/reports";

const chartConfig: ChartConfig = {
  collected: { label: "Collected", color: "hsl(var(--primary))" },
  bookedValue: { label: "Booked value", color: "hsl(var(--muted-foreground))" },
};

export function RevenueChart({ daily }: { daily: RevenueReport["daily"] }) {
  if (daily.length === 0) {
    return (
      <div className="grid h-64 place-items-center text-sm text-muted-foreground">
        No revenue data for this range.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <AreaChart data={daily}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => format(new Date(value), "MMM d")}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `Rs ${value / 1000}k`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => format(new Date(value), "PPP")}
            />
          }
        />
        <Area
          dataKey="collected"
          type="monotone"
          fill="var(--color-collected)"
          fillOpacity={0.2}
          stroke="var(--color-collected)"
          strokeWidth={2}
        />
        <Area
          dataKey="bookedValue"
          type="monotone"
          fill="var(--color-bookedValue)"
          fillOpacity={0.1}
          stroke="var(--color-bookedValue)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      </AreaChart>
    </ChartContainer>
  );
}
