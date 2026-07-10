// src/components/onboarding-guard.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getOnboardingStatus, type OnboardingStatus } from "@/lib/business";

export function OnboardingGuard({
  children,
}: {
  children: (status: OnboardingStatus) => ReactNode;
}) {
  const { token, user, isReady } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);

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
    getOnboardingStatus(token).then((result) => {
      if (cancelled) return;
      if (result.onboardingComplete) {
        router.replace("/dashboard");
        return;
      }
      setStatus(result);
    });

    return () => {
      cancelled = true;
    };
  }, [isReady, token, user, router]);

  if (!isReady || !status) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children(status)}</>;
}
