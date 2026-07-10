// src/app/onboarding/step-4/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/onboarding/field";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { useStepGuard } from "@/components/onboarding/use-step-guard";
import { patchOnboardingStep } from "@/lib/business";
import { ApiError } from "@/lib/api";

export default function OnboardingStep4Page() {
  useStepGuard(4);
  const { token, refresh } = useOnboarding();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const body = {
      reminderTime: Number(form.get("reminderTime")),
      followUpDays: Number(form.get("followUpDays")),
      winbackDays: Number(form.get("winbackDays")),
      reviewRequestEnabled: form.get("reviewRequestEnabled") === "on",
      reviewPlatform: String(form.get("reviewPlatform") ?? "google"),
    };

    try {
      await patchOnboardingStep(4, body, token);
      await refresh();
      router.push("/onboarding/step-5");
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(
          Object.fromEntries(err.details.map((d) => [d.field, d.message])),
        );
      }
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Automate your customer engagement</CardTitle>
        <p className="text-sm text-muted-foreground">
          These settings drive reminders, follow-ups, and win-back messages.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Reminder (hrs before)" error={errors.reminderTime}>
              <Input
                name="reminderTime"
                type="number"
                min={1}
                max={72}
                defaultValue={24}
                required
              />
            </Field>
            <Field label="Follow-up (days after)" error={errors.followUpDays}>
              <Input
                name="followUpDays"
                type="number"
                min={1}
                max={30}
                defaultValue={7}
                required
              />
            </Field>
            <Field label="Win-back (days inactive)" error={errors.winbackDays}>
              <Input
                name="winbackDays"
                type="number"
                min={7}
                max={180}
                defaultValue={30}
                required
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
            <input name="reviewRequestEnabled" type="checkbox" defaultChecked />
            Ask customers for a review after a completed appointment
          </label>

          <Field label="Review platform" error={errors.reviewPlatform}>
            <select
              aria-label="Review platform"
              name="reviewPlatform"
              defaultValue="google"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="google">Google</option>
              <option value="facebook">Facebook</option>
              <option value="custom">Custom link</option>
            </select>
          </Field>

          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/onboarding/step-3")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button className="flex-1" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Continue"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
