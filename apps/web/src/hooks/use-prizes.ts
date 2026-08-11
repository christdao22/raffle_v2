import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
  detail: (id: string) => [...prizeKeys.all, "detail", id] as const,
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

// async function fetchPrizeById(id: string): Promise<Prize> {
//   const response = await api.prizes[":id"].$get({ param: { id } }1);
//   if (!response.ok) {
//     throw new Error(`Failed to fetch prize with ID: ${id}`);
//   }
//   return response.json();
// }

// Hook to fetch a single prize by ID
// export function usePrize(id: string) {
//   return useQuery({
//     queryKey: prizeKeys.detail(id),
//     queryFn: () => fetchPrizeById(id),
//     enabled: Boolean(id),
//   });
// }

// Optional Hook to handle selecting a active prize tier
// export function useSelectPrizeTier() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (prizeId: string) => {
//       const response = await fetch(`/api/prizes/${prizeId}/select`, {
//         method: "POST",
//       });
//       if (!response.ok) throw new Error("Failed to set active prize tier");
//       return response.json();
//     },
//     onSuccess: () => {
//       // Invalidate prize list to sync active state or remaining counts
//       queryClient.invalidateQueries({ queryKey: prizeKeys.all });
//     },
//   });
// }
