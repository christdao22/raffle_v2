import type { Prize } from "@raffle_v2/shared";
import { Button, cn, DataTable, type DataTableColumn } from "@raffle_v2/ui";
import { Edit, Gift, Loader2, Trash2, Trophy } from "lucide-react";
import { Toaster, toast } from "sonner";
import ConfirmationModal from "../components/Custom/ConfirmationModal";
import Layout from "../components/layout";
import { useTableState } from "../hooks/datatable/use-table-state";
import { useConfirmationModal } from "../hooks/use-confirmation-modal";
import { useDeletePrize, usePrizes } from "../hooks/use-prizes";

export function Prizes() {
  const table = useTableState({ pageSize: 5 });
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
        toast.success("Deleted successfully!");
      },
    });
  };

  const columns: DataTableColumn<Prize>[] = [
    {
      id: "prize",
      header: "Prize Name",
      cell: (prize) => (
        <div>
          <p className="">{prize.prize}</p>
          <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">
            {prize.sponsor}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      align: "center",
      cell: (prize) => (
        <span className="inline-block rounded-md bg-tr-tertiary px-2.5 py-1 text-xs font-semibold">
          {prize.type}
        </span>
      ),
    },
    {
      id: "number-of-items",
      header: "Number of Items",
      align: "center",
      cell: (prize) => (
        <span className="inline-block rounded-md bg-tr-surface-container-high px-2.5 py-1 text-xs font-semibold uppercase ">
          {prize.numberOfWinners}
        </span>
      ),
    },
    {
      id: "action",
      header: "Actions",
      align: "center",
      cell: (prize) => (
        <>
          <Button
            disabled={deletePrize.isPending}
            onClick={() => handleDeletePrize(prize.id)}
            className={cn(
              "px-2 py-2 text-xs text-secondary-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            {deletePrize.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Edit className={" transition-all hover:text-secondary-container/75 "} />
            )}
          </Button>
          <Button
            disabled={deletePrize.isPending}
            onClick={() => handleDeletePrize(prize.id)}
            className={cn(
              "px-2 py-2 text-xs text-error-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            {deletePrize.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 className={" transition-all hover:text-error-container/80 "} />
            )}
          </Button>
        </>
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
          icon: Gift,
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
