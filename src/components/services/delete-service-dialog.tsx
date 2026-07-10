"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Service } from "@/lib/services";

export function DeleteServiceDialog({
  service,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  service: Service | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AlertDialog open={Boolean(service)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {service?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This marks the service as inactive — it disappears from booking and
            the catalog list, but existing bookings referencing it are
            unaffected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isDeleting ? "Archiving..." : "Archive"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
