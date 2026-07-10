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
import type { Customer } from "@/lib/customers";

export function DeleteCustomerDialog({
  customer,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AlertDialog open={Boolean(customer)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {customer?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This soft-deletes the customer — booking history is kept, but
            they&apos;ll no longer appear in your customer list or campaign
            targeting.
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
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
