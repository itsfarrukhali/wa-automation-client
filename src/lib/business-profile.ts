import { apiRequest } from "@/lib/api";

export type WorkingHoursDay = {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

export type BusinessProfile = {
  _id: string;
  name: string;
  timezone: string;
  workingHours: WorkingHoursDay[];
};

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

export async function getMyBusinessProfile(token: string) {
  const res = await apiRequest<ApiEnvelope<{ business: BusinessProfile }>>(
    "/business/me",
    { token },
  );
  return res.data.business;
}
