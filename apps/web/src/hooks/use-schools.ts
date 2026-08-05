import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../lib/api-client";

const KEY = ["school"] as const;

export function useSchools(params: { page?: number; pageSize?: number; search?: string } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const search = params.search;

  return useQuery({
    queryKey: [...KEY, page, pageSize, search] as const,
    queryFn: async () => {
      const res = await api.school.$get({
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
