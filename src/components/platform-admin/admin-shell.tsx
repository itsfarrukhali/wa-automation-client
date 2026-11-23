"use client";

import { Activity, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await auth.logout();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-foreground">
      <header className="border-b bg-white/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <BrandMark />
          <div>
            <div className="flex items-center gap-2 font-semibold">
              Platform administration
              <ShieldCheck className="size-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">Restricted Zario operations</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <Activity className="size-4 text-primary" />
            Live platform data
          </div>
          <Button
            variant="outline"
            size="icon"
            aria-label="Log out"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
    </main>
  );
}
