import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
