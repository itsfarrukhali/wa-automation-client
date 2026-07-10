"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  createService,
  deleteService,
  getService,
  getServiceAnalytics,
  importServices,
  listServices,
  updateService,
  type ServiceFormInput,
  type ServiceImportRow,
  type ServiceListParams,
} from "@/lib/services";
import { listActiveStaff } from "@/lib/staff";

const KEY = "services";

export function useServiceList(params: ServiceListParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => listServices(params, token as string),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useService(serviceId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "detail", serviceId],
    queryFn: () => getService(serviceId as string, token as string),
    enabled: Boolean(token) && Boolean(serviceId),
  });
}

export function useServiceAnalytics() {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "analytics"],
    queryFn: () => getServiceAnalytics(token as string),
    enabled: Boolean(token),
  });
}

export function useActiveStaffOptions() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["staff", "active-options"],
    queryFn: () => listActiveStaff(token as string),
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}

function useInvalidateServices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: [KEY, "list"] });
    queryClient.invalidateQueries({ queryKey: [KEY, "analytics"] });
  };
}

export function useCreateService() {
  const { token } = useAuth();
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: (body: ServiceFormInput) =>
      createService(body, token as string),
    onSuccess: invalidate,
  });
}

export function useUpdateService() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<ServiceFormInput>;
    }) => updateService(id, body, token as string),
    onSuccess: (_data, variables) => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: [KEY, "detail", variables.id],
      });
    },
  });
}

export function useDeleteService() {
  const { token } = useAuth();
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: (id: string) => deleteService(id, token as string),
    onSuccess: invalidate,
  });
}

export function useImportServices() {
  const { token } = useAuth();
  const invalidate = useInvalidateServices();
  return useMutation({
    mutationFn: (rows: ServiceImportRow[]) =>
      importServices(rows, token as string),
    onSuccess: invalidate,
  });
}
