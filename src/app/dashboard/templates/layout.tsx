import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
