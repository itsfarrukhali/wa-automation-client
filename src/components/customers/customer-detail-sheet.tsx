"use client";

import { Loader2, Pencil, Phone, Mail, CalendarClock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustomer, useCustomerBookings } from "@/hooks/use-customers";
import type { Customer } from "@/lib/customers";

export function CustomerDetailSheet({
  customerId,
  onOpenChange,
  onEdit,
}: {
  customerId: string | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (customer: Customer) => void;
}) {
  const { data: customer, isLoading } = useCustomer(customerId);
  const { data: bookingsData } = useCustomerBookings(customerId);

  return (
    <Sheet open={Boolean(customerId)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !customer ? (
          <div className="grid h-full place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{customer.name}</SheetTitle>
            </SheetHeader>

            <div className="mt-4 space-y-4 px-4 pb-6">
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                <Badge
                  variant={
                    customer.status === "active" ? "success" : "secondary"
                  }
                >
                  {customer.status}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4" />
                  {customer.whatsappNumber || customer.phone}
                </div>
                {customer.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="size-4" />
                    {customer.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarClock className="size-4" />
                  Last visit:{" "}
                  {customer.lastVisit
                    ? new Date(customer.lastVisit).toLocaleDateString()
                    : "Never"}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatBox label="Visits" value={customer.totalVisits} />
                <StatBox
                  label="Appointments"
                  value={customer.totalAppointments}
                />
                <StatBox
                  label="Spent"
                  value={`Rs ${customer.totalSpent.toLocaleString()}`}
                />
              </div>

              {customer.notes && (
                <div>
                  <div className="text-sm font-medium">Notes</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {customer.notes}
                  </p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium">Recent bookings</div>
                <div className="mt-2 space-y-2">
                  {!bookingsData || bookingsData.bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No bookings yet.
                    </p>
                  ) : (
                    bookingsData.bookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="rounded-md border p-2.5 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {booking.serviceId?.name ?? "Service"}
                          </span>
                          <Badge variant="outline">{booking.status}</Badge>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleString()} · Rs{" "}
                          {booking.totalAmount.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button className="w-full" onClick={() => onEdit(customer)}>
                <Pencil className="size-4" />
                Edit customer
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-2.5 text-center">
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
