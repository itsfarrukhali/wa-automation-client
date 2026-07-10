// src/app/dashboard/layout.tsx
import { RouteGuard } from "@/components/route-guard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <DashboardShell>{children}</DashboardShell>
    </RouteGuard>
  );
}
