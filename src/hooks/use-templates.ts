// src/hooks/use-templates.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { listTemplates, syncTemplatesFromMeta } from "@/lib/templates";

const KEY = "templates";

export function useTemplateList() {
  const { token } = useAuth();
  return useQuery({
    queryKey: [KEY, "list"],
    queryFn: () => listTemplates(token as string),
    enabled: Boolean(token),
  });
}

export function useSyncTemplates() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncTemplatesFromMeta(token as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [KEY, "list"] }),
  });
}
