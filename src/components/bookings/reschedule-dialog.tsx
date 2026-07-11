"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/bookings/date-time-picker";
import { useBusinessProfile, useRescheduleBooking } from "@/hooks/use-bookings";
import { combineDateAndTime } from "@/lib/time-slots";
import { ApiError } from "@/lib/api";
import type { Booking } from "@/lib/bookings";

export function RescheduleDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: profile } = useBusinessProfile();
  const rescheduleBooking = useRescheduleBooking();
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  async function handleSubmit() {
    if (!booking) return;
    if (!date || !time) return setFormError("Select a new date and time.");

    try {
      await rescheduleBooking.mutateAsync({
        id: booking._id,
        scheduledAt: combineDateAndTime(date, time).toISOString(),
      });
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Something went wrong",
      );
    }
  }

  return (
    <Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule booking</DialogTitle>
        </DialogHeader>
        {profile && booking?.serviceId && (
          <DateTimePicker
            date={date}
            time={time}
            onDateChange={(d) => {
              setDate(d);
              setTime(null);
            }}
            onTimeChange={setTime}
            workingHours={profile.workingHours}
            durationMinutes={booking.serviceId.duration}
            timezone={profile.timezone}
          />
        )}
        {formError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={rescheduleBooking.isPending} onClick={handleSubmit}>
            {rescheduleBooking.isPending
              ? "Rescheduling..."
              : "Confirm new time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
