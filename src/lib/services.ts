import { apiRequest } from "@/lib/api";

export type ServiceDiscount = {
  isActive: boolean;
  type: "percentage" | "fixed" | "package";
  value: number;
  validFrom?: string;
  validUntil?: string;
  minBookingAmount?: number;
  code?: string;
};

export type ServiceAddOn = { name: string; price: number; duration?: number };

export type Service = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  bufferBefore: number;
  bufferAfter: number;
  assignedStaff: string[];
  category: string;
  subCategory?: string;
  color: string;
  icon: string;
  image?: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
  discount?: ServiceDiscount;
  addOns: ServiceAddOn[];
  createdAt: string;
};

export type ServiceListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  isPopular?: boolean;
  discounted?: boolean;
  sortBy?: "sortOrder" | "name" | "price" | "duration" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function listServices(params: ServiceListParams, token: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{ services: Service[]; pagination: Pagination }>
  >(`/services?${query.toString()}`, { token });
  return res.data;
}

export async function getService(serviceId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ service: Service }>>(
    `/services/${serviceId}`,
    { token },
  );
  return res.data.service;
}

export type ServiceFormInput = {
  name: string;
  description?: string;
  price: number;
  duration: number;
  bufferBefore?: number;
  bufferAfter?: number;
  assignedStaff?: string[];
  category?: string;
  color?: string;
  image?: string;
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  discount?: Partial<ServiceDiscount>;
};

export async function createService(body: ServiceFormInput, token: string) {
  const res = await apiRequest<ApiEnvelope<{ service: Service }>>("/services", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return res.data.service;
}

export async function updateService(
  serviceId: string,
  body: Partial<ServiceFormInput>,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ service: Service }>>(
    `/services/${serviceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.service;
}

export async function deleteService(serviceId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ id: string }>>(
    `/services/${serviceId}`,
    {
      method: "DELETE",
      token,
    },
  );
  return res.data;
}

export type ServiceImportRow = {
  name: string;
  price: number;
  duration: number;
  category?: string;
};

export async function importServices(
  services: ServiceImportRow[],
  token: string,
) {
  const res = await apiRequest<
    ApiEnvelope<{ imported: number; failed: number }>
  >("/services/import", {
    method: "POST",
    body: JSON.stringify({ services }),
    token,
  });
  return res.data;
}

export type ServiceAnalytics = {
  totalServices: number;
  popularServices: number;
  averagePrice: number;
  averageDuration: number;
  totalBookings: number;
  completedBookings: number;
  revenue: number;
  categories: Array<{ category: string; count: number }>;
};

export async function getServiceAnalytics(token: string) {
  const res = await apiRequest<ApiEnvelope<{ analytics: ServiceAnalytics }>>(
    "/services/analytics",
    { token },
  );
  return res.data.analytics;
}

// ─── Client-side helpers (mirror the backend virtuals that toJSON strips) ────

export function isServiceDiscounted(
  discount: ServiceDiscount | undefined,
  now = new Date(),
) {
  if (!discount?.isActive || !discount.validFrom || !discount.validUntil)
    return false;
  return (
    new Date(discount.validFrom) <= now && new Date(discount.validUntil) >= now
  );
}

export function computeDiscountedPrice(
  price: number,
  discount: ServiceDiscount | undefined,
) {
  if (!isServiceDiscounted(discount)) return price;
  if (discount!.type === "percentage")
    return price * (1 - discount!.value / 100);
  if (discount!.type === "fixed") return Math.max(0, price - discount!.value);
  return price;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  return `${mins}m`;
}
