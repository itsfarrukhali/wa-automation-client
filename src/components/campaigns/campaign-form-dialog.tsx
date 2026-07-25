// src/components/campaigns/campaign-form-dialog.tsx
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
import { TargetBuilder } from "@/components/campaigns/target-builder";
import { PreviewRecipientsPanel } from "@/components/campaigns/preview-recipients-panel";
import { useCreateCampaign, useUpdateCampaign } from "@/hooks/use-campaigns";
import { useTemplateList } from "@/hooks/use-templates";
import { ApiError } from "@/lib/api";
import {
  CAMPAIGN_TYPES,
  type Campaign,
  type CampaignTarget,
} from "@/lib/campaigns";

const TEMPLATE_VARIABLE_HINT =
  "Use {{name}}, {{business}}, {{date}}, {{time}} as placeholders.";

export function CampaignFormDialog({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}) {
  const isEdit = Boolean(campaign);
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const { data: templateData } = useTemplateList();
  const approvedTemplates = (templateData?.templates ?? []).filter(
    (t) => t.status === "APPROVED",
  );

  const [target, setTarget] = useState<CampaignTarget>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (open) {
      setTarget(campaign?.target ?? {});
      setErrors({});
      setFormError("");
    }
  }, [open, campaign]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError("");

    const form = new FormData(event.currentTarget);
    const body = {
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim() || undefined,
      type: String(form.get("type") ?? "promo") as Campaign["type"],
      message: String(form.get("message") ?? "").trim(),
      whatsappTemplate: {
        templateName: String(form.get("templateName") ?? ""),
        language: String(form.get("language") ?? "en"),
        category: String(form.get("category") ?? "MARKETING"),
      },
      scheduledAt: String(form.get("scheduledAt") ?? "") || undefined,
      target,
    };

    try {
      if (isEdit && campaign) {
        await updateCampaign.mutateAsync({ id: campaign._id, body });
      } else {
        await createCampaign.mutateAsync(body as never);
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

  const isSubmitting = createCampaign.isPending || updateCampaign.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit campaign" : "New campaign"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Campaign name" error={errors.name}>
              <Input
                name="name"
                defaultValue={campaign?.name}
                required
                maxLength={150}
                placeholder="July win-back"
              />
            </Field>
            <Field label="Type" error={errors.type}>
              <select
                name="type"
                defaultValue={campaign?.type ?? "promo"}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {CAMPAIGN_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Description (optional)" error={errors.description}>
            <Input
              name="description"
              defaultValue={campaign?.description}
              maxLength={500}
            />
          </Field>

          <Field
            label="Message"
            error={errors.message}
            hint={TEMPLATE_VARIABLE_HINT}
          >
            <textarea
              name="message"
              defaultValue={campaign?.message}
              required
              maxLength={1024}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              placeholder="Hi {{name}}! We miss you at {{business}}. Come back this week for 20% off."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="WhatsApp template"
              error={errors["whatsappTemplate.templateName"]}
            >
              <select
                name="templateName"
                defaultValue={campaign?.whatsappTemplate?.templateName}
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
              >
                <option value="">Select...</option>
                {approvedTemplates.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
              {approvedTemplates.length === 0 && (
                <span className="text-xs text-amber-700">
                  No approved templates yet — sync/approve one first.
                </span>
              )}
            </Field>
            <Field label="Language">
              <select
                name="language"
                defaultValue={campaign?.whatsappTemplate?.language ?? "ur"}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
              >
                <option value="ur">Urdu</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="Category">
              <select
                name="category"
                defaultValue={
                  campaign?.whatsappTemplate?.category ?? "MARKETING"
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm"
              >
                <option value="MARKETING">Marketing</option>
                <option value="UTILITY">Utility</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </Field>
          </div>

          <Field
            label="Schedule for later (optional)"
            hint="Leave empty to save as a draft you launch manually"
          >
            <Input
              name="scheduledAt"
              type="datetime-local"
              defaultValue={campaign?.scheduledAt?.slice(0, 16)}
            />
          </Field>

          <TargetBuilder target={target} onChange={setTarget} />
          <PreviewRecipientsPanel target={target} />

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
                  : "Create campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
