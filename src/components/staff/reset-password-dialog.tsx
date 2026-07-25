// src/components/staff/reset-password-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/onboarding/field";
import { useResetStaffPassword } from "@/hooks/use-staff";
import { ApiError } from "@/lib/api";
import type { StaffMember } from "@/lib/staff";

export function ResetPasswordDialog({
  staff,
  onOpenChange,
}: {
  staff: StaffMember | null;
  onOpenChange: (open: boolean) => void;
}) {
  const resetPassword = useResetStaffPassword();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    if (!staff) return;
    setError("");
    try {
      await resetPassword.mutateAsync({ id: staff._id, password });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to reset password",
      );
    }
  }

  function handleClose(open: boolean) {
    if (!open) {
      setPassword("");
      setError("");
      setSuccess(false);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={Boolean(staff)} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset password — {staff?.name}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Password reset. All of {staff?.name}&apos;s active sessions were
            logged out — share the new password with them securely.
          </div>
        ) : (
          <>
            <Field
              label="New password"
              hint="Min 8 chars, one uppercase letter, one number"
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
              />
            </Field>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {success ? "Close" : "Cancel"}
          </Button>
          {!success && (
            <Button
              disabled={resetPassword.isPending || password.length < 8}
              onClick={handleSubmit}
            >
              {resetPassword.isPending ? "Resetting..." : "Reset password"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
