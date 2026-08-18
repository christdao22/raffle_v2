import type { Prize } from "@raffle_v2/shared";
import { DataTable, type DataTableColumn } from "@raffle_v2/ui";
import { Trophy } from "lucide-react";
import Layout from "../components/layout";
import { useTableState } from "../hooks/datatable/use-table-state";
import { usePrizes } from "../hooks/use-prizes";

export function Prizes() {
  const table = useTableState({ pageSize: 2 });

  const { data: prizes, isLoading: isPrizesLoading } = usePrizes({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
  });

  const columns: DataTableColumn<Prize>[] = [
    {
      id: "prize",
      header: "Prize Name",
      cell: (prize) => (
        <div>
          <p className="font-display font-black uppercase text-tr-secondary group-hover:text-tr-primary transition-colors">
            {prize.prize}
          </p>
          <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">{prize.type}</p>
        </div>
      ),
    },
    {
      id: "sponsor",
      header: "Sponsor",
      cell: (prize) => (
        <div>
          <p className="font-display font-bold text-sm uppercase text-tr-primary">
            {prize.sponsor}
          </p>
        </div>
      ),
    },
    {
      id: "number-of-items",
      header: "Number of Items",
      cell: (prize) => (
        <span className="inline-block rounded-md bg-tr-surface-container-high px-2.5 py-1 text-xs font-semibold uppercase text-tr-on-surface">
          {prize.numberOfWinners}
        </span>
      ),
    },
  ];

  return (
    <Layout pageTitle="Raffle Prizes">
      <DataTable
        columns={columns}
        data={prizes?.data}
        isLoading={isPrizesLoading}
        rowKey={(prize) => prize.id}
        header={{
          icon: Trophy,
          title: "Raffle Prizes",
          subtitle: "Search and process raffle prize distribution records.",
        }}
        search={{
          value: table.searchInput,
          onChange: table.setSearchInput,
          placeholder: "Search prize...",
        }}
        pagination={{
          page: table.page,
          totalPages: prizes?.meta.pagination.totalPages ?? 1,
          total: prizes?.meta.pagination.total ?? 0,
          onPageChange: table.setPage,
        }}
        emptyState={{
          icon: Trophy,
          title: "No prizes found",
          description: "There are currently no prize records to display.",
          searchDescription: "No results match your search parameters. Try a different query.",
        }}
        footerExtra={(rows) => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-tr-primary">
            {rows.length} items on this page
          </span>
        )}
      />
    </Layout>
  );
}
