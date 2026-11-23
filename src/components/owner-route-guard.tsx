"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

export function OwnerRouteGuard({ children }: { children: React.ReactNode }) {
  const { isReady, user } = useAuth();

  if (!isReady) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />;
  }

  if (user?.role !== "owner") {
    return (
      <div className="grid min-h-[24rem] place-items-center rounded-xl border bg-white px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-600">
            <LockKeyhole className="size-5" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">Owner access required</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This area contains business-level settings and is available only to
            the business owner. Staff accounts cannot view or change it.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard">Return to overview</Link>
          </Button>
        </div>
      </div>
    );
  }

  return children;
}
