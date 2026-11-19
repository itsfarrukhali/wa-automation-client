"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PlugZap,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Field } from "@/components/onboarding/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import {
  getWhatsAppConnectionStatus,
  reconnectWhatsApp,
  type WhatsAppConnectionStatus,
} from "@/lib/business-profile";

export default function SettingsPage() {
  const { token } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [connectedNumber, setConnectedNumber] = useState("");
  const [connection, setConnection] = useState<WhatsAppConnectionStatus | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(true);
  const [showReconnect, setShowReconnect] = useState(false);

  const loadConnection = useCallback(async () => {
    if (!token) return;
    setIsChecking(true);
    try {
      const result = await getWhatsAppConnectionStatus(token);
      setConnection(result);
      setShowReconnect(
        result.health === "invalid" || result.health === "not_configured",
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connection check failed");
    } finally {
      setIsChecking(false);
    }
  }, [token]);

  useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

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
      setShowReconnect(false);
      await loadConnection();
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
            WhatsApp connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isChecking ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Checking stored connection...
            </div>
          ) : connection?.health === "healthy" ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                <CheckCircle2 className="mt-0.5 size-4" />
                <div>
                  <p className="font-medium">Connected and verified</p>
                  <p>
                    {connection.verifiedName || "WhatsApp Business"}
                    {connection.displayPhoneNumber
                      ? ` · ${connection.displayPhoneNumber}`
                      : ""}
                    {connection.wabaIdSuffix
                      ? ` · WABA …${connection.wabaIdSuffix}`
                      : ""}
                  </p>
                  <p className="mt-1 text-xs">
                    Permanent token is stored securely. Do not paste it again
                    unless Meta reports it invalid.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={loadConnection}>
                  <RefreshCw className="size-4" />
                  Check connection
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowReconnect((value) => !value)}
                >
                  Replace credentials
                </Button>
              </div>
            </div>
          ) : connection ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 size-4" />
              <div>
                <p className="font-medium">
                  {connection.health === "unreachable"
                    ? "Meta check temporarily unavailable"
                    : "WhatsApp connection needs attention"}
                </p>
                <p>{connection.error || "Connect WhatsApp credentials."}</p>
              </div>
            </div>
          ) : null}

          {showReconnect && (
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
          )}
        </CardContent>
      </Card>

    </div>
  );
}
