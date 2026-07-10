// src/app/forgot-password/page.tsx
"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/auth";

export default function ForgotPasswordPage() {
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
      const result = await forgotPassword(String(form.get("email") ?? ""));
      setMessage(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset email",
      );
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
            <CardTitle>Reset password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your account email and we will send password reset
              instructions.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Email</span>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    name="email"
                    placeholder="you@business.com"
                    required
                    type="email"
                  />
                </div>
              </label>
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
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
