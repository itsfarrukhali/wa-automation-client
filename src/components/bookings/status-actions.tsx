"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/onboarding/field";
import { useUpdateBookingStatus } from "@/hooks/use-bookings";
import {
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  type Booking,
  type BookingStatus,
  type CancellationReason,
} from "@/lib/bookings";

const CANCELLATION_REASONS: CancellationReason[] = [
  "customer_request",
  "staff_unavailable",
  "weather",
  "emergency",
  "double_booked",
  "payment_issue",
  "other",
];

export function StatusActions({ booking }: { booking: Booking }) {
  const updateStatus = useUpdateBookingStatus();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [reason, setReason] = useState<CancellationReason>("customer_request");
  const [rating, setRating] = useState(5);

  const nextStatuses = STATUS_TRANSITIONS[booking.status];
  if (nextStatuses.length === 0) return null;

  function handleTransition(nextStatus: BookingStatus) {
    if (nextStatus === "cancelled") return setCancelDialogOpen(true);
    if (nextStatus === "completed") return setCompleteDialogOpen(true);
    updateStatus.mutate({ id: booking._id, status: nextStatus });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={status === "cancelled" ? "outline" : "default"}
            className={
              status === "cancelled"
                ? "text-destructive hover:text-destructive"
                : undefined
            }
            disabled={updateStatus.isPending}
            onClick={() => handleTransition(status)}
          >
            Mark as {STATUS_LABELS[status]}
          </Button>
        ))}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel booking</DialogTitle>
          </DialogHeader>
          <Field label="Reason">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as CancellationReason)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {CANCELLATION_REASONS.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Back
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={updateStatus.isPending}
              onClick={() => {
                updateStatus.mutate(
                  { id: booking._id, status: "cancelled", reason },
                  { onSuccess: () => setCancelDialogOpen(false) },
                );
              }}
            >
              {updateStatus.isPending
                ? "Cancelling..."
                : "Confirm cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Complete booking</DialogTitle>
          </DialogHeader>
          <Field label="Customer rating (optional)">
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} star{value !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </Field>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompleteDialogOpen(false)}
            >
              Back
            </Button>
            <Button
              disabled={updateStatus.isPending}
              onClick={() => {
                updateStatus.mutate(
                  {
                    id: booking._id,
                    status: "completed",
                    feedback: { rating },
                  },
                  { onSuccess: () => setCompleteDialogOpen(false) },
                );
              }}
            >
              {updateStatus.isPending ? "Saving..." : "Mark completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
