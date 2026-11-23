"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
import { useCreateCustomer, useUpdateCustomer } from "@/hooks/use-customers";
import { ApiError } from "@/lib/api";
import type {
  Customer,
  CustomerSource,
  CustomerStatus,
  CustomerTag,
  WhatsAppOptInSource,
} from "@/lib/customers";

const SOURCE_OPTIONS: CustomerSource[] = [
  "manual",
  "walk_in",
  "whatsapp",
  "phone_call",
  "website",
  "facebook",
  "instagram",
  "google",
  "referral",
  "other",
];
const TAG_OPTIONS: CustomerTag[] = [
  "vip",
  "new",
  "regular",
  "at_risk",
  "lost",
  "whale",
  "inactive",
];
const STATUS_OPTIONS: CustomerStatus[] = ["active", "inactive", "blocked"];
const OPT_IN_SOURCE_OPTIONS: Array<{
  value: WhatsAppOptInSource;
  label: string;
}> = [
  { value: "customer_request", label: "Customer asked us directly" },
  { value: "website_form", label: "Website or booking form" },
  { value: "written_consent", label: "Written consent" },
  { value: "verbal_consent", label: "Verbal consent" },
  { value: "whatsapp_inbound", label: "Customer messaged on WhatsApp" },
  { value: "imported_record", label: "Imported consent record" },
];

export function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onCreated?: (customer: Customer) => void;
}) {
  const isEdit = Boolean(customer);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [selectedTags, setSelectedTags] = useState<CustomerTag[]>([]);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const submitIntent = useRef<"save" | "message">("save");

  useEffect(() => {
    if (open) {
      setErrors({});
      setFormError("");
      setSelectedTags(customer?.tags ?? []);
      setWhatsappOptIn(customer?.whatsappOptIn ?? false);
      submitIntent.current = "save";
    }
  }, [open, customer]);

  function toggleTag(tag: CustomerTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {
      name: String(form.get("name") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      whatsappNumber:
        String(form.get("whatsappNumber") ?? "").trim() || undefined,
      email: String(form.get("email") ?? "").trim() || undefined,
      source: String(form.get("source") ?? "manual"),
      tags: selectedTags,
      whatsappOptIn,
      whatsappOptInSource: whatsappOptIn
        ? String(form.get("whatsappOptInSource") ?? "customer_request")
        : undefined,
      consentGiven: form.get("consentGiven") === "on",
      notes: String(form.get("notes") ?? "").trim() || undefined,
    };
    if (isEdit) body.status = String(form.get("status") ?? customer?.status);

    try {
      if (isEdit && customer) {
        await updateCustomer.mutateAsync({ id: customer._id, body });
      } else {
        const created = await createCustomer.mutateAsync(body as never);
        if (submitIntent.current === "message") onCreated?.(created);
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

  const isSubmitting = createCustomer.isPending || updateCustomer.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "Add customer"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name}>
              <Input
                name="name"
                defaultValue={customer?.name}
                required
                maxLength={100}
              />
            </Field>
            <Field label="Phone" error={errors.phone} hint="03XXXXXXXXX">
              <Input
                name="phone"
                defaultValue={customer?.phone}
                required
                placeholder="03001234567"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="WhatsApp number (optional)"
              error={errors.whatsappNumber}
            >
              <Input
                name="whatsappNumber"
                defaultValue={customer?.whatsappNumber}
                placeholder="Same as phone if empty"
              />
            </Field>
            <Field label="Email (optional)" error={errors.email}>
              <Input name="email" type="email" defaultValue={customer?.email} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Source" error={errors.source}>
              <select
                name="source"
                defaultValue={customer?.source ?? "manual"}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>

            {isEdit && (
              <Field label="Status" error={errors.status}>
                <select
                  name="status"
                  defaultValue={customer?.status}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option[0].toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <div>
            <span className="text-sm font-medium">Segments</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    selectedTags.includes(tag)
                      ? "border-primary bg-primary text-white"
                      : "border-input text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="whatsappOptIn"
                checked={whatsappOptIn}
                onChange={(event) => setWhatsappOptIn(event.target.checked)}
              />
              Customer has given permission to receive WhatsApp messages
            </label>
            {whatsappOptIn && (
              <Field
                label="How permission was given"
                error={errors.whatsappOptInSource}
              >
                <select
                  name="whatsappOptInSource"
                  defaultValue={
                    customer?.whatsappOptInSource ?? "customer_request"
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                >
                  {OPT_IN_SOURCE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              Keep permission records accurate. Zario records when and how the
              customer opted in.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="consentGiven"
                defaultChecked={customer?.consentGiven ?? false}
              />
              Data processing consent given
            </label>
          </div>

          <Field label="Notes (optional)" error={errors.notes}>
            <textarea
              name="notes"
              defaultValue={customer?.notes}
              maxLength={1000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </Field>

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
            {!isEdit && (
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => {
                  submitIntent.current = "save";
                }}
              >
                {isSubmitting ? "Saving..." : "Save customer"}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || (!isEdit && !whatsappOptIn)}
              onClick={() => {
                submitIntent.current = isEdit ? "save" : "message";
              }}
            >
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Save & message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
