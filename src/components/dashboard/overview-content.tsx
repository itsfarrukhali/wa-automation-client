"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, ChevronRight, Inbox, MessageSquareText, Send, Users, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { DataTable, SortButton } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingList } from "@/hooks/use-bookings";
import { useCampaignList } from "@/hooks/use-campaigns";
import { useCustomerList } from "@/hooks/use-customers";
import { useDashboardStats } from "@/hooks/use-dashboard-data";
import { useInbox } from "@/hooks/use-messages";
import type { Booking } from "@/lib/bookings";
import type { Customer } from "@/lib/customers";

export function OverviewContent() {
  const auth = useAuth();
  const isOwner = auth.user?.role === "owner";
  const statsQuery = useDashboardStats(auth.token);
  const bookingQuery = useBookingList({ page: 1, limit: 5, sortOrder: "desc" });
  const customerQuery = useCustomerList({ page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" });
  const inboxQuery = useInbox({ status: "all" });
  const campaignQuery = useCampaignList(
    { page: 1, limit: 3 },
    { enabled: isOwner },
  );

  const stats = statsQuery.data;
  const bookings = bookingQuery.data?.bookings ?? [];
  const customers = customerQuery.data?.customers ?? [];
  const conversations = inboxQuery.data?.conversations ?? [];
  const campaigns = campaignQuery.data?.campaigns ?? [];
  const firstError = [
    statsQuery.error,
    bookingQuery.error,
    customerQuery.error,
    inboxQuery.error,
    isOwner ? campaignQuery.error : null,
  ].find(Boolean);

  const bookingColumns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        id: "customer",
        accessorFn: (booking) => booking.customerId?.name ?? "Unknown customer",
        header: ({ column }) => <SortButton label="Customer" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />,
      },
      { id: "service", accessorFn: (booking) => booking.serviceId?.name ?? "Unknown service", header: "Service" },
      {
        id: "scheduledAt",
        accessorFn: (booking) => booking.scheduledAt,
        header: "Time",
        cell: ({ row }) => new Date(row.original.scheduledAt).toLocaleString(),
      },
      { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
      { accessorKey: "totalAmount", header: "Amount", cell: ({ row }) => `Rs ${row.original.totalAmount.toLocaleString()}` },
    ],
    [],
  );

  const customerColumns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortButton label="Name" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} />,
      },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "totalVisits", header: "Visits" },
      {
        accessorKey: "lastVisit",
        header: "Last visit",
        cell: ({ row }) => row.original.lastVisit ? new Date(row.original.lastVisit).toLocaleDateString() : "Never",
      },
      {
        id: "segment",
        accessorFn: (customer) => customer.tags[0] ?? "unsegmented",
        header: "Segment",
        cell: ({ row }) => <Badge variant="outline">{row.original.tags[0] ?? "Unsegmented"}</Badge>,
      },
    ],
    [],
  );

  if (!auth.user) return null;

  return (
    <div className="min-w-0 overflow-x-hidden">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal md:text-3xl">
            {auth.user.name.split(" ")[0]}&apos;s workspace
          </h1>
        </div>
        {isOwner && (
          <Button asChild>
            <Link href="/dashboard/campaigns"><Send className="size-4" />New campaign</Link>
          </Button>
        )}
      </section>

      {firstError && (
        <div role="alert" className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Some dashboard data could not be loaded. {errorMessage(firstError)}
        </div>
      )}

      <section className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Needs reply" value={queryValue(inboxQuery.isLoading, conversations.filter((item) => item.needsHuman).length)} detail="Open WhatsApp conversations" icon={Inbox} />
        <Metric title="Today's bookings" value={queryValue(statsQuery.isLoading, stats?.bookings.today)} detail={`${stats?.bookings.pending ?? 0} pending overall`} icon={CalendarDays} />
        <Metric title="Customers" value={queryValue(statsQuery.isLoading, stats?.customers.total)} detail={`${stats?.customers.active ?? 0} active in 30 days`} icon={Users} />
        <Metric title="Messages this month" value={queryValue(statsQuery.isLoading, stats?.messages.thisMonth)} detail={`${stats?.messages.failed ?? 0} failed`} icon={MessageSquareText} />
      </section>

      <section className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Recent bookings</CardTitle><p className="text-sm text-muted-foreground">Latest appointments and payment values.</p></div>
            <Button variant="outline" size="sm" asChild><Link href="/dashboard/bookings"><CalendarDays className="size-4" />Manage</Link></Button>
          </CardHeader>
          <CardContent className="min-w-0 px-3 sm:px-6"><DataTable columns={bookingColumns} data={bookings} searchKey="customer" searchPlaceholder="Filter bookings" /></CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader><CardTitle>Inbox</CardTitle><p className="text-sm text-muted-foreground">Latest customer conversations.</p></CardHeader>
          <CardContent className="space-y-3">
            {conversations.length === 0 && !inboxQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">No conversations yet.</p>
            ) : conversations.slice(0, 5).map((conversation) => (
              <Link key={conversation.customer._id} href="/dashboard/inbox" className="block rounded-md border p-3 transition-colors hover:bg-muted/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="truncate font-medium">{conversation.customer.name}</div><div className="truncate text-xs text-muted-foreground">{conversation.lastMessage.content ?? "Media message"}</div></div>
                  {conversation.needsHuman && <Badge variant="warning">Needs reply</Badge>}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader><CardTitle>Recent customers</CardTitle><p className="text-sm text-muted-foreground">Newly added customer records and segments.</p></CardHeader>
          <CardContent className="min-w-0 px-3 sm:px-6"><DataTable columns={customerColumns} data={customers} searchKey="name" searchPlaceholder="Filter customers" /></CardContent>
        </Card>

        <div className="space-y-4">
          {isOwner && <Card className="min-w-0 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign queue</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link href="/dashboard/campaigns">View all<ChevronRight className="size-4" /></Link></Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaigns.length === 0 && !campaignQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">No campaigns yet.</p>
              ) : campaigns.map((campaign) => (
                <CampaignRow key={campaign._id} title={campaign.name} meta={`${campaign.metrics.eligibleRecipients ?? 0} recipients`} progress={campaign.status} />
              ))}
            </CardContent>
          </Card>}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {stats?.business.whatsappConnected ? <Wifi className="size-4 text-emerald-600" /> : <WifiOff className="size-4 text-destructive" />}
                Account health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {stats?.business.whatsappConnected ? "WhatsApp is connected." : "WhatsApp is not connected."} Current plan: {stats?.plan.current ?? "loading"}.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {stats?.plan.messagesUsed ?? 0} of {formatLimit(stats?.plan.messagesLimit)} messages used this month
              </p>
              <Button className="mt-4" variant="outline" asChild><Link href="/dashboard/billing">Review billing<ChevronRight className="size-4" /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, detail, icon: Icon }: { title: string; value: string | number; detail: string; icon: typeof Inbox }) {
  return <Card className="min-w-0 overflow-hidden"><CardContent className="min-w-0 p-4"><div className="flex min-w-0 items-center justify-between gap-3"><div className="min-w-0 text-sm text-muted-foreground">{title}</div><Icon className="size-4 shrink-0 text-primary" /></div><div className="mt-3 break-words text-xl font-semibold sm:text-2xl">{value}</div><div className="mt-1 break-words text-xs text-muted-foreground">{detail}</div></CardContent></Card>;
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const variant = status === "completed" || status === "confirmed" ? "success" : status === "pending" ? "warning" : "secondary";
  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
}

function CampaignRow({ title, meta, progress }: { title: string; meta: string; progress: string }) {
  return <div className="flex items-center justify-between gap-3 rounded-md border p-3"><div className="min-w-0"><div className="truncate text-sm font-medium">{title}</div><div className="text-xs text-muted-foreground">{meta}</div></div><Badge variant="outline">{progress.replace("_", " ")}</Badge></div>;
}

function queryValue(isLoading: boolean, value?: number) {
  return isLoading ? "..." : (value ?? 0).toLocaleString();
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please refresh and try again.";
}

function formatLimit(limit?: number) {
  if (limit === -1) return "unlimited";
  return (limit ?? 0).toLocaleString();
}
