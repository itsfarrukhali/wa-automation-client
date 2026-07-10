"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  useDeleteService,
  useServiceAnalytics,
  useServiceList,
} from "@/hooks/use-services";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Service, ServiceListParams } from "@/lib/services";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { ServiceCard } from "@/components/services/service-card";
import { DeleteServiceDialog } from "@/components/services/delete-service-dialog";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [activeFilter, setActiveFilter] = useState<
    "active" | "inactive" | "all"
  >("active");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  const params: ServiceListParams = useMemo(
    () => ({
      page,
      limit: 24,
      search: debouncedSearch || undefined,
      isActive: activeFilter === "all" ? undefined : activeFilter === "active",
      sortBy: "sortOrder",
      sortOrder: "asc",
    }),
    [page, debouncedSearch, activeFilter],
  );

  const { data, isLoading, isFetching } = useServiceList(params);
  const { data: analytics } = useServiceAnalytics();
  const deleteService = useDeleteService();

  const services = data?.services ?? [];
  const pagination = data?.pagination;

  function openCreate() {
    setEditingService(null);
    setFormOpen(true);
  }

  function openEdit(service: Service) {
    setEditingService(service);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deletingService) return;
    await deleteService.mutateAsync(deletingService._id);
    setDeletingService(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Service catalog</h1>
          <p className="text-sm text-muted-foreground">
            {pagination ? `${pagination.total} services` : "Loading..."}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add service
        </Button>
      </div>

      {analytics && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat label="Total services" value={analytics.totalServices} />
          <SummaryStat
            label="Popular services"
            value={analytics.popularServices}
          />
          <SummaryStat
            label="Average price"
            value={`Rs ${Math.round(analytics.averagePrice).toLocaleString()}`}
          />
          <SummaryStat label="Total bookings" value={analytics.totalBookings} />
        </div>
      )}

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search services by name, description, or category"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <div className="flex gap-2">
            {(["active", "inactive", "all"] as const).map((option) => (
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

      {isLoading ? (
        <div className="grid h-40 place-items-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="grid h-40 place-items-center text-center text-sm text-muted-foreground">
            No services match your filters yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onEdit={() => openEdit(service)}
              onDelete={() => setDeletingService(service)}
            />
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
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

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editingService}
      />

      <DeleteServiceDialog
        service={deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteService.isPending}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
