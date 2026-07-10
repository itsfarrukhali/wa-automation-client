import { apiRequest } from "@/lib/api";

export type CustomerSource =
  | "manual"
  | "walk_in"
  | "whatsapp"
  | "phone_call"
  | "website"
  | "facebook"
  | "instagram"
  | "google"
  | "referral"
  | "import"
  | "other";

export type CustomerStatus = "active" | "inactive" | "blocked";

export type CustomerTag =
  | "vip"
  | "new"
  | "inactive"
  | "regular"
  | "whale"
  | "at_risk"
  | "lost";

export type Customer = {
  _id: string;
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  tags: CustomerTag[];
  status: CustomerStatus;
  source: CustomerSource;
  totalVisits: number;
  totalSpent: number;
  totalAppointments: number;
  lastVisit: string | null;
  whatsappOptIn: boolean;
  optedOut: boolean;
  notes?: string;
  birthdate?: string | null;
  createdAt: string;
};

export type CustomerListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  tag?: CustomerTag;
  source?: CustomerSource;
  whatsappOptIn?: boolean;
  sortBy?: "createdAt" | "name" | "lastVisit" | "totalSpent" | "totalVisits";
  sortOrder?: "asc" | "desc";
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function listCustomers(params: CustomerListParams, token: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{ customers: Customer[]; pagination: Pagination }>
  >(`/customers?${query.toString()}`, { token });
  return res.data;
}

export async function getCustomer(customerId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ customer: Customer }>>(
    `/customers/${customerId}`,
    { token },
  );
  return res.data.customer;
}

export type CustomerFormInput = {
  name: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  source?: CustomerSource;
  status?: CustomerStatus;
  tags?: CustomerTag[];
  whatsappOptIn?: boolean;
  consentGiven?: boolean;
  notes?: string;
  birthdate?: string;
};

export async function createCustomer(body: CustomerFormInput, token: string) {
  const res = await apiRequest<ApiEnvelope<{ customer: Customer }>>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.customer;
}

export async function updateCustomer(
  customerId: string,
  body: Partial<CustomerFormInput>,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ customer: Customer }>>(
    `/customers/${customerId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.customer;
}

export async function deleteCustomer(customerId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ id: string }>>(
    `/customers/${customerId}`,
    {
      method: "DELETE",
      token,
    },
  );
  return res.data;
}

export async function importCustomers(
  customers: Array<{ name: string; phone: string; email?: string }>,
  token: string,
) {
  const res = await apiRequest<
    ApiEnvelope<{
      imported: number;
      failed: number;
      errors: Array<{ index: number; phone?: string; message: string }>;
    }>
  >("/customers/import", {
    method: "POST",
    body: JSON.stringify({ customers }),
    token,
  });
  return res.data;
}

export type CustomerBooking = {
  _id: string;
  scheduledAt: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
  serviceId?: { name: string; duration: number; price: number };
  staffId?: { name: string };
};

export async function getCustomerBookings(
  customerId: string,
  params: { page?: number; limit?: number; status?: string },
  token: string,
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{ bookings: CustomerBooking[]; pagination: Pagination }>
  >(`/customers/${customerId}/bookings?${query.toString()}`, { token });
  return res.data;
}
