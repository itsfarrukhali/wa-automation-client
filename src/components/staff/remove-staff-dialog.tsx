// src/components/staff/remove-staff-dialog.tsx
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
import type { StaffMember } from "@/lib/staff";

export function RemoveStaffDialog({
  staff,
  onOpenChange,
  onConfirm,
  isRemoving,
}: {
  staff: StaffMember | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isRemoving: boolean;
}) {
  return (
    <AlertDialog open={Boolean(staff)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {staff?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This deactivates their account, logs out all their sessions, and
            removes them from the business permanently. To temporarily pause
            access instead, use the status toggle in the list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isRemoving}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
