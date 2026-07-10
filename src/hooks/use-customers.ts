"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  getCustomerBookings,
  importCustomers,
  listCustomers,
  updateCustomer,
  type CustomerFormInput,
  type CustomerListParams,
} from "@/lib/customers";

const KEY = "customers";

export function useCustomerList(params: CustomerListParams) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "list", params],
    queryFn: () => listCustomers(params, token as string),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useCustomer(customerId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "detail", customerId],
    queryFn: () => getCustomer(customerId as string, token as string),
    enabled: Boolean(token) && Boolean(customerId),
  });
}

export function useCustomerBookings(customerId: string | null) {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "bookings", customerId],
    queryFn: () =>
      getCustomerBookings(customerId as string, { limit: 10 }, token as string),
    enabled: Boolean(token) && Boolean(customerId),
  });
}

export function useCreateCustomer() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CustomerFormInput) =>
      createCustomer(body, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, "list"] }),
  });
}

export function useUpdateCustomer() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<CustomerFormInput>;
    }) => updateCustomer(id, body, token as string),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [KEY, "list"] });
      queryClient.invalidateQueries({
        queryKey: [KEY, "detail", variables.id],
      });
    },
  });
}

export function useDeleteCustomer() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, "list"] }),
  });
}

export function useImportCustomers() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      customers: Array<{ name: string; phone: string; email?: string }>,
    ) => importCustomers(customers, token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, "list"] }),
  });
}
