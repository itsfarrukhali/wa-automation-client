"use client";

import { useState } from "react";
import { Loader2, CreditCard, CalendarClock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBooking, useDeleteBooking } from "@/hooks/use-bookings";
import { STATUS_LABELS } from "@/lib/bookings";
import { StatusActions } from "@/components/bookings/status-actions";
import { RescheduleDialog } from "@/components/bookings/reschedule-dialog";
import { PaymentDialog } from "@/components/bookings/payment-dialog";
import type { Booking } from "@/lib/bookings";

export function BookingDetailSheet({
  bookingId,
  onOpenChange,
}: {
  bookingId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: booking, isLoading } = useBooking(bookingId);
  const deleteBooking = useDeleteBooking();
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(
    null,
  );
  const [paymentTarget, setPaymentTarget] = useState<Booking | null>(null);

  const canReschedule =
    booking && ["pending", "confirmed"].includes(booking.status);
  const canArchive =
    booking && ["cancelled", "rescheduled"].includes(booking.status);
  const canAddPayment =
    booking &&
    !["cancelled", "rescheduled"].includes(booking.status) &&
    booking.amountDue > 0;

  return (
    <>
      <Sheet open={Boolean(bookingId)} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {isLoading || !booking ? (
            <div className="grid h-full place-items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>{booking.serviceId?.name ?? "Booking"}</SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4 px-4 pb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    {STATUS_LABELS[booking.status]}
                  </Badge>
                  <Badge
                    variant={
                      booking.paymentStatus === "paid" ? "success" : "warning"
                    }
                  >
                    {booking.paymentStatus}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarClock className="size-4" />
                  {new Date(booking.scheduledAt).toLocaleString()}
                </div>

                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium">{booking.customerId?.name}</div>
                  <div className="text-muted-foreground">
                    {booking.customerId?.phone}
                  </div>
                  {booking.staffId && (
                    <div className="mt-1 text-muted-foreground">
                      Staff: {booking.staffId.name}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border p-2.5">
                    <div className="text-lg font-semibold">
                      Rs {booking.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="rounded-md border p-2.5">
                    <div className="text-lg font-semibold">
                      Rs {booking.amountPaid.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Paid</div>
                  </div>
                  <div className="rounded-md border p-2.5">
                    <div className="text-lg font-semibold">
                      Rs {booking.amountDue.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Due</div>
                  </div>
                </div>

                {booking.notes && (
                  <div>
                    <div className="text-sm font-medium">Notes</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.notes}
                    </p>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium">Update status</div>
                  <div className="mt-2">
                    <StatusActions booking={booking} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {canAddPayment && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPaymentTarget(booking)}
                    >
                      <CreditCard className="size-4" />
                      Record payment
                    </Button>
                  )}
                  {canReschedule && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRescheduleTarget(booking)}
                    >
                      <CalendarClock className="size-4" />
                      Reschedule
                    </Button>
                  )}
                  {canArchive && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteBooking.isPending}
                      onClick={() =>
                        deleteBooking.mutate(booking._id, {
                          onSuccess: () => onOpenChange(false),
                        })
                      }
                    >
                      {deleteBooking.isPending
                        ? "Archiving..."
                        : "Archive booking"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <RescheduleDialog
        booking={rescheduleTarget}
        onOpenChange={(open) => !open && setRescheduleTarget(null)}
      />
      <PaymentDialog
        booking={paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
      />
    </>
  );
}
