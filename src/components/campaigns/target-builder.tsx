// src/components/campaigns/target-builder.tsx
"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/onboarding/field";
import { CustomerCombobox } from "@/components/bookings/customer-combobox";
import {
  TARGET_TAGS,
  type CampaignTarget,
  type TargetTag,
} from "@/lib/campaigns";

export function TargetBuilder({
  target,
  onChange,
}: {
  target: CampaignTarget;
  onChange: (target: CampaignTarget) => void;
}) {
  const [pendingCustomer, setPendingCustomer] = useState<{
    id: string;
    label: string;
  } | null>(null);

  const selectedTags = target.tags ?? [];
  const specificCustomers = target.specificCustomers ?? [];

  function toggleTag(tag: TargetTag) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange({ ...target, tags: next });
  }

  function addSpecificCustomer() {
    if (!pendingCustomer || specificCustomers.includes(pendingCustomer.id))
      return;
    onChange({
      ...target,
      specificCustomers: [...specificCustomers, pendingCustomer.id],
    });
    setPendingCustomer(null);
  }

  function removeSpecificCustomer(id: string) {
    onChange({
      ...target,
      specificCustomers: specificCustomers.filter((c) => c !== id),
    });
  }

  function updateFilter<K extends keyof NonNullable<CampaignTarget["filters"]>>(
    key: K,
    value: NonNullable<CampaignTarget["filters"]>[K] | undefined,
  ) {
    onChange({ ...target, filters: { ...target.filters, [key]: value } });
  }

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Users className="size-4" />
        Who should receive this?
      </div>

      <div>
        <span className="text-sm font-medium">Segments</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {TARGET_TAGS.map((tag) => (
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
              {tag === "all" ? "All customers" : tag.replace("_", " ")}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Leave empty and use filters/specific customers below instead, or
          combine both — any match is included.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Min visits">
          <Input
            type="number"
            min={0}
            value={target.filters?.minVisits ?? ""}
            onChange={(e) =>
              updateFilter(
                "minVisits",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="Max visits">
          <Input
            type="number"
            min={0}
            value={target.filters?.maxVisits ?? ""}
            onChange={(e) =>
              updateFilter(
                "maxVisits",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="Min spent (Rs)">
          <Input
            type="number"
            min={0}
            value={target.filters?.minSpent ?? ""}
            onChange={(e) =>
              updateFilter(
                "minSpent",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="Max spent (Rs)">
          <Input
            type="number"
            min={0}
            value={target.filters?.maxSpent ?? ""}
            onChange={(e) =>
              updateFilter(
                "maxSpent",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </Field>
        <Field label="Last visit after">
          <Input
            type="date"
            value={target.filters?.lastVisitAfter?.slice(0, 10) ?? ""}
            onChange={(e) =>
              updateFilter("lastVisitAfter", e.target.value || undefined)
            }
          />
        </Field>
        <Field label="Last visit before">
          <Input
            type="date"
            value={target.filters?.lastVisitBefore?.slice(0, 10) ?? ""}
            onChange={(e) =>
              updateFilter("lastVisitBefore", e.target.value || undefined)
            }
          />
        </Field>
        <Field label="City">
          <Input
            value={target.filters?.city ?? ""}
            onChange={(e) => updateFilter("city", e.target.value || undefined)}
            placeholder="Karachi"
          />
        </Field>
        <Field label="Gender">
          <select
            value={target.filters?.gender ?? ""}
            onChange={(e) =>
              updateFilter(
                "gender",
                (e.target.value ||
                  undefined) as CampaignTarget["filters"] extends infer F
                  ? F extends { gender?: infer G }
                    ? G
                    : never
                  : never,
              )
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <div>
        <span className="text-sm font-medium">
          Add specific customers (optional)
        </span>
        <div className="mt-2 flex gap-2">
          <div className="flex-1">
            <CustomerCombobox
              value={pendingCustomer}
              onChange={setPendingCustomer}
            />
          </div>
          <button
            type="button"
            onClick={addSpecificCustomer}
            className="shrink-0 rounded-md border px-3 text-sm hover:bg-muted"
          >
            Add
          </button>
        </div>
        {specificCustomers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {specificCustomers.map((id) => (
              <span
                key={id}
                className="flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 text-xs"
              >
                Customer {id.slice(-6)}
                <button
                  type="button"
                  onClick={() => removeSpecificCustomer(id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
