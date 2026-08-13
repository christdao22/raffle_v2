import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api-client";

export type DisplayType = "standby" | "live" | "unclaimed" | "live-unclaimed";
export type Winners = {
  id: string;
  fullname: string;
  employeeId: string;
  image: string;
  region: {
    id: string;
    region: string;
    regionName: string;
  };
  isEligible: boolean;
};

export const liveKeys = {
  all: ["live"] as const,
  status: () => [...liveKeys.all, "status"] as const,
  events: () => [...liveKeys.all, "events"] as const,
  winners: () => [...liveKeys.all, "winners"] as const,
};

export function useLiveStatus(refetchInterval: number | false = 5000) {
  return useQuery({
    queryKey: liveKeys.status(),
    queryFn: async () => {
      const res = await api.live.status.$get();

      if (!res.ok) {
        throw new Error("Failed to fetch live status");
      }

      return res.json();
    },
    refetchInterval,
  });
}

export function useLiveEvents() {
  return useQuery({
    queryKey: liveKeys.events(),
    queryFn: async () => {
      const res = await api.live.events.$get();

      if (!res.ok) {
        throw new Error("Failed to fetch active live events");
      }

      return res.json();
    },
  });
}

export function useSetDisplayTypeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (type: DisplayType) => {
      const res = await api.live.type.$post({
        json: { type },
      });

      if (!res.ok) {
        throw new Error("Failed to update display type");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveKeys.all });
    },
  });
}

export function useSetDisplayWinners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (persons: Winners[]) => {
      const res = await api.live.winners.$post({
        json: { persons },
      });

      if (!res.ok) {
        throw new Error("Failed to update display type");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: liveKeys.all });
    },
  });
}
