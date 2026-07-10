import { apiRequest } from "@/lib/api";

export type StaffOption = {
  _id: string;
  name: string;
  role: "owner" | "staff";
  isActive: boolean;
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function listActiveStaff(token: string) {
  const res = await apiRequest<ApiEnvelope<{ staff: StaffOption[] }>>(
    "/staff?limit=100&isActive=true",
    { token },
  );
  return res.data.staff;
}
