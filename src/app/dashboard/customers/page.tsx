// src/app/dashboard/customers/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { useCustomerList, useDeleteCustomer } from "@/hooks/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Customer, CustomerListParams } from "@/lib/customers";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { CustomerDetailSheet } from "@/components/customers/customer-detail-sheet";
import { DeleteCustomerDialog } from "@/components/customers/delete-customer-dialog";

const STATUS_OPTIONS = ["active", "inactive", "blocked"] as const;
const TAG_OPTIONS = [
  "vip",
  "new",
  "regular",
  "at_risk",
  "lost",
  "whale",
  "inactive",
] as const;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomerId, setViewingCustomerId] = useState<string | null>(
    null,
  );
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null,
  );

  const params: CustomerListParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      status: (status || undefined) as CustomerListParams["status"],
      tag: (tag || undefined) as CustomerListParams["tag"],
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [page, debouncedSearch, status, tag],
  );

  const { data, isLoading, isFetching } = useCustomerList(params);
  const deleteCustomer = useDeleteCustomer();

  const customers = data?.customers ?? [];
  const pagination = data?.pagination;

  function openCreate() {
    setEditingCustomer(null);
    setFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setEditingCustomer(customer);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deletingCustomer) return;
    await deleteCustomer.mutateAsync(deletingCustomer._id);
    setDeletingCustomer(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customers</h1>
          <p className="text-sm text-muted-foreground">
            {pagination ? `${pagination.total} total` : "Loading..."}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add customer
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search name, phone, or email"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            <select
              className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
              value={tag}
              onChange={(e) => {
                setPage(1);
                setTag(e.target.value);
              }}
            >
              <option value="">All segments</option>
              {TAG_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid h-40 place-items-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : customers.length === 0 ? (
            <div className="grid h-40 place-items-center text-center text-sm text-muted-foreground">
              No customers match your filters yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Total spent</TableHead>
                    <TableHead>Last visit</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer._id}
                      className="cursor-pointer"
                      onClick={() => setViewingCustomerId(customer._id)}
                    >
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell>
                        {customer.whatsappNumber || customer.phone}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.slice(0, 2).map((t) => (
                            <Badge key={t} variant="outline">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {customer.totalVisits}
                      </TableCell>
                      <TableCell className="text-right">
                        Rs {customer.totalSpent.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {customer.lastVisit
                          ? new Date(customer.lastVisit).toLocaleDateString()
                          : "Never"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Row actions"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewingCustomerId(customer._id)}
                            >
                              <Eye className="size-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEdit(customer)}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeletingCustomer(customer)}
                            >
                              <Trash2 className="size-4" />
                              Delete
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
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
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

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
      />

      <CustomerDetailSheet
        customerId={viewingCustomerId}
        onOpenChange={(open) => !open && setViewingCustomerId(null)}
        onEdit={(customer) => {
          setViewingCustomerId(null);
          openEdit(customer);
        }}
      />

      <DeleteCustomerDialog
        customer={deletingCustomer}
        onOpenChange={(open) => !open && setDeletingCustomer(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteCustomer.isPending}
      />
    </div>
  );
}
