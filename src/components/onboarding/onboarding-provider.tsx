// src/components/onboarding/onboarding-provider.tsx
"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getOnboardingStatus, type OnboardingStatus } from "@/lib/business";

type OnboardingContextValue = {
  status: OnboardingStatus;
  token: string;
  refresh: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { token, user, isReady } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const result = await getOnboardingStatus(token);
      if (result.onboardingComplete) {
        router.replace("/dashboard");
        return;
      }
      setStatus(result);
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    }
  }, [token, router]);

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
    load();
  }, [isReady, token, user, router, load]);

  if (!isReady || (!status && !loadFailed)) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadFailed || !status || !token) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div className="max-w-sm space-y-2">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load your onboarding status.
          </p>
          <button
            className="text-sm font-medium text-primary underline"
            onClick={() => load()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContext.Provider value={{ status, token, refresh: load }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx)
    throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}
