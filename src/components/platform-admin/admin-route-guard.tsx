"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const { isReady, token, user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    if (!isReady) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!isAdmin) router.replace("/dashboard");
  }, [isAdmin, isReady, router, token, user]);

  if (!isReady || !token || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950">
        <Loader2 className="size-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return <>{children}</>;
}
