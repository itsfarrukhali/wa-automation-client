// src/components/staff/staff-form-dialog.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
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
import { useCreateStaff, useUpdateStaff } from "@/hooks/use-staff";
import { ApiError } from "@/lib/api";
import type { StaffMember } from "@/lib/staff";

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
}) {
  const isEdit = Boolean(staff);
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setErrors({});
      setFormError("");
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const form = new FormData(event.currentTarget);

    try {
      if (isEdit && staff) {
        await updateStaff.mutateAsync({
          id: staff._id,
          body: {
            name: String(form.get("name") ?? "").trim(),
            email: String(form.get("email") ?? "").trim(),
            username: String(form.get("username") ?? "").trim(),
            phone: String(form.get("phone") ?? "").trim() || undefined,
          },
        });
      } else {
        await createStaff.mutateAsync({
          name: String(form.get("name") ?? "").trim(),
          email: String(form.get("email") ?? "").trim(),
          username: String(form.get("username") ?? "").trim(),
          password: String(form.get("password") ?? ""),
          phone: String(form.get("phone") ?? "").trim() || undefined,
          isEmailVerified: form.get("isEmailVerified") === "on",
        });
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setErrors(
          Object.fromEntries(err.details.map((d) => [d.field, d.message])),
        );
      }
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const isSubmitting = createStaff.isPending || updateStaff.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit staff member" : "Add staff member"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Full name" error={errors.name}>
            <Input
              name="name"
              defaultValue={staff?.name}
              required
              maxLength={100}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email}>
              <Input
                name="email"
                type="email"
                defaultValue={staff?.email}
                required
              />
            </Field>
            <Field
              label="Username"
              error={errors.username}
              hint="Letters, numbers, underscores"
            >
              <Input
                name="username"
                defaultValue={staff?.username}
                required
                minLength={3}
                maxLength={30}
              />
            </Field>
          </div>

          <Field label="Phone (optional)" error={errors.phone}>
            <Input
              name="phone"
              defaultValue={staff?.phone}
              placeholder="03001234567"
            />
          </Field>

          {!isEdit && (
            <>
              <Field
                label="Temporary password"
                error={errors.password}
                hint="Min 8 chars, one uppercase letter, one number"
              >
                <Input name="password" type="password" required minLength={8} />
              </Field>
              <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <input type="checkbox" name="isEmailVerified" defaultChecked />
                Activate immediately (skip email verification)
              </label>
            </>
          )}

          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Add staff member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
