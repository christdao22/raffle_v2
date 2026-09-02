import type { Winner } from "@raffle_v2/shared";
import { Button, Chip, cn, DataTable, type DataTableColumn } from "@raffle_v2/ui";
import {
  Check,
  CircleArrowRight,
  CircleX,
  Clock,
  RefreshCcw,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useCallback, useState } from "react";
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

function WinnerReasonAction({ winnerId, mode }: { winnerId: string; mode: "delete" | "redraw" }) {
  const [open, setOpen] = useState(false);
  const deleteWinner = useDeleteWinner();
  const redrawWinner = useRedrawWinner();

  const handleSubmit = useCallback(
    async (reason: string) => {
      if (mode === "delete") {
        await deleteWinner.mutateAsync({ id: winnerId, reason });
        toast.success("Winner removed successfully!");
      } else {
        await redrawWinner.mutateAsync({ winnerId, reason });
        toast.success("Winner redraw completed successfully!");
      }

      setOpen(false);
    },
    [deleteWinner, mode, redrawWinner, winnerId],
  );

  const isDelete = mode === "delete";
  const isPending = deleteWinner.isPending || redrawWinner.isPending;

  return (
    <>
      <Button
        disabled={isPending}
        onClick={() => setOpen(true)}
        className={cn(
          "px-1 py-2 text-xs uppercase tracking-wider transition-colors shadow-none",
          "bg-inherit",
          isDelete
            ? "text-error-container"
            : "text-secondary-container hover:text-secondary-container/95",
        )}
      >
        {isDelete ? (
          <CircleX className="w-6 transition-transform hover:scale-110" />
        ) : (
          <RefreshCcw className="w-6 transition-transform hover:scale-110" />
        )}
      </Button>

      <ReasonModal
        open={open}
        onOpenChange={setOpen}
        title={isDelete ? "Delete Winner" : "Redraw Winner"}
        description={
          isDelete
            ? "Please provide a reason for removing this winner."
            : "Please provide a reason for performing a redraw for this winner."
        }
        label="Reason"
        placeholder={
          isDelete
            ? "Enter the reason for deleting this winner..."
            : "Enter the reason for the redraw..."
        }
        submitLabel={isDelete ? "Delete Winner" : "Confirm Redraw"}
        onSubmit={handleSubmit}
        loading={isPending}
      />
    </>
  );
}

function createWinnerColumns({
  onClaim,
  claimPending,
}: {
  onClaim: (id: string) => void;
  claimPending: boolean;
}): DataTableColumn<Winner>[] {
  return [
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
      cell: (winner) =>
        winner.isReceived ? (
          <Chip variant="secondary" className="gap-1">
            <CircleArrowRight className="h-3.5 w-3.5 shrink-0" />
            Claimed
          </Chip>
        ) : (
          <Chip variant="error" className="gap-1">
            <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse" />
            Unclaimed
          </Chip>
        ),
    },
    {
      id: "action",
      header: "Action",
      align: "center",
      cell: (winner) => (
        <>
          <Button
            disabled={winner.isReceived || claimPending}
            onClick={() => onClaim(winner.id)}
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
          {!winner.isReceived && <WinnerReasonAction winnerId={winner.id} mode="redraw" />}
        </>
      ),
    },
  ];
}

function getWinnerStats({
  total,
  receivedCount,
  pendingCount,
}: {
  total: number;
  receivedCount: number;
  pendingCount: number;
}) {
  return {
    receivedCount,
    pendingCount,
    receivedPercent: total > 0 ? Math.round((receivedCount / total) * 100) : 0,
  };
}

export function Winners() {
  const table = useTableState({ pageSize: 10 });

  const { data: winners, isLoading: isWinnerLoading } = useWinners({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
  });

  const claimConfirmation = useConfirmationModal();
  const claimWinner = useClaimWinnerMutation();

  const total: number = winners?.meta.pagination.total ?? 0;
  const receivedCount = winners?.meta?.stats?.receivedCount ?? 0;
  const pendingCount = winners?.meta?.stats?.pendingCount ?? 0;
  const { receivedPercent } = getWinnerStats({ total, receivedCount, pendingCount });

  const handleClaimPrize = (id: string) => {
    claimConfirmation.openConfirmModal({
      title: "Claim Prize?",
      description: "Are you sure you want to process this prize claim?",
      confirmText: "Confirm Claim",
      variant: "warning",
      onConfirm: async () => {
        await claimWinner.mutateAsync({ winnerId: id });
        toast.success("Claimed successfully!");
      },
    });
  };

  const columns = createWinnerColumns({
    onClaim: handleClaimPrize,
    claimPending: claimWinner.isPending,
  });

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
    </Layout>
  );
}
