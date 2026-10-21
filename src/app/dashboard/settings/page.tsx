"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, PlugZap } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Field } from "@/components/onboarding/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import { reconnectWhatsApp } from "@/lib/business-profile";

export default function SettingsPage() {
  const { token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [connectedNumber, setConnectedNumber] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setConnectedNumber("");
    setIsSaving(true);
    const form = new FormData(formElement);

    try {
      const business = await reconnectWhatsApp(
        {
          phoneNumberId: String(form.get("phoneNumberId") ?? "").trim(),
          wabaId: String(form.get("wabaId") ?? "").trim(),
          accessToken: String(form.get("accessToken") ?? "").trim(),
        },
        token as string,
      );
      setConnectedNumber(business.whatsapp?.displayPhoneNumber || "Connected");
      formElement.reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connection failed");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">WhatsApp connection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PlugZap className="size-4" />
            Connect registered number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Field label="Phone Number ID">
              <Input name="phoneNumberId" required autoComplete="off" />
            </Field>
            <Field label="WhatsApp Business Account ID (WABA ID)">
              <Input name="wabaId" required autoComplete="off" />
            </Field>
            <Field label="Permanent access token">
              <Input
                name="accessToken"
                type="password"
                required
                minLength={50}
                autoComplete="new-password"
              />
            </Field>

            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {connectedNumber && (
              <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <CheckCircle2 className="size-4" />
                Connected to {connectedNumber}
              </p>
            )}

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlugZap className="size-4" />
              )}
              Verify and connect
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
