import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";
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

export const winnerKeys = {
  all: ["winners"] as const,
  draws: () => [...winnerKeys.all, "draw"] as const,
  draw: (params: UseDrawCandidatesParams) => [...winnerKeys.draws(), params] as const,
};

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
    },
  });
}
