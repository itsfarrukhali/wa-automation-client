import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function CampaignsLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
