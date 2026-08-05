import type { PaginationQuery } from "@raffle_v2/shared";

interface PaginateArgs<T> extends PaginationQuery {
  /** Typically `() => db.$count(table, where)` */
  count: () => Promise<number>;
  /** Typically `({ limit, offset }) => db.query.<table>.findMany({ limit, offset, ... })` */
  query: (args: { limit: number; offset: number }) => Promise<T[]>;
}

export async function paginate<T>({ page, pageSize, count, query }: PaginateArgs<T>) {
  const offset = (page - 1) * pageSize;
  const [total, data] = await Promise.all([count(), query({ limit: pageSize, offset })]);

  return {
    data,
    meta: {
      pagination: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    },
  };
}

