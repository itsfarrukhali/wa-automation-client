"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CircleAlert,
  CircleCheck,
  MessageCircleMore,
  RefreshCw,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlatformOverview } from "@/lib/admin";

export default function PlatformAdminPage() {
  const { token, user } = useAuth();
  const overview = useQuery({
    queryKey: ["platform-admin", "overview"],
    queryFn: () => getPlatformOverview(token as string),
    enabled: Boolean(token),
  });

  if (overview.isLoading) {
    return <LoadingState />;
  }

  if (overview.isError || !overview.data) {
    return (
      <Card className="border-rose-400/20 bg-rose-400/5 text-white">
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <CircleAlert className="size-6 text-rose-300" />
          <div>
            <h1 className="font-semibold">Control plane data is unavailable</h1>
            <p className="mt-1 text-sm text-slate-400">
              Your account is signed in, but the admin API did not return a usable response.
            </p>
          </div>
          <Button variant="outline" onClick={() => overview.refetch()}>
            <RefreshCw className="size-4" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { stats, users, businesses } = overview.data;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-400">Platform overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">System health and account activity</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            This view is isolated from business dashboards. It intentionally exposes no destructive controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="border-white/10 bg-white/5 text-slate-300" variant="outline">
            {user?.role}
          </Badge>
          <Button
            variant="outline"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            onClick={() => overview.refetch()}
            disabled={overview.isFetching}
          >
            <RefreshCw className={overview.isFetching ? "size-4 animate-spin" : "size-4"} />
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Business users" value={stats.users.total} detail={`${stats.users.newLast30Days} joined in 30 days`} icon={UsersRound} />
        <Metric label="Active businesses" value={stats.businesses.active} detail={`${stats.businesses.inProgress} still onboarding`} icon={Building2} />
        <Metric label="Verified users" value={stats.users.verified} detail={`${stats.users.unverified} awaiting verification`} icon={UserRoundCheck} />
        <Metric label="WhatsApp connected" value={stats.businesses.whatsappConnected} detail={`of ${stats.businesses.total} businesses`} icon={MessageCircleMore} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DataCard title="Recent users" description={`${users.pagination.total} total user accounts`}>
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.users.map((account) => (
                <TableRow key={account._id} className="border-white/10 hover:bg-white/5">
                  <TableCell><div className="font-medium text-white">{account.name}</div><div className="text-xs text-slate-500">{account.email}</div></TableCell>
                  <TableCell className="capitalize text-slate-300">{account.role}</TableCell>
                  <TableCell><StatusBadge active={account.isActive} label={account.isActive ? "Active" : "Inactive"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataCard>

        <DataCard title="Recent businesses" description={`${businesses.pagination.total} total workspaces`}>
          <Table>
            <TableHeader><TableRow className="border-white/10 hover:bg-transparent"><TableHead>Business</TableHead><TableHead>Plan</TableHead><TableHead>Connection</TableHead></TableRow></TableHeader>
            <TableBody>
              {businesses.businesses.map((business) => (
                <TableRow key={business._id} className="border-white/10 hover:bg-white/5">
                  <TableCell><div className="font-medium text-white">{business.name}</div><div className="text-xs text-slate-500">{business.ownerId?.email ?? business.type}</div></TableCell>
                  <TableCell className="capitalize text-slate-300">{business.plan?.currentPlan ?? "free"}</TableCell>
                  <TableCell><StatusBadge active={business.whatsapp?.connectionStatus === "connected"} label={business.whatsapp?.connectionStatus ?? "not connected"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataCard>
      </section>

      <section className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-5">
        <div className="flex gap-3">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
          <div>
            <h2 className="font-medium text-amber-100">Management actions remain locked</h2>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Account suspension, plan changes, Meta controls, and deletion require an audited action reason and safer confirmation flow before they should be exposed here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: typeof UsersRound }) {
  return (
    <Card className="border-white/10 bg-white/[0.04] text-white shadow-none">
      <CardContent className="p-5">
        <div className="flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span><Icon className="size-5 text-emerald-400" /></div>
        <div className="mt-4 text-3xl font-semibold">{value.toLocaleString()}</div>
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DataCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-white/[0.04] text-white shadow-none">
      <CardHeader><CardTitle>{title}</CardTitle><p className="text-sm text-slate-500">{description}</p></CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return <Badge variant={active ? "success" : "secondary"} className="capitalize">{active && <CircleCheck className="mr-1 size-3" />}{label}</Badge>;
}

function LoadingState() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.04]" />)}</div>;
}
