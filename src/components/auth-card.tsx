// src/components/auth-card.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, User } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { login, signup } from "@/lib/auth";

const businessTypes = [
  { value: "salon", label: "Salon / Beauty Parlor" },
  { value: "clinic", label: "Clinic / Medical" },
  { value: "restaurant", label: "Restaurant / Cafe" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "spa", label: "Spa / Wellness" },
  { value: "other", label: "Other" },
];

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const auth = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");

    try {
      const session = isSignup
        ? await signup({
            name: String(form.get("name") ?? ""),
            username: String(form.get("username") ?? ""),
            email: String(form.get("email") ?? ""),
            password,
            businessName: String(form.get("businessName") ?? ""),
            businessType: String(form.get("businessType") ?? "salon"),
            consentToDataProcessing:
              form.get("consentToDataProcessing") === "on",
          })
        : await login({
            email: String(form.get("email") ?? ""),
            password,
          });

      auth.setSession(session);
      router.push(
        session.user.isEmailVerified ? "/dashboard" : "/verify-email",
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(
        message.toLowerCase().includes("verify your email")
          ? "Please verify your email first. Check your inbox for the link."
          : message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] px-4 py-10">
      <div className="w-full max-w-lg">
        <Link href="/" className="mb-6 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-white">
            Z
          </div>
          <span className="font-semibold">Zario</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>
              {isSignup ? "Create your workspace" : "Welcome back"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isSignup
                ? "Start with the basics. You can connect WhatsApp after login."
                : "Login to continue to your dashboard."}
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {isSignup && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">Name</span>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        className="pl-9"
                        name="name"
                        placeholder="Your name"
                        required
                      />
                    </div>
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">Username</span>
                    <Input
                      name="username"
                      pattern="[a-zA-Z0-9_]{3,30}"
                      placeholder="business_owner"
                      required
                    />
                  </label>
                </div>
              )}
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
              <label className="block space-y-1.5">
                <span className="flex items-center justify-between text-sm font-medium">
                  Password
                  {!isSignup && (
                    <Link
                      className="text-xs font-medium text-primary"
                      href="/forgot-password"
                    >
                      Forgot?
                    </Link>
                  )}
                </span>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    minLength={8}
                    name="password"
                    pattern={
                      isSignup
                        ? "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}"
                        : undefined
                    }
                    placeholder="Password"
                    required
                    type="password"
                  />
                </div>
              </label>

              {isSignup && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium">Business name</span>
                      <Input
                        name="businessName"
                        placeholder="Your business"
                        required
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium">Business type</span>
                      <select
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        name="businessType"
                        required
                      >
                        {businessTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="flex items-start gap-2 rounded-md border p-3 text-sm">
                    <input
                      className="mt-1"
                      name="consentToDataProcessing"
                      required
                      type="checkbox"
                    />
                    <span className="text-muted-foreground">
                      I agree that Zario can process account and business data
                      for operating this service.
                    </span>
                  </label>
                </>
              )}

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting
                  ? "Please wait..."
                  : isSignup
                    ? "Create account"
                    : "Login"}
                <ArrowRight className="size-4" />
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to Zario?"}{" "}
              <Link
                className="font-medium text-primary"
                href={isSignup ? "/login" : "/signup"}
              >
                {isSignup ? "Login" : "Create account"}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
