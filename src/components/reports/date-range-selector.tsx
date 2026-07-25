// src/components/reports/date-range-selector.tsx
"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRangeParams } from "@/lib/reports";

const PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRangeParams;
  onChange: (params: DateRangeParams) => void;
}) {
  const isCustom = Boolean(value.dateFrom || value.dateTo);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.days}
          size="sm"
          variant={
            !isCustom && value.days === preset.days ? "default" : "outline"
          }
          onClick={() => onChange({ days: preset.days })}
        >
          {preset.label}
        </Button>
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant={isCustom ? "default" : "outline"}>
            <CalendarIcon className="size-4" />
            {isCustom
              ? `${value.dateFrom ? format(new Date(value.dateFrom), "MMM d") : "..."} – ${value.dateTo ? format(new Date(value.dateTo), "MMM d") : "..."}`
              : "Custom range"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: value.dateFrom ? new Date(value.dateFrom) : undefined,
              to: value.dateTo ? new Date(value.dateTo) : undefined,
            }}
            onSelect={(range) =>
              onChange({
                dateFrom: range?.from?.toISOString(),
                dateTo: range?.to?.toISOString(),
                days: undefined,
              })
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
