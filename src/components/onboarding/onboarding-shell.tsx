// src/components/onboarding/onboarding-shell.tsx
"use client";

import { Check } from "lucide-react";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Basic Info",
  "Location",
  "Working Hours",
  "Engagement",
  "WhatsApp",
];

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const { status } = useOnboarding();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-white">
            Z
          </div>
          <div>
            <div className="font-semibold">{status.businessName}</div>
            <div className="text-xs text-muted-foreground">
              Let&apos;s finish setting up your workspace
            </div>
          </div>
        </div>

        <ol className="mb-8 flex items-center gap-2">
          {STEP_LABELS.map((label, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < status.currentStep;
            const isCurrent = stepNumber === status.currentStep;

            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-medium",
                    isCompleted && "border-primary bg-primary text-white",
                    isCurrent && !isCompleted && "border-primary text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="size-3.5" /> : stepNumber}
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      isCompleted ? "bg-primary" : "bg-muted-foreground/20",
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {children}
      </div>
    </main>
  );
}
