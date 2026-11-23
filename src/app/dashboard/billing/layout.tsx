import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
