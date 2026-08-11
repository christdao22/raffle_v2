import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";

interface UseRegionsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const regionKeys = {
  all: ["regions"] as const,
  lists: () => [...regionKeys.all, "list"] as const,
  list: (params: UseRegionsParams) => [...regionKeys.lists(), params] as const,
  detail: (id: string) => [...regionKeys.all, "detail", id] as const,
};

export function useRegions(params: UseRegionsParams = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const search = params.search;

  return useQuery({
    queryKey: regionKeys.list({ page, pageSize, search }),
    queryFn: async () => {
      const res = await api.regions.$get({
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
