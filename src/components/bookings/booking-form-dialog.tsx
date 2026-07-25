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
import { CustomerCombobox } from "@/components/bookings/customer-combobox";
import { ServiceSelect } from "@/components/bookings/service-select";
import { DateTimePicker } from "@/components/bookings/date-time-picker";
import { useActiveStaffOptions } from "@/hooks/use-staff";
import { useBusinessProfile, useCreateBooking } from "@/hooks/use-bookings";
import { combineDateAndTime } from "@/lib/time-slots";
import { ApiError } from "@/lib/api";
import type { PaymentMethod } from "@/lib/bookings";

const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "card",
  "jazzcash",
  "easypaisa",
  "bank_transfer",
];

export function BookingFormDialog({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
}) {
  const createBooking = useCreateBooking();
  const { data: profile } = useBusinessProfile();
  const { data: staffOptions = [] } = useActiveStaffOptions();

  const [customer, setCustomer] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [serviceMeta, setServiceMeta] = useState({ duration: 30, price: 0 });
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState<Date | undefined>(defaultDate);
  const [time, setTime] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");

  function reset() {
    setCustomer(null);
    setServiceId("");
    setStaffId("");
    setDate(defaultDate);
    setTime(null);
    setTotalAmount("");
    setAmountPaid(0);
    setNotes("");
    setFormError("");
  }

  async function handleSubmit() {
    setFormError("");

    if (!customer) return setFormError("Select a customer.");
    if (!serviceId) return setFormError("Select a service.");
    if (!date || !time) return setFormError("Select a date and time.");

    const scheduledAt = combineDateAndTime(date, time);

    try {
      await createBooking.mutateAsync({
        customerId: customer.id,
        serviceId,
        staffId: staffId || undefined,
        scheduledAt: scheduledAt.toISOString(),
        totalAmount:
          totalAmount === "" ? serviceMeta.price : Number(totalAmount),
        amountPaid,
        preferredPaymentMethod: paymentMethod,
        notes: notes.trim() || undefined,
        source: "staff",
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.details?.map((d) => d.message).join(", ") || err.message
          : "Something went wrong",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Customer">
            <CustomerCombobox value={customer} onChange={setCustomer} />
          </Field>

          <Field label="Service">
            <ServiceSelect
              value={serviceId}
              onChange={(id, meta) => {
                setServiceId(id);
                setServiceMeta(meta);
                setTotalAmount(meta.price);
              }}
            />
          </Field>

          <Field
            label="Staff (optional)"
            hint="Leave unassigned if anyone can perform this service"
          >
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              <option value="">Any available staff</option>
              {staffOptions.map((option) => (
                <option key={option._id} value={option._id}>
                  {option.name}
                </option>
              ))}
            </select>
          </Field>

          {profile && (
            <DateTimePicker
              date={date}
              time={time}
              onDateChange={(d) => {
                setDate(d);
                setTime(null);
              }}
              onTimeChange={setTime}
              workingHours={profile.workingHours}
              durationMinutes={serviceMeta.duration}
              timezone={profile.timezone}
            />
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Total amount (Rs)">
              <Input
                type="number"
                min={0}
                value={totalAmount}
                onChange={(e) =>
                  setTotalAmount(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
            </Field>
            <Field label="Amount paid now (Rs)">
              <Input
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
              />
            </Field>
          </div>

          <Field label="Payment method">
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method.replace("_", " ")}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Notes (optional)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </Field>

          {formError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createBooking.isPending}>
            {createBooking.isPending ? "Creating..." : "Create booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
