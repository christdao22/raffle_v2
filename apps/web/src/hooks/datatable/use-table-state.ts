import { useEffect, useState } from "react";
import { useDebouncedValue } from "../use-debounced-value";

interface UseTableStateOptions {
  pageSize?: number;
  debounceMs?: number;
}

/**
 * Manages the search input + pagination state a DataTable needs, and
 * resets back to page 1 whenever the (debounced) search term changes.
 *
 * Usage:
 *   const table = useTableState();
 *   const { data } = useWinners({ page: table.page, pageSize: table.pageSize, search: table.search });
 *   <DataTable
 *     search={{ value: table.searchInput, onChange: table.setSearchInput }}
 *     pagination={{ page: table.page, totalPages, total, onPageChange: table.setPage }}
 *     ...
 *   />
 */
export function useTableState({ pageSize = 5, debounceMs = 300 }: UseTableStateOptions = {}) {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, debounceMs);

  useEffect(() => {
    setPage(1);
  }, []);

  return {
    page,
    setPage,
    pageSize,
    searchInput,
    setSearchInput,
    search,
  };
}
