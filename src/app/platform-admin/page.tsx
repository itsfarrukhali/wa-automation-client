"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, CircleAlert, CircleCheck, MessageCircleMore, RefreshCw, UserRoundCheck, UsersRound } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlatformOverview, setPlatformBusinessActive, setPlatformBusinessVerified, setPlatformUserActive, verifyPlatformUserEmail, type PlatformBusiness, type PlatformUser } from "@/lib/admin";

type AdminAction =
  | { kind: "user-status"; target: PlatformUser; nextValue: boolean }
  | { kind: "user-verify"; target: PlatformUser }
  | { kind: "business-status"; target: PlatformBusiness; nextValue: boolean }
  | { kind: "business-verify"; target: PlatformBusiness; nextValue: boolean };

export default function PlatformAdminPage() {
  const { token, user } = useAuth();
  const [pendingAction, setPendingAction] = useState<AdminAction | null>(null);
  const [actionError, setActionError] = useState("");
  const overview = useQuery({
    queryKey: ["platform-admin", "overview"],
    queryFn: () => getPlatformOverview(token as string),
    enabled: Boolean(token),
  });
  const action = useMutation({
    mutationFn: async (value: AdminAction) => {
      if (value.kind === "user-status") return setPlatformUserActive(value.target._id, value.nextValue, token as string);
      if (value.kind === "user-verify") return verifyPlatformUserEmail(value.target._id, token as string);
      if (value.kind === "business-status") return setPlatformBusinessActive(value.target._id, value.nextValue, token as string);
      return setPlatformBusinessVerified(value.target._id, value.nextValue, token as string);
    },
    onSuccess: async () => {
      setPendingAction(null);
      setActionError("");
      await overview.refetch();
    },
    onError: (error) => setActionError(error instanceof Error ? error.message : "Action failed"),
  });

  if (overview.isLoading) return <LoadingState />;

  if (overview.isError || !overview.data) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="flex flex-col items-start gap-4 p-6">
          <CircleAlert className="size-6 text-destructive" />
          <div><h1 className="font-semibold">Platform data is unavailable</h1><p className="mt-1 text-sm text-muted-foreground">Your account is signed in, but the admin API did not return a usable response.</p></div>
          <Button variant="outline" onClick={() => overview.refetch()}><RefreshCw className="size-4" /> Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const { stats, users, businesses } = overview.data;

  return (
    <div className="min-w-0 space-y-8">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-primary">Platform overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">System health and account activity</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Review platform activity and manage reversible account and business access controls.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{user?.role}</Badge>
          <Button variant="outline" onClick={() => overview.refetch()} disabled={overview.isFetching}><RefreshCw className={overview.isFetching ? "size-4 animate-spin" : "size-4"} />Refresh</Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Business users" value={stats.users.total} detail={`${stats.users.newLast30Days} joined in 30 days`} icon={UsersRound} />
        <Metric label="Active businesses" value={stats.businesses.active} detail={`${stats.businesses.inProgress} still onboarding`} icon={Building2} />
        <Metric label="Verified users" value={stats.users.verified} detail={`${stats.users.unverified} awaiting verification`} icon={UserRoundCheck} />
        <Metric label="WhatsApp connected" value={stats.businesses.whatsappConnected} detail={`of ${stats.businesses.total} businesses`} icon={MessageCircleMore} />
      </section>

      <section className="grid min-w-0 gap-6 xl:grid-cols-2">
        <DataCard title="Recent users" description={`${users.pagination.total} total user accounts`}>
          <Table>
            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.users.map((account) => (
                <TableRow key={account._id}>
                  <TableCell><div className="font-medium">{account.name}</div><div className="text-xs text-muted-foreground">{account.email}</div></TableCell>
                  <TableCell className="capitalize">{account.role}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1"><StatusBadge active={account.isActive} label={account.isActive ? "Active" : "Inactive"} /><StatusBadge active={account.isEmailVerified} label={account.isEmailVerified ? "Verified" : "Unverified"} /></div></TableCell>
                  <TableCell><div className="flex min-w-44 justify-end gap-2">
                    {!account.isEmailVerified && canManageUser(user?.role, account.role) && <Button size="sm" variant="outline" onClick={() => openAction(setPendingAction, setActionError, { kind: "user-verify", target: account })}>Verify email</Button>}
                    {canManageUser(user?.role, account.role) && <Button size="sm" variant="outline" onClick={() => openAction(setPendingAction, setActionError, { kind: "user-status", target: account, nextValue: !account.isActive })}>{account.isActive ? "Deactivate" : "Activate"}</Button>}
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataCard>

        <DataCard title="Recent businesses" description={`${businesses.pagination.total} total workspaces`}>
          <Table>
            <TableHeader><TableRow><TableHead>Business</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {businesses.businesses.map((business) => (
                <TableRow key={business._id}>
                  <TableCell><div className="font-medium">{business.name}</div><div className="text-xs text-muted-foreground">{business.ownerId?.email ?? business.type}</div></TableCell>
                  <TableCell className="capitalize">{business.plan?.currentPlan ?? "free"}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1"><StatusBadge active={business.isActive} label={business.isActive ? "Active" : "Inactive"} /><StatusBadge active={business.isVerified} label={business.isVerified ? "Verified" : "Unverified"} /></div></TableCell>
                  <TableCell><div className="flex min-w-44 justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => openAction(setPendingAction, setActionError, { kind: "business-verify", target: business, nextValue: !business.isVerified })}>{business.isVerified ? "Unverify" : "Verify"}</Button>
                    <Button size="sm" variant="outline" onClick={() => openAction(setPendingAction, setActionError, { kind: "business-status", target: business, nextValue: !business.isActive })}>{business.isActive ? "Deactivate" : "Activate"}</Button>
                  </div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataCard>
      </section>

      <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
        <div className="flex gap-3"><CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" /><div><h2 className="font-medium text-amber-900">Sensitive actions remain locked</h2><p className="mt-1 text-sm leading-6 text-amber-800">Role changes, plan changes, password resets, Meta controls, and deletion still require an action reason and stronger audit workflow.</p></div></div>
      </section>

      {actionError && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{actionError}</div>}

      <AlertDialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && !action.isPending && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{actionTitle(pendingAction)}</AlertDialogTitle><AlertDialogDescription>{actionDescription(pendingAction)}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={action.isPending}>Cancel</AlertDialogCancel><AlertDialogAction disabled={action.isPending} onClick={(event) => { event.preventDefault(); if (pendingAction) action.mutate(pendingAction); }}>{action.isPending ? "Saving..." : "Confirm"}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon }: { label: string; value: number; detail: string; icon: typeof UsersRound }) {
  return <Card><CardContent className="p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><Icon className="size-5 text-primary" /></div><div className="mt-4 text-3xl font-semibold">{value.toLocaleString()}</div><p className="mt-1 text-xs text-muted-foreground">{detail}</p></CardContent></Card>;
}

function DataCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card className="min-w-0 overflow-hidden"><CardHeader><CardTitle>{title}</CardTitle><p className="text-sm text-muted-foreground">{description}</p></CardHeader><CardContent className="p-0">{children}</CardContent></Card>;
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return <Badge variant={active ? "success" : "secondary"} className="capitalize">{active && <CircleCheck className="mr-1 size-3" />}{label}</Badge>;
}

function LoadingState() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl border bg-white" />)}</div>;
}

function canManageUser(actorRole: string | undefined, targetRole: PlatformUser["role"]) {
  if (actorRole === "superadmin") return targetRole !== "superadmin";
  return actorRole === "admin" && (targetRole === "owner" || targetRole === "staff");
}

function openAction(setAction: (value: AdminAction) => void, setError: (value: string) => void, value: AdminAction) {
  setError("");
  setAction(value);
}

function actionTitle(value: AdminAction | null) {
  if (!value) return "Confirm action";
  if (value.kind === "user-status") return `${value.nextValue ? "Activate" : "Deactivate"} ${value.target.name}?`;
  if (value.kind === "user-verify") return `Verify ${value.target.name}'s email?`;
  if (value.kind === "business-status") return `${value.nextValue ? "Activate" : "Deactivate"} ${value.target.name}?`;
  return `${value.nextValue ? "Verify" : "Unverify"} ${value.target.name}?`;
}

function actionDescription(value: AdminAction | null) {
  if (!value) return "Review this action before continuing.";
  if (value.kind === "user-status" && !value.nextValue) return "This immediately blocks the user and invalidates active sessions.";
  if (value.kind === "business-status" && !value.nextValue) return "This disables the business workspace until it is activated again.";
  return "This change is reversible from the platform administration page.";
}
