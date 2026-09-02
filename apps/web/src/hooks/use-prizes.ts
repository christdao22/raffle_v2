import type { Prize } from "@raffle_v2/shared";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api-client";

interface UsePrizesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const prizeKeys = {
  all: ["prizes"] as const,
  lists: () => [...prizeKeys.all, "list"] as const,
  list: (params: UsePrizesParams) => [...prizeKeys.lists(), params] as const,
  details: () => [...prizeKeys.all, "detail"] as const,
  detail: (id: string) => [...prizeKeys.details(), id] as const,
};

export function usePrizes(params: UsePrizesParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const search = params.search;

  return useQuery({
    queryKey: prizeKeys.list({ page, pageSize, search }),
    queryFn: async () => {
      const res = await api.prizes.$get({
        query: {
          page: String(page),
          pageSize: String(pageSize),
          ...(search ? { search } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load prizes");
      }

      return res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrize(id: string) {
  return useQuery({
    queryKey: prizeKeys.detail(id),
    queryFn: async () => {
      const res = await api.prizes[":id"].$get({
        param: { id },
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Prize not found");
        }
        throw new Error(`Failed to fetch prize with ID: ${id}`);
      }

      return res.json();
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSelectPrizeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prizeId: string) => {
      const res = await api.prizes.select.$post({
        json: { prizeId },
      });

      if (!res.ok) {
        throw new Error("Failed to select active prize");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: prizeKeys.all });
    },
  });
}

export function useDeletePrize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prizeId: string) => {
      const res = await api.prizes.delete.$delete({
        json: { prizeId },
      });

      if (!res.ok) {
        let message = "Failed to delete prize";

        try {
          const errorData = (await res.clone().json()) as Record<string, unknown> | null;
          const maybeMessage = errorData?.message;

          if (typeof maybeMessage === "string") {
            message = maybeMessage;
          }
        } catch {}

        throw new Error(message);
      }

      return res.json();
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: prizeKeys.lists() });
      const previousItems = queryClient.getQueryData<Prize[]>(prizeKeys.lists());
      queryClient.setQueryData<Prize[]>(prizeKeys.lists(), (old) => {
        if (!old) return [];

        return old.filter((prize) => prize.id !== deletedId);
      });

      return { previousItems };
    },
    onSuccess: () => {
      toast.success("Deleted successfully!");
    },
    onError: (error, _deletedId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(prizeKeys.lists(), context.previousItems);
      }

      toast.error(error instanceof Error ? error.message : "Failed to delete prize");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prizeKeys.all });
    },
  });
}

export function useUpdatePrize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Prize) => {
      const { id } = data;
      const res = await api.prizes.update[":id"].$patch({
        param: { id },
        json: data,
      });

      if (!res.ok) {
        let message = "Failed to update prize";

        try {
          const errorData = (await res.clone().json()) as Record<string, unknown> | null;
          if (typeof errorData?.message === "string") message = errorData.message;
        } catch {}

        throw new Error(message);
      }

      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prizeKeys.all });
    },
  });
}

export function useCreatePrize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Prize, "id">) => {
      const res = await api.prizes.$post({ json: data });
      if (!res.ok) {
        let message = "Failed to create prize";

        try {
          const errorData = (await res.clone().json()) as Record<string, unknown> | null;
          if (typeof errorData?.message === "string") message = errorData.message;
        } catch {}

        throw new Error(message);
      }
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: prizeKeys.all });
    },
  });
}
