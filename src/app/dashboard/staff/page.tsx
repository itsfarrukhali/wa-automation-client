// src/app/dashboard/staff/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  ShieldOff,
  ShieldCheck,
  KeyRound,
  Trash2,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useRemoveStaff,
  useSetStaffStatus,
  useStaffList,
} from "@/hooks/use-staff";
import type { StaffListParams, StaffMember } from "@/lib/staff";
import { StaffFormDialog } from "@/components/staff/staff-form-dialog";
import { ResetPasswordDialog } from "@/components/staff/reset-password-dialog";
import { RemoveStaffDialog } from "@/components/staff/remove-staff-dialog";

export default function StaffPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [resettingStaff, setResettingStaff] = useState<StaffMember | null>(
    null,
  );
  const [removingStaff, setRemovingStaff] = useState<StaffMember | null>(null);

  const params: StaffListParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      isActive: activeFilter === "all" ? undefined : activeFilter === "active",
    }),
    [page, debouncedSearch, activeFilter],
  );

  const { data, isLoading, isFetching } = useStaffList(params);
  const setStatus = useSetStaffStatus();
  const removeStaff = useRemoveStaff();

  const staff = data?.staff ?? [];
  const usage = data?.usage;
  const pagination = data?.pagination;

  const limitReached =
    usage &&
    usage.staffLimit !== -1 &&
    usage.activeStaffCount >= usage.staffLimit;

  if (user?.role !== "owner") {
    return (
      <Card>
        <CardContent className="grid h-40 place-items-center text-center text-sm text-muted-foreground">
          Only business owners can manage staff accounts.
        </CardContent>
      </Card>
    );
  }

  function openCreate() {
    setEditingStaff(null);
    setFormOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditingStaff(member);
    setFormOpen(true);
  }

  async function confirmRemove() {
    if (!removingStaff) return;
    await removeStaff.mutateAsync(removingStaff._id);
    setRemovingStaff(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Staff</h1>
          <p className="text-sm text-muted-foreground">
            {pagination ? `${pagination.total} accounts` : "Loading..."}
          </p>
        </div>
        <Button onClick={openCreate} disabled={limitReached}>
          <Plus className="size-4" />
          Add staff
        </Button>
      </div>

      {usage && usage.staffLimit !== -1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Staff accounts used</span>
              <span className="text-muted-foreground">
                {usage.activeStaffCount} / {usage.staffLimit}
              </span>
            </div>
            <Progress
              className="mt-2"
              value={(usage.activeStaffCount / usage.staffLimit) * 100}
            />
            {limitReached && (
              <p className="mt-2 text-xs text-amber-700">
                Staff limit reached for your plan — upgrade to add more
                accounts.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, email, phone, or username"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "inactive"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={activeFilter === option ? "default" : "outline"}
                onClick={() => {
                  setPage(1);
                  setActiveFilter(option);
                }}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="grid h-40 place-items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : staff.length === 0 ? (
            <div className="grid h-40 place-items-center text-sm text-muted-foreground">
              No staff members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={member.isActive ? "success" : "secondary"}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Staff actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(member)}>
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setResettingStaff(member)}
                            >
                              <KeyRound className="size-4" />
                              Reset password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={
                                setStatus.isPending ||
                                (!member.isActive && limitReached)
                              }
                              onClick={() =>
                                setStatus.mutate({
                                  id: member._id,
                                  isActive: !member.isActive,
                                })
                              }
                            >
                              {member.isActive ? (
                                <ShieldOff className="size-4" />
                              ) : (
                                <ShieldCheck className="size-4" />
                              )}
                              {member.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setRemovingStaff(member)}
                            >
                              <Trash2 className="size-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t p-3 text-sm text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.pages}
                {isFetching && " · updating..."}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        staff={editingStaff}
      />
      <ResetPasswordDialog
        staff={resettingStaff}
        onOpenChange={(open) => !open && setResettingStaff(null)}
      />
      <RemoveStaffDialog
        staff={removingStaff}
        onOpenChange={(open) => !open && setRemovingStaff(null)}
        onConfirm={confirmRemove}
        isRemoving={removeStaff.isPending}
      />
    </div>
  );
}
