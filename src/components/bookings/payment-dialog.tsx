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
import { useAddPayment } from "@/hooks/use-bookings";
import { ApiError } from "@/lib/api";
import type { Booking, PaymentMethod } from "@/lib/bookings";

const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "card",
  "jazzcash",
  "easypaisa",
  "bank_transfer",
];

export function PaymentDialog({
  booking,
  onOpenChange,
}: {
  booking: Booking | null;
  onOpenChange: (open: boolean) => void;
}) {
  const addPayment = useAddPayment();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit() {
    if (!booking) return;
    setFormError("");
    try {
      await addPayment.mutateAsync({
        id: booking._id,
        amount,
        method,
        reference: reference.trim() || undefined,
      });
      onOpenChange(false);
      setAmount(0);
      setReference("");
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.details?.map((d) => d.message).join(", ") || err.message
          : "Something went wrong",
      );
    }
  }

  return (
    <Dialog open={Boolean(booking)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        {booking && (
          <p className="text-sm text-muted-foreground">
            Outstanding:{" "}
            <span className="font-medium text-foreground">
              Rs {booking.amountDue.toLocaleString()}
            </span>
          </p>
        )}
        <Field label="Amount (Rs)">
          <Input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </Field>
        <Field label="Method">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            {PAYMENT_METHODS.map((option) => (
              <option key={option} value={option}>
                {option.replace("_", " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reference (optional)">
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Transaction ID"
          />
        </Field>
        {formError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={addPayment.isPending} onClick={handleSubmit}>
            {addPayment.isPending ? "Saving..." : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
