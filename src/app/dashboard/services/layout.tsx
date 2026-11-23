import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
