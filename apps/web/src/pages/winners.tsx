import type { Winner } from "@raffle_v2/shared";
import { Button, cn, DataTable, type DataTableColumn } from "@raffle_v2/ui";
import { Check, CheckCircle2, Clock, TrendingUp, Trophy } from "lucide-react";
import ConfirmationModal from "../components/Custom/ConfirmationModal";
import { StatCard } from "../components/Custom/StatCard";
import Layout from "../components/layout";
import { useTableState } from "../hooks/datatable/use-table-state";
import { useConfirmationModal } from "../hooks/use-modal";
import { useClaimWinnerMutation, useWinners } from "../hooks/use-winners";

export function Winners() {
  const table = useTableState({ pageSize: 2 });

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
  const receivedPercent = total > 0 ? Math.round((receivedCount / total) * 100) : 0;

  const handleClaimPrize = (id: string) => {
    claimConfirmation.openConfirmModal({
      title: "Claim Prize?",
      description: "Are you sure you want to process this prize claim?",
      confirmText: "Confirm Claim",
      variant: "info",
      onConfirm: async () => {
        claimWinner.mutate({ winnerId: id });
      },
    });
  };

  const columns: DataTableColumn<Winner>[] = [
    {
      id: "winner",
      header: "Winner",
      cell: (winner) => (
        <div>
          <p className="font-display font-black uppercase text-tr-secondary group-hover:text-tr-primary transition-colors">
            {winner.person.fullname}
          </p>
          <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">
            ID: {winner.id}
          </p>
        </div>
      ),
    },
    {
      id: "prize",
      header: "Prize",
      cell: (winner) => (
        <div>
          <p className="font-display font-bold text-sm uppercase text-tr-primary">
            {winner.prize?.prize}
          </p>
          {winner.prize?.sponsor && (
            <p className="mt-0.5 text-[11px] text-tr-on-surface-variant">
              Sponsored by <span className="font-semibold">{winner.prize.sponsor}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      id: "division",
      header: "Division",
      cell: (winner) => (
        <span className="inline-block rounded-md bg-tr-surface-container-high px-2.5 py-1 text-xs font-semibold uppercase text-tr-on-surface">
          {winner?.person?.region?.region ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (winner) => (
        <>
          {winner.isReceived ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tr-secondary-container/20 border border-tr-secondary-container/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-tr-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              Claimed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tr-tertiary-container/15 border border-tr-tertiary-container/30 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-tr-tertiary">
              <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse" />
              Unclaimed
            </span>
          )}
        </>
      ),
    },
    {
      id: "action",
      header: "Action",
      cell: (winner) => (
        <Button
          disabled={winner.isReceived || claimWinner.isPending}
          onClick={() => handleClaimPrize(winner.id)}
          className={cn(
            "rounded-lg px-4 py-2 w-full max-w-25 text-xs font-black uppercase tracking-wider transition-all shadow-xs",
            winner.isReceived
              ? "cursor-not-allowed bg-tr-surface-container-high text-tr-on-surface-variant/60 shadow-none opacity-80"
              : "bg-tr-secondary text-tr-on-primary hover:bg-tr-secondary/90 hover:shadow-md active:scale-95",
          )}
        >
          {winner.isReceived ? "Claimed" : "Claim"}
        </Button>
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
    </Layout>
  );
}
