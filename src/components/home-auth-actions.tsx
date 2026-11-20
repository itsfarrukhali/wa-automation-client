"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function HomeHeaderActions() {
  const { token, user, isReady } = useAuth();

  if (!isReady) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />;
  }

  if (token && user) {
    return (
      <Button asChild>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Get started</Link>
      </Button>
    </div>
  );
}

export function HomeHeroActions() {
  const { token, user, isReady } = useAuth();

  if (!isReady) {
    return <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />;
  }

  if (token && user) {
    return (
      <Button asChild>
        <Link href="/dashboard">Open dashboard</Link>
      </Button>
    );
  }

  return (
    <>
      <Button asChild>
        <Link href="/signup">Create account</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/login">Login</Link>
      </Button>
    </>
  );
}
