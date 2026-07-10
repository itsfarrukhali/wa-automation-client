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
import {
  useActiveStaffOptions,
  useCreateService,
  useUpdateService,
} from "@/hooks/use-services";
import { ApiError } from "@/lib/api";
import type { Service } from "@/lib/services";

const PRESET_COLORS = [
  "#4F46E5",
  "#25d366",
  "#f59e0b",
  "#ef4444",
  "#0ea5e9",
  "#8b5cf6",
];

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}) {
  const isEdit = Boolean(service);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const { data: staffOptions = [] } = useActiveStaffOptions();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [discountEnabled, setDiscountEnabled] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setFormError("");
      setSelectedStaff(service?.assignedStaff ?? []);
      setSelectedColor(service?.color ?? PRESET_COLORS[0]);
      setDiscountEnabled(Boolean(service?.discount?.isActive));
    }
  }, [open, service]);

  function toggleStaff(id: string) {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim() || undefined,
      price: Number(form.get("price")),
      duration: Number(form.get("duration")),
      bufferBefore: Number(form.get("bufferBefore") ?? 5),
      bufferAfter: Number(form.get("bufferAfter") ?? 5),
      category: String(form.get("category") ?? "").trim() || undefined,
      color: selectedColor,
      assignedStaff: selectedStaff,
      isActive: form.get("isActive") === "on",
      isPopular: form.get("isPopular") === "on",
      sortOrder: Number(form.get("sortOrder") ?? 0),
    };

    if (discountEnabled) {
      body.discount = {
        isActive: true,
        type: String(form.get("discountType") ?? "percentage"),
        value: Number(form.get("discountValue") ?? 0),
        validFrom: new Date().toISOString(),
        validUntil: String(form.get("discountValidUntil") ?? ""),
      };
    } else if (isEdit) {
      body.discount = {
        isActive: false,
        type: service?.discount?.type ?? "percentage",
        value: 0,
      };
    }

    try {
      if (isEdit && service) {
        await updateService.mutateAsync({ id: service._id, body });
      } else {
        await createService.mutateAsync(body as never);
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

  const isSubmitting = createService.isPending || updateService.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit service" : "Add service"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Field label="Service name" error={errors.name}>
            <Input
              name="name"
              defaultValue={service?.name}
              required
              maxLength={150}
              placeholder="Haircut & Styling"
            />
          </Field>

          <Field label="Description (optional)" error={errors.description}>
            <textarea
              name="description"
              defaultValue={service?.description}
              maxLength={500}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (Rs)" error={errors.price}>
              <Input
                name="price"
                type="number"
                min={0}
                step="0.01"
                defaultValue={service?.price ?? 0}
                required
              />
            </Field>
            <Field label="Duration (min)" error={errors.duration}>
              <Input
                name="duration"
                type="number"
                min={5}
                max={480}
                defaultValue={service?.duration ?? 30}
                required
              />
            </Field>
            <Field label="Category" error={errors.category}>
              <Input
                name="category"
                defaultValue={service?.category}
                placeholder="Hair"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Buffer before (min)" error={errors.bufferBefore}>
              <Input
                name="bufferBefore"
                type="number"
                min={0}
                max={60}
                defaultValue={service?.bufferBefore ?? 5}
              />
            </Field>
            <Field label="Buffer after (min)" error={errors.bufferAfter}>
              <Input
                name="bufferAfter"
                type="number"
                min={0}
                max={60}
                defaultValue={service?.bufferAfter ?? 5}
              />
            </Field>
          </div>

          <div>
            <span className="text-sm font-medium">Color tag</span>
            <div className="mt-2 flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  aria-label={`Select color ${color}`}
                  onClick={() => setSelectedColor(color)}
                  className="size-7 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? "#000" : "transparent",
                    transform:
                      selectedColor === color ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Assigned staff</span>
            <p className="text-xs text-muted-foreground">
              Leave empty to allow any staff member to perform this service.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {staffOptions.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  No active staff found.
                </span>
              )}
              {staffOptions.map((option) => (
                <button
                  type="button"
                  key={option._id}
                  onClick={() => toggleStaff(option._id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    selectedStaff.includes(option._id)
                      ? "border-primary bg-primary text-white"
                      : "border-input text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={discountEnabled}
                onChange={(e) => setDiscountEnabled(e.target.checked)}
              />
              Run a discount on this service
            </label>

            {discountEnabled && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Type">
                  <select
                    name="discountType"
                    defaultValue={service?.discount?.type ?? "percentage"}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </Field>
                <Field label="Value" error={errors["discount.value"]}>
                  <Input
                    name="discountValue"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={service?.discount?.value ?? 10}
                  />
                </Field>
                <Field
                  label="Valid until"
                  error={errors["discount.validUntil"]}
                >
                  <Input
                    name="discountValidUntil"
                    type="date"
                    defaultValue={service?.discount?.validUntil?.slice(0, 10)}
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={service?.isActive ?? true}
              />
              Active (bookable now)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isPopular"
                defaultChecked={service?.isPopular ?? false}
              />
              Mark as popular
            </label>
          </div>

          <Field
            label="Sort order"
            error={errors.sortOrder}
            hint="Lower numbers appear first"
          >
            <Input
              name="sortOrder"
              type="number"
              min={0}
              defaultValue={service?.sortOrder ?? 0}
              className="w-32"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Create service"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
