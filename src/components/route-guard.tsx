// src/components/route-guard.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getOnboardingStatus } from "@/lib/business";

export function RouteGuard({ children }: { children: ReactNode }) {
  const { token, user, isReady } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (!user.isEmailVerified) {
      router.replace("/verify-email");
      return;
    }

    let cancelled = false;
    getOnboardingStatus(token)
      .then((status) => {
        if (cancelled) return;
        if (!status.onboardingComplete) {
          router.replace(`/onboarding/step-${status.currentStep}`);
          return;
        }
        setChecked(true);
      })
      .catch(() => {
        if (!cancelled) setChecked(true); // fail open rather than infinite loop
      });

    return () => {
      cancelled = true;
    };
  }, [isReady, token, user, router]);

  if (!isReady || !checked) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
