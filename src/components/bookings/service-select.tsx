"use client";

import { useServiceList } from "@/hooks/use-services";
import { formatDuration } from "@/lib/services";

export function ServiceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (
    serviceId: string,
    meta: { duration: number; price: number },
  ) => void;
}) {
  const { data } = useServiceList({
    isActive: true,
    limit: 100,
    sortBy: "sortOrder",
    sortOrder: "asc",
  });
  const services = data?.services ?? [];

  return (
    <select
      value={value}
      required
      onChange={(e) => {
        const service = services.find((s) => s._id === e.target.value);
        onChange(e.target.value, {
          duration: service?.duration ?? 30,
          price: service?.price ?? 0,
        });
      }}
      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="">Select a service</option>
      {services.map((service) => (
        <option key={service._id} value={service._id}>
          {service.name} · {formatDuration(service.duration)} · Rs{" "}
          {service.price.toLocaleString()}
        </option>
      ))}
    </select>
  );
}
