// src/lib/staff.ts
import { apiRequest } from "@/lib/api";

export type StaffMember = {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone?: string;
  profilePicture?: string;
  role: "owner" | "staff";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};
type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export type StaffListParams = {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
};

export type StaffUsage = { activeStaffCount: number; staffLimit: number };

export async function listStaff(params: StaffListParams, token: string) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const res = await apiRequest<
    ApiEnvelope<{
      staff: StaffMember[];
      usage: StaffUsage;
      pagination: Pagination;
    }>
  >(`/staff?${query.toString()}`, { token });
  return res.data;
}

// Lightweight — used by Bookings/Services staff-assignment dropdowns.
export async function listActiveStaff(token: string) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffMember[] }>>(
    "/staff?limit=100&isActive=true",
    { token },
  );
  return res.data.staff;
}

export async function getStaffMember(staffId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffMember }>>(
    `/staff/${staffId}`,
    { token },
  );
  return res.data.staff;
}

export type CreateStaffInput = {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  isEmailVerified?: boolean;
};

export async function createStaffMember(body: CreateStaffInput, token: string) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffMember }>>("/staff", {
    method: "POST",
    body: JSON.stringify(body),
    token,
  });
  return res.data.staff;
}

export type UpdateStaffInput = {
  name?: string;
  email?: string;
  username?: string;
  phone?: string;
  profilePicture?: string;
};

export async function updateStaffMember(
  staffId: string,
  body: UpdateStaffInput,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffMember }>>(
    `/staff/${staffId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    },
  );
  return res.data.staff;
}

export async function setStaffStatus(
  staffId: string,
  isActive: boolean,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffMember }>>(
    `/staff/${staffId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
      token,
    },
  );
  return res.data.staff;
}

export async function resetStaffPassword(
  staffId: string,
  password: string,
  token: string,
) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffMember }>>(
    `/staff/${staffId}/reset-password`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
      token,
    },
  );
  return res.data.staff;
}

export async function removeStaffMember(staffId: string, token: string) {
  const res = await apiRequest<ApiEnvelope<{ deleted: true }>>(
    `/staff/${staffId}`,
    { method: "DELETE", token },
  );
  return res.data;
}
