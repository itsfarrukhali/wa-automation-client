// src/app/onboarding/step-1/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/onboarding/field";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { useStepGuard } from "@/components/onboarding/use-step-guard";
import { patchOnboardingStep } from "@/lib/business";
import { ApiError } from "@/lib/api";
import { BUSINESS_TYPES } from "@/lib/constants";

export default function OnboardingStep1Page() {
  useStepGuard(1);
  const { status, token, refresh } = useOnboarding();
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
      name: String(form.get("name") ?? "").trim(),
      type: String(form.get("type") ?? ""),
      phone: String(form.get("phone") ?? "").trim() || undefined,
      landline: String(form.get("landline") ?? "").trim() || undefined,
      email: String(form.get("email") ?? "").trim() || undefined,
    };

    try {
      await patchOnboardingStep(1, body, token);
      await refresh();
      router.push("/onboarding/step-2");
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
        <CardTitle>Tell us about your business</CardTitle>
        <p className="text-sm text-muted-foreground">
          This appears on customer receipts and WhatsApp messages.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Business name" error={errors.name}>
            <Input
              name="name"
              defaultValue={status.businessName}
              required
              maxLength={150}
            />
          </Field>

          <Field label="Business type" error={errors.type}>
            <select
              name="type"
              aria-label="Business type"
              defaultValue={status.businessType}
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" error={errors.phone} hint="03XXXXXXXXX">
              <Input name="phone" placeholder="03001234567" />
            </Field>
            <Field label="Landline (optional)" error={errors.landline}>
              <Input name="landline" placeholder="021-1234567" />
            </Field>
          </div>

          <Field label="Business email (optional)" error={errors.email}>
            <Input name="email" type="email" placeholder="hello@business.com" />
          </Field>

          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Continue"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
