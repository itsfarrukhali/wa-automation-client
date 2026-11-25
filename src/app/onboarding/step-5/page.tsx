// src/app/onboarding/step-5/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/onboarding/field";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { useStepGuard } from "@/components/onboarding/use-step-guard";
import { patchOnboardingStep } from "@/lib/business";
import { ApiError } from "@/lib/api";

export default function OnboardingStep5Page() {
  useStepGuard(5);
  const { token } = useOnboarding();
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
      phoneNumberId: String(form.get("phoneNumberId") ?? "").trim(),
      wabaId: String(form.get("wabaId") ?? "").trim() || undefined,
      accessToken: String(form.get("accessToken") ?? "").trim(),
    };

    try {
      // Completing step 5 flips onboardingComplete=true on the backend.
      await patchOnboardingStep(5, body, token);
      router.push("/dashboard");
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
        <CardTitle>Connect WhatsApp Business</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your business&apos;s own WhatsApp number. Ask your setup contact
          for the Phone Number ID, WhatsApp Business Account ID, and access
          token. Zario checks these with Meta before finishing setup.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Phone Number ID" error={errors.phoneNumberId}>
            <Input name="phoneNumberId" required placeholder="1029384756" />
          </Field>
          <Field label="WhatsApp Business Account ID" error={errors.wabaId}>
            <Input name="wabaId" required placeholder="9876543210" />
          </Field>
          <Field
            label="Access token"
            error={errors.accessToken}
          >
            <Input name="accessToken" type="password" required autoComplete="off" placeholder="Paste your Meta access token" />
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
              onClick={() => router.push("/onboarding/step-4")}
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button className="flex-1" disabled={isSubmitting} type="submit">
              <MessageCircle className="size-4" />
              {isSubmitting ? "Connecting..." : "Finish setup"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
