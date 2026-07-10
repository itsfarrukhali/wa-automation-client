// src/app/onboarding/step-2/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/onboarding/field";
import { useOnboarding } from "@/components/onboarding/onboarding-provider";
import { useStepGuard } from "@/components/onboarding/use-step-guard";
import { patchOnboardingStep } from "@/lib/business";
import { ApiError } from "@/lib/api";
import { CITIES } from "@/lib/constants";

export default function OnboardingStep2Page() {
  useStepGuard(2);
  const { token, refresh } = useOnboarding();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [locating, setLocating] = useState(false);

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {
      city: String(form.get("city") ?? ""),
      area: String(form.get("area") ?? "").trim() || undefined,
      address: String(form.get("address") ?? "").trim() || undefined,
    };
    if (coords.lat !== undefined && coords.lng !== undefined) {
      body.location = { lat: coords.lat, lng: coords.lng };
    }

    try {
      await patchOnboardingStep(2, body, token);
      await refresh();
      router.push("/onboarding/step-3");
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
        <CardTitle>Where is your business located?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Customers see this on booking confirmations.
        </p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="City" error={errors.city}>
            <select
              name="city"
              aria-label="City"
              defaultValue="Karachi"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select a city</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Area / neighborhood" error={errors.area}>
            <Input name="area" placeholder="Gulshan-e-Iqbal" />
          </Field>

          <Field label="Full address" error={errors.address}>
            <Input
              name="address"
              placeholder="Shop 4, Block 6"
              maxLength={300}
            />
          </Field>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                <div className="font-medium">Map coordinates</div>
                <div className="text-xs text-muted-foreground">
                  {coords.lat
                    ? `${coords.lat.toFixed(5)}, ${coords.lng?.toFixed(5)}`
                    : "Optional — helps customers find you"}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseCurrentLocation}
                disabled={locating}
              >
                <MapPin className="size-4" />
                {locating ? "Locating..." : "Use current location"}
              </Button>
            </div>
          </div>

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
              onClick={() => router.push("/onboarding/step-1")}
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
