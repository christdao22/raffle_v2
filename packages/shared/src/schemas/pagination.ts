import { z } from "zod";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Wraps any item schema in the standard list-response envelope. Use this
 * for every paginated list endpoint rather than hand-rolling the shape
 * per resource - it's what keeps `data` / `meta.pagination` consistent
 * across controllers, and it's what the frontend's hc<AppType>() client
 * infers its response type from.
 */
export function paginatedResponseSchema<T extends z.ZodTypeAny, M extends z.ZodRawShape = {}>(itemSchema: T, extraMeta?: M,) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      pagination: z.object({
        page: z.number().int(),
        pageSize: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
      }),
      ...(extraMeta ?? {}),
    }),
  });
}

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
