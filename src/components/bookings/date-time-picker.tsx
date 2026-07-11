"use client";

import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { generateTimeSlots } from "@/lib/time-slots";
import type { WorkingHoursDay } from "@/lib/business-profile";
import { cn } from "@/lib/utils";

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  workingHours,
  durationMinutes,
}: {
  date: Date | undefined;
  time: string | null;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  workingHours: WorkingHoursDay[];
  durationMinutes: number;
}) {
  const slots = date
    ? generateTimeSlots(workingHours, date, durationMinutes)
    : [];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <span className="text-sm font-medium">Date</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="size-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-medium">Time</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={!date}
              className={cn(
                "w-full justify-start font-normal",
                !time && "text-muted-foreground",
              )}
            >
              <Clock className="size-4" />
              {time ?? (date ? "Pick a time" : "Select date first")}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-h-64 w-48 overflow-y-auto p-2"
            align="start"
          >
            {slots.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">
                {date
                  ? "No slots available — business is closed or fully booked."
                  : ""}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {slots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    size="sm"
                    variant={time === slot ? "default" : "outline"}
                    onClick={() => onTimeChange(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
