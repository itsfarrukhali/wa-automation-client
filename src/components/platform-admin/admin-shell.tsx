"use client";

import { Activity, LogOut, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await auth.logout();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="grid size-10 place-items-center rounded-xl bg-emerald-400 text-sm font-black text-slate-950">
            Z
          </div>
          <div>
            <div className="flex items-center gap-2 font-semibold">
              Zario control plane
              <ShieldCheck className="size-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">Platform operations · restricted access</p>
          </div>
          <div className="ml-auto hidden items-center gap-2 text-xs text-slate-400 sm:flex">
            <Activity className="size-4 text-emerald-400" />
            Read-only operations view
          </div>
          <Button
            variant="outline"
            size="icon"
            className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            aria-label="Log out"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">{children}</div>
    </main>
  );
}
