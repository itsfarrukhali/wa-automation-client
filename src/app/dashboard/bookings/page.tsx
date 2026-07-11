// src/app/dashboard/bookings/page.tsx
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBookingList, useDailySchedule } from "@/hooks/use-bookings";
import {
  STATUS_LABELS,
  type Booking,
  type BookingListParams,
  type BookingStatus,
} from "@/lib/bookings";
import { BookingFormDialog } from "@/components/bookings/booking-form-dialog";
import { BookingDetailSheet } from "@/components/bookings/booking-detail-sheet";

const ALL_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "arrived",
  "in_progress",
  "completed",
  "no_show",
  "cancelled",
  "rescheduled",
];

export default function BookingsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  const {
    data: schedule = [],
    isLoading: scheduleLoading,
    error: scheduleError,
  } = useDailySchedule(dateKey);

  const listParams: BookingListParams = useMemo(
    () => ({
      page,
      limit: 20,
      status: statusFilter || undefined,
      sortOrder: "desc",
    }),
    [page, statusFilter],
  );
  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
  } = useBookingList(listParams);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="size-4" />
          New booking
        </Button>
      </div>

      <Tabs defaultValue="day">
        <TabsList>
          <TabsTrigger value="day">Day view</TabsTrigger>
          <TabsTrigger value="all">All bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
            <Card className="w-fit">
              <CardContent className="p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  autoFocus
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-medium">
                    {format(selectedDate, "EEEE, MMMM d")}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {schedule.length} bookings
                  </span>
                </div>
                {scheduleError ? (
                  <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {scheduleError instanceof Error
                      ? scheduleError.message
                      : "Couldn't load today's schedule."}
                  </p>
                ) : scheduleLoading ? (
                  <div className="grid h-32 place-items-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedule
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(a.scheduledAt).getTime() -
                          new Date(b.scheduledAt).getTime(),
                      )
                      .map((booking) => (
                        <ScheduleRow
                          key={booking._id}
                          booking={booking}
                          onClick={() => setViewingId(booking._id)}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === "" ? "default" : "outline"}
              onClick={() => {
                setPage(1);
                setStatusFilter("");
              }}
            >
              All
            </Button>
            {ALL_STATUSES.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => {
                  setPage(1);
                  setStatusFilter(status);
                }}
              >
                {STATUS_LABELS[status]}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0">
              {listLoading ? (
                <div className="grid h-40 place-items-center">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : (listData?.bookings.length ?? 0) === 0 ? (
                <div className="grid h-40 place-items-center text-sm text-muted-foreground">
                  No bookings found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date &amp; time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listData?.bookings.map((booking) => (
                        <TableRow
                          key={booking._id}
                          className="cursor-pointer"
                          onClick={() => setViewingId(booking._id)}
                        >
                          <TableCell className="font-medium">
                            {booking.customerId?.name}
                          </TableCell>
                          <TableCell>{booking.serviceId?.name}</TableCell>
                          <TableCell>
                            {new Date(booking.scheduledAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {STATUS_LABELS[booking.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            Rs {booking.totalAmount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {listData && listData.pagination.pages > 1 && (
                <div className="flex items-center justify-between border-t p-3 text-sm text-muted-foreground">
                  <span>
                    Page {listData.pagination.page} of{" "}
                    {listData.pagination.pages}
                    {listFetching && " · updating..."}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= listData.pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <BookingFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDate={selectedDate}
      />
      <BookingDetailSheet
        bookingId={viewingId}
        onOpenChange={(open) => !open && setViewingId(null)}
      />
    </div>
  );
}

function ScheduleRow({
  booking,
  onClick,
}: {
  booking: Booking;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors hover:bg-muted/60"
    >
      <div>
        <div className="font-medium">{booking.customerId?.name}</div>
        <div className="text-xs text-muted-foreground">
          {booking.serviceId?.name}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium">
          {new Date(booking.scheduledAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <Badge variant="outline" className="mt-1">
          {STATUS_LABELS[booking.status]}
        </Badge>
      </div>
    </button>
  );
}
