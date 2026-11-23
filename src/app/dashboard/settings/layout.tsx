import { OwnerRouteGuard } from "@/components/owner-route-guard";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <OwnerRouteGuard>{children}</OwnerRouteGuard>;
}
