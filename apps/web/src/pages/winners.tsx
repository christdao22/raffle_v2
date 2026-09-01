import type { Winner } from "@raffle_v2/shared";
import { Button, Chip, cn, DataTable, type DataTableColumn } from "@raffle_v2/ui";
import { Check, CircleArrowRight, CircleX, Clock, RefreshCcw, TrendingUp, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmationModal from "../components/Custom/ConfirmationModal";
import { ReasonModal } from "../components/Custom/ReasonModal";
import { StatCard } from "../components/Custom/StatCard";
import Layout from "../components/layout";
import { useTableState } from "../hooks/datatable/use-table-state";
import { useConfirmationModal } from "../hooks/use-confirmation-modal";
import {
  useClaimWinnerMutation,
  useDeleteWinner,
  useRedrawWinner,
  useWinners,
} from "../hooks/use-winners";

export function Winners() {
  const table = useTableState({ pageSize: 10 });

  const { data: winners, isLoading: isWinnerLoading } = useWinners({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
  });

  const claimConfirmation = useConfirmationModal();
  const claimWinner = useClaimWinnerMutation();
  const deleteWinner = useDeleteWinner();
  const redrawWinner = useRedrawWinner();

  const [reasonModal, setReasonModal] = useState<{ open: boolean; mode: "delete" | "redraw"; winnerId: string | null }>({
    open: false,
    mode: "delete",
    winnerId: null,
  });

  const total: number = winners?.meta.pagination.total ?? 0;
  const receivedCount = winners?.meta?.stats?.receivedCount ?? 0;
  const pendingCount = winners?.meta?.stats?.pendingCount ?? 0;
  const receivedPercent = total > 0 ? Math.round((receivedCount / total) * 100) : 0;

  const handleClaimPrize = (id: string) => {
    claimConfirmation.openConfirmModal({
      title: "Claim Prize?",
      description: "Are you sure you want to process this prize claim?",
      confirmText: "Confirm Claim",
      variant: "warning",
      onConfirm: async () => {
        claimWinner.mutate({ winnerId: id });
        toast.success("claimed successfully!");
      },
    });
  };

  const handleDeleteWinner = (id: string) => {
    setReasonModal({ open: true, mode: "delete", winnerId: id });
  };

  const handleRedrawWinner = (id: string) => {
    setReasonModal({ open: true, mode: "redraw", winnerId: id });
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!reasonModal.winnerId) return;

    if (reasonModal.mode === "delete") {
      await deleteWinner.mutateAsync({ id: reasonModal.winnerId, reason });
      toast.success("Winner removed successfully!");
    }

    if (reasonModal.mode === "redraw") {
      await redrawWinner.mutateAsync({ winnerId: reasonModal.winnerId, reason });
      toast.success("Winner redraw completed successfully!");
    }

    setReasonModal({ open: false, mode: "delete", winnerId: null });
  };

  const columns: DataTableColumn<Winner>[] = [
    {
      id: "winner",
      header: "Winner",
      cell: (winner) => (
        <div>
          <p>{winner.person.fullname}</p>
          <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">{winner.id}</p>
        </div>
      ),
    },
    {
      id: "prize",
      header: "Prize",
      cell: (winner) => (
        <div>
          <p>{winner.prize?.prize}</p>
          {winner.prize?.sponsor && (
            <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">
              {winner.prize.sponsor}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "division",
      header: "Division",
      align: "center",
      cell: (winner) => <Chip>{winner?.person?.region?.region ?? "—"}</Chip>,
    },
    {
      id: "status",
      header: "Status",
      align: "center",
      cell: (winner) => (
        <>
          {winner.isReceived ? (
            <Chip variant={"secondary"} className={"gap-1"}>
              <CircleArrowRight className="h-3.5 w-3.5 shrink-0" />
              Claimed
            </Chip>
          ) : (
            <Chip variant={"error"} className={"gap-1"}>
              <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse" />
              Unclaimed
            </Chip>
          )}
        </>
      ),
    },
    {
      id: "action",
      header: "Action",
      align: "center",
      cell: (winner) => (
        <>
          <Button
            disabled={winner.isReceived || claimWinner.isPending}
            onClick={() => handleClaimPrize(winner.id)}
            className={cn(
              "px-1 py-2 text-xs text-secondary-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
              winner.isReceived
                ? "cursor-not-allowed text-tr-on-surface-variant/60 shadow-none opacity-80"
                : "hover:scale-110 hover:text-secondary-container/95",
            )}
          >
            <CircleArrowRight className="w-6" />
          </Button>
          {!winner.isReceived && (
            <Button
              disabled={winner.isReceived || claimWinner.isPending}
              onClick={() => handleDeleteWinner(winner.id)}
              className={cn(
                "px-1 py-2 text-xs text-error-container uppercase tracking-wider transition-all shadow-none",
                "bg-inherit",
              )}
            >
              <CircleX
                className={" transition-all hover:text-error-container/80 hover:scale-110 w-6"}
              />
            </Button>
          )}
          <Button
            disabled={claimWinner.isPending || redrawWinner.isPending || deleteWinner.isPending}
            onClick={() => handleRedrawWinner(winner.id)}
            className={cn(
              "px-1 py-2 text-xs text-secondary-container uppercase tracking-wider transition-all shadow-none",
              "bg-inherit",
            )}
          >
            <RefreshCcw className={"transition-all hover:text-secondary-container/95 hover:scale-110 w-6"} />
          </Button>
        </>
      ),
    },
  ];

  return (
    <Layout pageTitle="Raffle Winners">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="Total Winners"
          value={`${receivedPercent}%`}
          icon={TrendingUp}
          variant="secondary"
        />
        <StatCard
          title="Successfully Distributed"
          icon={Check}
          value={receivedCount}
          variant="primary"
        />
        <StatCard
          title="Awaiting Distribution"
          icon={Clock}
          value={pendingCount}
          variant="tertiary"
        />
      </div>
      <DataTable
        columns={columns}
        data={winners?.data}
        isLoading={isWinnerLoading}
        rowKey={(winner) => winner.id}
        header={{
          icon: Trophy,
          title: "Winner Claims",
          subtitle: "Search and process raffle prize distribution records.",
        }}
        search={{
          value: table.searchInput,
          onChange: table.setSearchInput,
          placeholder: "Search winner or prize...",
        }}
        pagination={{
          page: table.page,
          totalPages: winners?.meta.pagination.totalPages ?? 1,
          total: winners?.meta.pagination.total ?? 0,
          onPageChange: table.setPage,
        }}
        emptyState={{
          icon: Trophy,
          title: "No winners found",
          description: "There are currently no winner records to display.",
          searchDescription: "No results match your search parameters. Try a different query.",
        }}
        footerExtra={(rows) => (
          <span className="text-[10px] font-bold uppercase tracking-wider text-tr-primary">
            {rows.length} items on this page
          </span>
        )}
      />

      {/* Modal Hook Confirmation */}
      <ConfirmationModal {...claimConfirmation.modalProps} />

      <ReasonModal
        open={reasonModal.open}
        onOpenChange={(open) => setReasonModal((current) => ({ ...current, open }))}
        title={reasonModal.mode === "delete" ? "Delete Winner" : "Redraw Winner"}
        description={
          reasonModal.mode === "delete"
            ? "Please provide a reason for removing this winner."
            : "Please provide a reason for performing a redraw for this winner."
        }
        label="Reason"
        placeholder={
          reasonModal.mode === "delete"
            ? "Enter the reason for deleting this winner..."
            : "Enter the reason for the redraw..."
        }
        submitLabel={reasonModal.mode === "delete" ? "Delete Winner" : "Confirm Redraw"}
        onSubmit={handleReasonSubmit}
        loading={deleteWinner.isPending || redrawWinner.isPending}
      />
    </Layout>
  );
}
