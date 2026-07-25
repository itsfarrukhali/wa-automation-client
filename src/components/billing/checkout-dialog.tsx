// src/components/billing/checkout-dialog.tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
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
import {
  useConfirmManualPayment,
  useCreateCheckoutIntent,
} from "@/hooks/use-billing";
import {
  PAYMENT_METHODS,
  type CheckoutIntent,
  type PaymentMethod,
  type PlanCatalogEntry,
} from "@/lib/billing";
import { ApiError } from "@/lib/api";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  jazzcash: "JazzCash",
  easypaisa: "Easypaisa",
  card: "Debit/Credit Card",
  bank_transfer: "Bank Transfer",
};

export function CheckoutDialog({
  plan,
  onOpenChange,
}: {
  plan: PlanCatalogEntry | null;
  onOpenChange: (open: boolean) => void;
}) {
  const createIntent = useCreateCheckoutIntent();
  const confirmPayment = useConfirmManualPayment();

  const [method, setMethod] = useState<PaymentMethod>("jazzcash");
  const [intent, setIntent] = useState<CheckoutIntent | null>(null);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function reset() {
    setIntent(null);
    setReference("");
    setAmount("");
    setError("");
    setSuccess(false);
  }

  async function handleStartCheckout() {
    if (!plan) return;
    setError("");
    try {
      const result = await createIntent.mutateAsync({
        plan: plan.id,
        paymentMethod: method,
      });
      setIntent(result);
      setAmount(result.amount ?? "");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to start checkout",
      );
    }
  }

  async function handleConfirmPayment() {
    if (!plan || !intent) return;
    setError("");
    try {
      await confirmPayment.mutateAsync({
        plan: plan.id,
        paymentMethod: intent.paymentMethod,
        reference: reference.trim() || undefined,
        amount: amount === "" ? undefined : Number(amount),
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to confirm payment",
      );
    }
  }

  function handleClose(open: boolean) {
    if (!open) reset();
    onOpenChange(open);
  }

  return (
    <Dialog open={Boolean(plan)} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Upgrade to {plan?.name}</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="size-10 text-emerald-600" />
            <p className="text-sm text-muted-foreground">
              Your business is now on the {plan?.name} plan.
            </p>
          </div>
        ) : !intent ? (
          <div className="space-y-4">
            <Field label="Payment method">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {PAYMENT_METHODS.map((option) => (
                  <option key={option} value={option}>
                    {METHOD_LABELS[option]}
                  </option>
                ))}
              </select>
            </Field>
            {plan?.monthlyPrice != null && (
              <p className="text-sm text-muted-foreground">
                Amount due:{" "}
                <span className="font-medium text-foreground">
                  Rs {plan.monthlyPrice.toLocaleString()}
                </span>{" "}
                / month
              </p>
            )}
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
              {intent.instructions}
            </div>
            <p className="text-sm">
              Send{" "}
              <span className="font-medium">
                Rs {intent.amount?.toLocaleString() ?? amount}
              </span>{" "}
              via{" "}
              <span className="font-medium">
                {METHOD_LABELS[intent.paymentMethod]}
              </span>
              , then confirm below.
            </p>
            <Field label="Amount paid (Rs)">
              <Input
                type="number"
                min={0}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </Field>
            <Field label="Transaction reference (optional)">
              <Input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="TXN123456"
              />
            </Field>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {success ? "Close" : "Cancel"}
          </Button>
          {!success && !intent && (
            <Button
              onClick={handleStartCheckout}
              disabled={createIntent.isPending}
            >
              {createIntent.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Continue"
              )}
            </Button>
          )}
          {!success && intent && (
            <Button
              onClick={handleConfirmPayment}
              disabled={confirmPayment.isPending}
            >
              {confirmPayment.isPending
                ? "Confirming..."
                : "I've paid — confirm"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
