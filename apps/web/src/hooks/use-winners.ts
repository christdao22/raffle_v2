import type { Winner } from "@raffle_v2/shared";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";
import { useSetDisplayTypeMutation } from "./use-live";
import { prizeKeys } from "./use-prizes";
import { regionKeys } from "./use-regions";

interface UseDrawCandidatesParams {
  prizeId?: string;
  numberOfWinners?: number;
  regionId?: string[];
  enabled?: boolean;
}

interface SaveWinnersPayload {
  prizeId: string;
  personIds: string[];
}

interface RejectDrawCandidatesPayload extends SaveWinnersPayload {
  reason: string;
}

interface UseWinnersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

/** The list endpoint adds aggregate distribution counts to the shared pagination metadata. */
interface WinnersResponse {
  data: Winner[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    stats: {
      receivedCount: number;
      pendingCount: number;
      totalPrizes: number;
    };
  };
}

export const winnerKeys = {
  all: ["winners"] as const,
  draws: () => [...winnerKeys.all, "draw"] as const,
  draw: (params: UseDrawCandidatesParams) => [...winnerKeys.draws(), params] as const,
  lists: () => [...winnerKeys.all, "list"] as const,
  list: (params: UseWinnersParams) => [...winnerKeys.lists(), params] as const,
};

export function useWinners(params: UseWinnersParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const search = params.search;

  return useQuery({
    queryKey: winnerKeys.list({ page, pageSize, search }),
    queryFn: async () => {
      const res = await api.winners.$get({
        query: {
          page: String(page),
          pageSize: String(pageSize),
          ...(search ? { search } : {}),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load winners");
      }

      return (await res.json()) as unknown as WinnersResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUnclaimedWinners(params: UseWinnersParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;

  return useQuery({
    queryKey: winnerKeys.list({ page, pageSize }),
    queryFn: async () => {
      const res = await api.winners.$get({
        query: {
          page: String(page),
          pageSize: String(pageSize),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load unclaimed winners");
      }

      return (await res.json()) as unknown as WinnersResponse;
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDrawCandidates(params: UseDrawCandidatesParams = {}) {
  const { prizeId, numberOfWinners, regionId = [] } = params;

  return useQuery({
    queryKey: winnerKeys.draw({ prizeId, numberOfWinners, regionId }),
    queryFn: async () => {
      if (!prizeId) {
        throw new Error("Prize ID is required");
      }

      const res = await api.winners.draw.$get({
        query: {
          prizeId,
          numberOfWinners: String(numberOfWinners),
          ...(regionId.length > 0 ? { regionId: regionId.join(",") } : {}),
        },
      });

      if (res.status !== 200) {
        throw new Error((await res.json()).message);
      }

      return res.json();
    },
    enabled: params.enabled,
    refetchOnWindowFocus: false, // Prevents redraw when switching browser tabs
    refetchOnReconnect: false, // Prevents redraw on network reconnect
    staleTime: Infinity, // Keeps the current draw results frozen in cache
  });
}

export function useSaveWinnersMutation() {
  const queryClient = useQueryClient();
  const display = useSetDisplayTypeMutation();

  return useMutation({
    mutationFn: async (payload: SaveWinnersPayload) => {
      const res = await api.winners.draw.$post({
        json: payload,
      });

      if (!res.ok) {
        throw new Error("Failed to save winners");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winnerKeys.all });
      queryClient.invalidateQueries({ queryKey: prizeKeys.all });
      queryClient.invalidateQueries({ queryKey: regionKeys.all });
      display.mutate("standby");
    },
  });
}

export function useRejectDrawCandidatesMutation() {
  return useMutation({
    mutationFn: async (payload: RejectDrawCandidatesPayload) => {
      const res = await api.winners.draw.reject.$post({ json: payload });

      if (!res.ok) {
        throw new Error("Failed to record rejected draw candidates");
      }

      return res.json();
    },
  });
}

export function useClaimWinnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { winnerId: string }) => {
      const res = await api.winners.claim.$patch({
        json: payload,
      });

      if (!res.ok) {
        throw new Error("Failed to claim");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winnerKeys.all });
    },
  });
}

export function useDeleteWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.winners.delete[":id"].$delete({
        param: { id },
        json: { reason },
      });

      if (!res.ok) {
        let message = "Failed to remove winner";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winnerKeys.all });
    },
  });
}

export function useRedrawWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ winnerId, reason }: { winnerId: string; reason: string }) => {
      const res = await api.winners.redraw.$post({
        json: { winnerId, reason },
      });

      if (!res.ok) {
        let message = "Failed to redraw winner";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: winnerKeys.all });
    },
  });
}
