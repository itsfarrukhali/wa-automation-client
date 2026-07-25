// src/app/dashboard/reports/page.tsx
"use client";

import { useState } from "react";
import {
  Loader2,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useBookingReport,
  useCustomerReport,
  useOverviewReport,
  useRevenueReport,
} from "@/hooks/use-reports";
import { DateRangeSelector } from "@/components/reports/date-range-selector";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { BookingStatusChart } from "@/components/reports/booking-status-chart";
import type { DateRangeParams } from "@/lib/reports";

export default function ReportsPage() {
  const [range, setRange] = useState<DateRangeParams>({ days: 30 });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <DateRangeSelector value={range} onChange={setRange} />
          <OverviewTab range={range} />
        </TabsContent>

        <TabsContent value="revenue" className="mt-4 space-y-4">
          <DateRangeSelector value={range} onChange={setRange} />
          <RevenueTab range={range} />
        </TabsContent>

        <TabsContent value="bookings" className="mt-4 space-y-4">
          <DateRangeSelector value={range} onChange={setRange} />
          <BookingsTab range={range} />
        </TabsContent>

        <TabsContent value="customers" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Segment breakdown reflects your full customer base, not a date
            range.
          </p>
          <CustomersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab({ range }: { range: DateRangeParams }) {
  const { data, isLoading } = useOverviewReport(range);
  if (isLoading || !data) return <LoadingBlock />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarIcon}
          label="Bookings"
          value={data.bookings.total}
          detail={`${Math.round(data.bookings.completionRate)}% completed`}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue collected"
          value={`Rs ${data.revenue.collected.toLocaleString()}`}
          detail={`Rs ${data.revenue.bookedValue.toLocaleString()} booked`}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={data.customers.total}
          detail={`${Math.round(data.customers.optInRate)}% opted in`}
        />
        <StatCard
          icon={MessageSquare}
          label="Messages sent"
          value={data.messages.total}
          detail={`${Math.round(data.messages.deliveryRate)}% delivered`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <RowStat label="Completed" value={data.bookings.completed} />
            <RowStat label="Upcoming" value={data.bookings.upcoming} />
            <RowStat label="Cancelled" value={data.bookings.cancelled} />
            <RowStat label="No-show" value={data.bookings.noShow} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaign performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <RowStat label="Campaigns run" value={data.campaigns.total} />
            <RowStat label="Sent" value={data.campaigns.sent} />
            <RowStat
              label="Read rate"
              value={`${Math.round(data.campaigns.readRate)}%`}
            />
            <RowStat label="Failed" value={data.campaigns.failed} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RevenueTab({ range }: { range: DateRangeParams }) {
  const { data, isLoading } = useRevenueReport(range);
  if (isLoading || !data) return <LoadingBlock />;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={TrendingUp}
          label="Collected"
          value={`Rs ${data.totals.collected.toLocaleString()}`}
        />
        <StatCard
          icon={CalendarIcon}
          label="Booked value"
          value={`Rs ${data.totals.bookedValue.toLocaleString()}`}
        />
        <StatCard icon={Users} label="Bookings" value={data.totals.bookings} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart daily={data.daily} />
        </CardContent>
      </Card>
    </div>
  );
}

function BookingsTab({ range }: { range: DateRangeParams }) {
  const { data, isLoading } = useBookingReport(range);
  if (isLoading || !data) return <LoadingBlock />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">By status</CardTitle>
        </CardHeader>
        <CardContent>
          <BookingStatusChart byStatus={data.byStatus} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top services</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.topServices.length === 0 ? (
            <div className="grid h-40 place-items-center text-sm text-muted-foreground">
              No bookings in this range.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topServices.map((service) => (
                  <TableRow key={service.service}>
                    <TableCell className="font-medium">
                      {service.service ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      {service.bookings}
                    </TableCell>
                    <TableCell className="text-right">
                      Rs {service.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersTab() {
  const { data, isLoading } = useCustomerReport();
  if (isLoading || !data) return <LoadingBlock />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Segments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.segments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tagged customers yet.
            </p>
          ) : (
            data.segments.map((segment) => (
              <div
                key={segment.tag}
                className="flex items-center justify-between rounded-md border p-2.5 text-sm"
              >
                <Badge variant="outline">{segment.tag}</Badge>
                <span className="font-medium">{segment.count}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top customers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.topCustomers.length === 0 ? (
            <div className="grid h-40 place-items-center text-sm text-muted-foreground">
              No customer data yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.totalVisits}
                    </TableCell>
                    <TableCell className="text-right">
                      Rs {customer.totalSpent.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <Icon className="size-4 text-primary" />
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
        {detail && (
          <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
        )}
      </CardContent>
    </Card>
  );
}

function RowStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="grid h-40 place-items-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
