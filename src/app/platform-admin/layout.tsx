import { AdminRouteGuard } from "@/components/platform-admin/admin-route-guard";
import { AdminShell } from "@/components/platform-admin/admin-shell";

export default function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <AdminShell>{children}</AdminShell>
    </AdminRouteGuard>
  );
}
