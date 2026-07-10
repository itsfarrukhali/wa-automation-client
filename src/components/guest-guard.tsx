// src/components/guest-guard.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

/**
 * Wraps /login, /signup, /forgot-password, /reset-password.
 * proxy.ts already redirects logged-in users away at the edge using the
 * session hint cookie — this is the client-side confirmation in case the
 * hint cookie is stale (e.g. token expired but cookie not yet cleared).
 */
export function GuestGuard({ children }: { children: ReactNode }) {
  const { token, user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (token && user) {
      router.replace("/dashboard");
    }
  }, [isReady, token, user, router]);

  if (!isReady) return null;
  if (token && user) return null;

  return <>{children}</>;
}
