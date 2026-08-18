import { Button, cn } from "@raffle_v2/ui";
import { ChevronLeft, ChevronRight, type LucideIcon, Search } from "lucide-react";
import type { ReactNode } from "react";
import { TableSkeleton } from "../Skeleton/TableSkeleton";

/**
 * Column definition for DataTable.
 *
 * `cell` receives the full row and returns whatever you want rendered
 * in that cell, so columns can be as simple or as composed as you need.
 */
export interface DataTableColumn<T> {
  /** Stable identifier, used as the React key for the header cell. */
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableEmptyState {
  icon?: LucideIcon;
  title: string;
  description: string;
  /** Shown instead of `description` when a search query is active. */
  searchDescription?: string;
}

export interface DataTablePagination {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface DataTableSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export interface DataTableHeader {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[] | undefined;
  isLoading?: boolean;
  rowKey: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;

  header?: DataTableHeader;
  search?: DataTableSearch;
  pagination?: DataTablePagination;
  emptyState?: DataTableEmptyState;

  /** Extra content rendered on the left side of the footer, next to the page count. */
  footerExtra?: (visibleRows: T[]) => ReactNode;

  skeletonRows?: number;
  minTableWidth?: string;
  className?: string;
}

function alignClass(align: DataTableColumn<unknown>["align"]) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  rowKey,
  rowClassName,
  header,
  search,
  pagination,
  emptyState,
  footerExtra,
  skeletonRows,
  minTableWidth = "700px",
  className,
}: DataTableProps<T>) {
  const rows = data ?? [];
  const hasSearch = Boolean(search?.value);

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? rows.length;

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest shadow-sm font-sans overflow-hidden",
        className,
      )}
    >
      {/* Header Section */}
      {(header || search) && (
        <div className="flex flex-col gap-4 border-b border-tr-outline-variant/20 p-5 sm:flex-row sm:items-center sm:justify-between bg-tr-surface-container-lowest">
          {header && (
            <div className="flex items-start gap-3">
              {header.icon && (
                <div className="rounded-xl bg-tr-tertiary-container/20 p-2.5 text-tr-tertiary">
                  <header.icon className="h-5 w-5" />
                </div>
              )}
              <div>
                <h2 className="font-display text-lg font-black uppercase tracking-tight text-tr-secondary">
                  {header.title}
                </h2>
                {header.subtitle && (
                  <p className="mt-0.5 text-xs text-tr-on-surface-variant">{header.subtitle}</p>
                )}
              </div>
            </div>
          )}

          {search && (
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tr-on-surface-variant/70" />
              <input
                type="text"
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                placeholder={search.placeholder ?? "Search..."}
                className="h-10 w-full rounded-xl border border-tr-outline-variant/40 bg-tr-surface-container-low pl-10 pr-4 text-sm font-medium outline-none transition-all text-tr-on-surface placeholder:text-tr-on-surface-variant/50 focus:border-tr-primary focus:ring-2 focus:ring-tr-primary/10"
              />
            </div>
          )}
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth: minTableWidth }}>
          <thead>
            <tr className="border-b border-tr-outline-variant/20 bg-tr-surface-container-low/50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-tr-on-surface-variant",
                    alignClass(col.align),
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-tr-outline-variant/10">
            {isLoading ? (
              <TableSkeleton rows={skeletonRows ?? pagination?.total ?? 5} />
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    "group border-b border-tr-outline-variant/10 transition-colors hover:bg-tr-surface-container-low/60",
                    rowClassName?.(row),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn("px-5 py-4", alignClass(col.align), col.cellClassName)}
                    >
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={columns.length} hasSearch={hasSearch} emptyState={emptyState} />
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      {pagination && (
        <div className="flex flex-col gap-3 border-t border-tr-outline-variant/20 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-tr-surface-container-low/30">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-tr-on-surface-variant">
              Page <strong className="text-tr-on-surface">{currentPage}</strong> of{" "}
              <strong className="text-tr-on-surface">{totalPages}</strong> ·{" "}
              <strong className="text-tr-on-surface">{total}</strong> total records
            </span>
            {footerExtra && (
              <>
                <span className="h-1 w-1 rounded-full bg-tr-outline-variant/50 hidden sm:inline-block" />
                {footerExtra(rows)}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => pagination.onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || isLoading}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border border-tr-outline-variant/30",
                currentPage <= 1
                  ? "cursor-not-allowed bg-tr-surface-container-high/50 text-tr-on-surface-variant/40 border-transparent"
                  : "bg-tr-surface-container-lowest text-tr-on-surface hover:bg-tr-surface-container-low active:scale-95 shadow-xs",
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Button>

            <Button
              onClick={() => pagination.onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border border-tr-outline-variant/30",
                currentPage >= totalPages
                  ? "cursor-not-allowed bg-tr-surface-container-high/50 text-tr-on-surface-variant/40 border-transparent"
                  : "bg-tr-surface-container-lowest text-tr-on-surface hover:bg-tr-surface-container-low active:scale-95 shadow-xs",
              )}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyRow({
  colSpan,
  hasSearch,
  emptyState,
}: {
  colSpan: number;
  hasSearch: boolean;
  emptyState?: DataTableEmptyState;
}) {
  const Icon = emptyState?.icon;
  const title = emptyState?.title ?? "No records found";
  const description = hasSearch
    ? (emptyState?.searchDescription ??
      "No results match your search parameters. Try a different query.")
    : (emptyState?.description ?? "There are currently no records to display.");

  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        {Icon && (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tr-surface-container-high/50">
            <Icon className="h-7 w-7 text-tr-on-surface-variant/60" />
          </div>
        )}
        <p className="mt-4 font-display font-bold text-base text-tr-on-surface">{title}</p>
        <p className="mt-1 text-xs text-tr-on-surface-variant">{description}</p>
      </td>
    </tr>
  );
}
