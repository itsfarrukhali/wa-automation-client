// src/components/dashboard/dashboard-shell.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Scissors,
  Search,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { logout as logoutRequest } from "@/lib/auth";
import { cn } from "@/lib/utils";

function getNavItems(role: string | undefined) {
  const base = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
    { label: "Services", href: "/dashboard/services", icon: Scissors },
    { label: "Bookings", href: "/dashboard/bookings", icon: CalendarDays },
    { label: "Customers", href: "/dashboard/customers", icon: Users },
    { label: "Templates", href: "/dashboard/templates", icon: FileText },
    { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
    { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ];
  if (role === "owner") {
    base.splice(5, 0, {
      label: "Staff",
      href: "/dashboard/staff",
      icon: UserCog,
    });
  }
  return base;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!auth.user) return null;
  const user = auth.user;

  async function handleLogout() {
    try {
      await logoutRequest(auth.token);
    } finally {
      auth.clearSession();
      router.replace("/login");
    }
  }

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf8f1_0%,#f5f7f6_45%,#ffffff_100%)]">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r bg-white/75 px-4 py-5 backdrop-blur lg:block">
          <Brand />
          <nav className="mt-8 space-y-1">
            {getNavItems(user.role).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive(item.href) &&
                    "bg-foreground text-white hover:bg-foreground hover:text-white",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b bg-white/80 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="lg:hidden">
                <Brand compact />
              </div>
              <div className="hidden min-w-72 items-center gap-2 rounded-md border bg-white px-3 md:flex">
                <Search className="size-4 text-muted-foreground" />
                <input
                  className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search customers, bookings, messages"
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="icon"
                  aria-label="Settings"
                >
                  <Link href="/dashboard/settings">
                    <Settings className="size-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Logout"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                </Button>
                <div className="grid size-9 place-items-center rounded-md bg-foreground text-sm font-semibold text-white">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
              {getNavItems(user.role).map((item) => (
                <Button
                  key={item.label}
                  asChild
                  variant={isActive(item.href) ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                >
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 md:px-6">
            {!user.isEmailVerified && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Verify your email to unlock live bookings, messages, campaigns,
                and reports.
              </div>
            )}
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-white">
        Z
      </div>
      {!compact && (
        <div>
          <div className="font-semibold">Zario</div>
          <div className="text-xs text-muted-foreground">Automation desk</div>
        </div>
      )}
    </div>
  );
}
