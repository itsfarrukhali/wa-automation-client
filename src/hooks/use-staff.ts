// src/hooks/use-staff.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  createStaffMember,
  getStaffMember,
  listActiveStaff,
  listStaff,
  removeStaffMember,
  resetStaffPassword,
  setStaffStatus,
  updateStaffMember,
  type CreateStaffInput,
  type StaffListParams,
  type UpdateStaffInput,
} from "@/lib/staff";

const KEY = "staff";

export function useActiveStaffOptions() {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "active-options"],
    queryFn: () => listActiveStaff(token as string),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

export function useStaffList(params: StaffListParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => listStaff(params, token as string),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useStaffMember(staffId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "detail", staffId],
    queryFn: () => getStaffMember(staffId as string, token as string),
    enabled: Boolean(token) && Boolean(staffId),
  });
}

function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [KEY, "list"] });
    queryClient.invalidateQueries({ queryKey: [KEY, "active-options"] });
  };
}

export function useCreateStaff() {
  const { token } = useAuth();
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (body: CreateStaffInput) =>
      createStaffMember(body, token as string),
    onSuccess: invalidate,
  });
}

export function useUpdateStaff() {
  const { token } = useAuth();
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateStaffInput }) =>
      updateStaffMember(id, body, token as string),
    onSuccess: invalidate,
  });
}

export function useSetStaffStatus() {
  const { token } = useAuth();
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setStaffStatus(id, isActive, token as string),
    onSuccess: invalidate,
  });
}

export function useResetStaffPassword() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetStaffPassword(id, password, token as string),
  });
}

export function useRemoveStaff() {
  const { token } = useAuth();
  const invalidate = useInvalidateStaff();
  return useMutation({
    mutationFn: (id: string) => removeStaffMember(id, token as string),
    onSuccess: invalidate,
  });
}
