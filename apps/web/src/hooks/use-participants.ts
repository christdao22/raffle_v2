import type { CreateParticipantInput } from "@raffle_v2/shared";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

const PARTICIPANTS_KEY = ["participants"] as const;

export function useParticipants(
  params: { page?: number; pageSize?: number; search?: string } = {},
) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const search = params.search;

  return useQuery({
    queryKey: [...PARTICIPANTS_KEY, page, pageSize, search] as const,
    queryFn: async () => {
      const res = await api.participants.$get({
        query: {
          page: String(page),
          pageSize: String(pageSize),
          ...(search ? { search } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to load participants");
      return res.json();
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateParticipantInput) => {
      const res = await api.participants.$post({ json: input });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body && "error" in body ? body.error : "Failed to create participant");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY });
    },
  });
}

export function useDeleteParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.participants[":id"].$delete({ param: { id } });
      if (!res.ok) throw new Error("Failed to delete participant");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY });
    },
  });
}

