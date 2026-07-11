// src/components/dashboard/overview-content.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Inbox,
  MessageSquareText,
  MoreHorizontal,
  Send,
  Sparkles,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, SortButton } from "@/components/data-table";
import {
  useBookings,
  useConversations,
  useCustomers,
} from "@/hooks/use-dashboard-data";
import type { Booking, Customer } from "@/lib/mock-data";

export function OverviewContent() {
  const auth = useAuth();
  const inbox = useConversations(auth.token);
  const bookingQuery = useBookings(auth.token);
  const customerQuery = useCustomers(auth.token);

  const bookings = bookingQuery.data ?? [];
  const customers = customerQuery.data ?? [];
  const conversations = inbox.data ?? [];

  const bookingColumns = useMemo<ColumnDef<Booking>[]>(
    () => [
      {
        accessorKey: "customer",
        header: ({ column }) => (
          <SortButton
            label="Customer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
      },
      { accessorKey: "service", header: "Service" },
      { accessorKey: "staff", header: "Staff" },
      {
        accessorKey: "date",
        header: ({ column }) => (
          <SortButton
            label="Time"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = row.original.amount;
          return amount != null ? `Rs ${amount.toLocaleString()}` : "—";
        },
      },
    ],
    [],
  );

  const customerColumns = useMemo<ColumnDef<Customer>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortButton
            label="Name"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
      },
      { accessorKey: "phone", header: "Phone" },
      { accessorKey: "visits", header: "Visits" },
      { accessorKey: "lastSeen", header: "Last seen" },
      {
        accessorKey: "tag",
        header: "Segment",
        cell: ({ row }) => <Badge variant="outline">{row.original.tag}</Badge>,
      },
    ],
    [],
  );

  if (!auth.user) return null;
  const user = auth.user;

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal md:text-3xl">
            {user.name.split(" ")[0]}&apos;s workspace
          </h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button>
            <Send className="size-4" />
            New campaign
          </Button>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Open chats"
          value={conversations.filter((c) => c.status === "open").length}
          detail="Need staff reply"
          icon={Inbox}
        />
        <Metric
          title="Today revenue"
          value="Rs 17.5k"
          detail="3 paid bookings"
          icon={CreditCard}
        />
        <Metric
          title="Confirmations"
          value="86%"
          detail="Last 7 days"
          icon={CheckCircle2}
        />
        <Metric
          title="Automations"
          value="12"
          detail="8 currently active"
          icon={Zap}
        />
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bookings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Schedule, payment, and staff handoff.
              </p>
            </div>
            <Button variant="outline" size="sm">
              <CalendarDays className="size-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={bookingColumns}
              data={bookings}
              searchKey="customer"
              searchPlaceholder="Filter bookings"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest customer conversations.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{conversation.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {conversation.phone}
                    </div>
                  </div>
                  <Badge
                    variant={
                      conversation.status === "open" ? "warning" : "secondary"
                    }
                  >
                    {conversation.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {conversation.lastMessage}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{conversation.intent}</span>
                  <span>{conversation.time}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Segments you can actually act on.
            </p>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={customerColumns}
              data={customers}
              searchKey="name"
              searchPlaceholder="Filter customers"
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign queue</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More campaign options"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <CampaignRow
                title="July reactivation"
                meta="212 recipients"
                progress="Ready"
              />
              <CampaignRow
                title="Booking reminder"
                meta="Auto daily, 8 PM"
                progress="Live"
              />
              <CampaignRow
                title="Eid offer follow-up"
                meta="Draft"
                progress="Needs review"
              />
            </CardContent>
          </Card>

          <Card className="border-foreground/10 bg-foreground text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-4" />
                Plan health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">
                Business plan is active. WhatsApp template sync is due before
                the next campaign.
              </p>
              <Button className="mt-4 bg-white text-foreground hover:bg-white/90">
                Review billing
                <ChevronRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function Metric({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: typeof Inbox;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">{title}</div>
          <Icon className="size-4 text-primary" />
        </div>
        <div className="mt-3 text-2xl font-semibold">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{detail}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const variant =
    status === "confirmed"
      ? "success"
      : status === "pending"
        ? "warning"
        : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function CampaignRow({
  title,
  meta,
  progress,
}: {
  title: string;
  meta: string;
  progress: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex items-center gap-3">
        <div className="grid size-8 place-items-center rounded-md bg-accent text-accent-foreground">
          <MessageSquareText className="size-4" />
        </div>
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">{meta}</div>
        </div>
      </div>
      <Badge variant="outline">{progress}</Badge>
    </div>
  );
}
