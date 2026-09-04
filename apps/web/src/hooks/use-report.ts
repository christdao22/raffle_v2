import type { RaffleReport } from "@raffle_v2/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const reportKeys = {
  all: ["reports"] as const,
  details: () => [...reportKeys.all, "detail"] as const,
  detail: (raffleId: string, startDate?: string, endDate?: string) =>
    [...reportKeys.details(), raffleId, startDate, endDate] as const,
};

export function useReport(raffleId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: reportKeys.detail(raffleId, startDate, endDate),
    queryFn: async () => {
      const query = new URLSearchParams();
      if (startDate) query.set("startDate", startDate);
      if (endDate) query.set("endDate", endDate);
      const url = `${apiBaseUrl}/report/${encodeURIComponent(raffleId)}${query.size ? `?${query}` : ""}`;
      const res = await fetch(url, {
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load raffle report");
      }

      return (await res.json()) as RaffleReport;
    },
    enabled: Boolean(raffleId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}
