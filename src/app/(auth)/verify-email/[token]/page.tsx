// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { resendVerification } from "@/lib/auth";

export default function VerifyEmailPage() {
  const { token, user, isReady, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isReady) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.isEmailVerified) {
      router.replace("/dashboard");
    }
  }, [isReady, token, user, router]);

  // Poll every 5s so verifying in another tab updates this one automatically.
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      const fresh = await refreshUser();
      if (fresh?.isEmailVerified) {
        router.replace("/dashboard");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [token, refreshUser, router]);

  async function handleResend() {
    if (!token) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      await resendVerification(token);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to resend");
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <MailCheck className="mx-auto size-8 text-primary" />
          <CardTitle>Verify your email</CardTitle>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to <strong>{user?.email}</strong>. Click
            it to activate your account — this page updates automatically.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {status === "sent" && (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Verification email resent.
            </div>
          )}
          {status === "error" && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMsg}
            </div>
          )}
          <Button
            className="w-full"
            disabled={status === "sending"}
            onClick={handleResend}
          >
            {status === "sending" ? "Sending..." : "Resend verification email"}
          </Button>
          <Button className="w-full" variant="ghost" onClick={handleLogout}>
            Log out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
