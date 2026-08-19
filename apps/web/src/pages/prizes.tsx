import type { Prize } from "@raffle_v2/shared";
import { Button, cn, DataTable, type DataTableColumn } from "@raffle_v2/ui";
import { Trophy } from "lucide-react";
import ConfirmationModal from "../components/Custom/ConfirmationModal";
import Layout from "../components/layout";
import { useTableState } from "../hooks/datatable/use-table-state";
import { useConfirmationModal } from "../hooks/use-modal";
import { useDeletePrize, usePrizes } from "../hooks/use-prizes";

export function Prizes() {
  const table = useTableState({ pageSize: 2 });
  const deleteConfirmation = useConfirmationModal();

  const deletePrize = useDeletePrize();

  const { data: prizes, isLoading: isPrizesLoading } = usePrizes({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
  });

  const handleDeletePrize = (id: string) => {
    deleteConfirmation.openConfirmModal({
      title: "Delete Prize?",
      description: "Are you sure you want to delete this prize?",
      confirmText: "Confirm Delete",
      variant: "danger",
      onConfirm: async () => {
        deletePrize.mutate(id);
      },
    });
  };

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
    {
      id: "action",
      header: "Action",
      cell: (prize) => (
        <Button
          // disabled={claimWinner.isPending}
          onClick={() => handleDeletePrize(prize.id)}
          className={cn(
            "rounded-lg px-4 py-2 w-full max-w-25 text-xs font-black uppercase tracking-wider transition-all shadow-xs",
            "bg-tr-secondary text-tr-on-primary hover:bg-tr-secondary/90 hover:shadow-md active:scale-95",
          )}
        >
          Delete
        </Button>
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

      <ConfirmationModal {...deleteConfirmation.modalProps} />
    </Layout>
  );
}
