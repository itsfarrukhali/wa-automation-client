// src/app/onboarding/step-3/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { useStepGuard } from "@/components/onboarding/use-step-guard";
import { patchOnboardingStep } from "@/lib/business";
import { ApiError } from "@/lib/api";
import { WEEK_DAYS } from "@/lib/constants";

type DayHours = {
  day: (typeof WEEK_DAYS)[number]["value"];
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

const DEFAULT_HOURS: DayHours[] = WEEK_DAYS.map(({ value }) => ({
  day: value,
  isOpen: value !== "sun",
  openTime: "09:00",
  closeTime: "18:00",
}));

export default function OnboardingStep3Page() {
  useStepGuard(3);
  const { token, refresh } = useOnboarding();
  const router = useRouter();
  const [hours, setHours] = useState<DayHours[]>(DEFAULT_HOURS);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateDay(index: number, patch: Partial<DayHours>) {
    setHours((prev) =>
      prev.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    );
  }

  async function handleSubmit() {
    setFormError("");

    const invalidDay = hours.find(
      (day) => day.isOpen && (!day.openTime || !day.closeTime),
    );
    if (invalidDay) {
      setFormError("Open and close times are required for every open day.");
      return;
    }

    setIsSubmitting(true);
    try {
      await patchOnboardingStep(
        3,
        { workingHours: hours, timezone: "Asia/Karachi" },
        token,
      );
      await refresh();
      router.push("/onboarding/step-4");
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.details?.map((d) => d.message).join(", ") || err.message
          : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set your working hours</CardTitle>
        <p className="text-sm text-muted-foreground">
          Bookings are only accepted within these hours. Timezone: Asia/Karachi.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hours.map((day, index) => {
            const label = WEEK_DAYS.find((d) => d.value === day.day)?.label;
            return (
              <div
                key={day.day}
                className="flex flex-wrap items-center gap-3 rounded-md border p-3"
              >
                <label className="flex w-28 items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={day.isOpen}
                    onChange={(e) =>
                      updateDay(index, { isOpen: e.target.checked })
                    }
                  />
                  {label}
                </label>
                {day.isOpen ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="w-32"
                      value={day.openTime}
                      onChange={(e) =>
                        updateDay(index, { openTime: e.target.value })
                      }
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={day.closeTime}
                      onChange={(e) =>
                        updateDay(index, { closeTime: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>
            );
          })}
        </div>

        {formError && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/onboarding/step-2")}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Button
            className="flex-1"
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving..." : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
