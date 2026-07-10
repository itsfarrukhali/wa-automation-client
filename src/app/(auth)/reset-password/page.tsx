// src/app/reset-password/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/lib/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const form = new FormData(event.currentTarget);
      const password = String(form.get("password") ?? "");
      const confirmPassword = String(form.get("confirmPassword") ?? "");
      const result = await resetPassword({ token, password, confirmPassword });
      setMessage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Choose a new password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Password must be at least 8 characters with uppercase, lowercase,
              and a number.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <input name="token" type="hidden" value={token} />
              <PasswordField name="password" label="New password" />
              <PasswordField name="confirmPassword" label="Confirm password" />
              {!token && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  Reset token is missing.
                </div>
              )}
              {message && (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button
                className="w-full"
                disabled={isSubmitting || !token}
                type="submit"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function PasswordField({ name, label }: { name: string; label: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative">
        <LockKeyhole className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          minLength={8}
          name={name}
          pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
          required
          type="password"
        />
      </div>
    </label>
  );
}
