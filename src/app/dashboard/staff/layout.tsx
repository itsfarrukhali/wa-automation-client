import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
