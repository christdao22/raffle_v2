import type { Winner } from "@raffle_v2/shared";
import { Button, cn } from "@raffle_v2/ui";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Search,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmationModal from "../components/Custom/ConfirmationModal";
import { StatCard } from "../components/Custom/StatCard";
import Layout from "../components/layout";
import { TableSkeleton } from "../components/Skeleton/TableSkeleton";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useModal } from "../hooks/use-modal";
import { useClaimWinnerMutation, useWinners } from "../hooks/use-winners";

function EmptyWinner({ hasSearch }: { hasSearch: boolean }) {
  return (
    <tr>
      <td colSpan={5} className="px-5 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tr-surface-container-high/50">
          <Trophy className="h-7 w-7 text-tr-on-surface-variant/60" />
        </div>
        <p className="mt-4 font-display font-bold text-base text-tr-on-surface">No winners found</p>
        <p className="mt-1 text-xs text-tr-on-surface-variant">
          {hasSearch
            ? "No results match your search parameters. Try a different query."
            : "There are currently no winner records to display."}
        </p>
      </td>
    </tr>
  );
}

function WinnerRow({
  winner,
  onClaim,
  isPending,
}: {
  winner: Winner;
  onClaim: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <tr className="group border-b border-tr-outline-variant/10 transition-colors hover:bg-tr-surface-container-low/60">
      {/* Winner Column */}
      <td className="px-5 py-4">
        <div>
          <p className="font-display font-black uppercase text-tr-secondary group-hover:text-tr-primary transition-colors">
            {winner.person.fullname}
          </p>
          <p className="mt-0.5 text-[11px] font-mono text-tr-on-surface-variant/80">
            ID: {winner.id}
          </p>
        </div>
      </td>

      {/* Prize Column */}
      <td className="px-5 py-4">
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
      </td>

      {/* Division Column */}
      <td className="px-5 py-4">
        <span className="inline-block rounded-md bg-tr-surface-container-high px-2.5 py-1 text-xs font-semibold uppercase text-tr-on-surface">
          {winner?.person?.region?.region ?? "—"}
        </span>
      </td>

      {/* Status Column */}
      <td className="px-5 py-4 text-center">
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
      </td>

      {/* Action Column */}
      <td className="px-5 py-4 text-right">
        <Button
          disabled={winner.isReceived || isPending}
          onClick={() => onClaim(winner.id)}
          className={cn(
            "rounded-lg px-4 py-2 w-full max-w-[100px] text-xs font-black uppercase tracking-wider transition-all shadow-xs",
            winner.isReceived
              ? "cursor-not-allowed bg-tr-surface-container-high text-tr-on-surface-variant/60 shadow-none opacity-80"
              : "bg-tr-secondary text-tr-on-primary hover:bg-tr-secondary/90 hover:shadow-md active:scale-95",
          )}
        >
          {winner.isReceived ? "Claimed" : "Claim"}
        </Button>
      </td>
    </tr>
  );
}

export function Winners() {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 5,
  });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setPagination((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, []);

  const { data: winners, isLoading: isWinnerLoading } = useWinners({
    ...pagination,
    search,
  });

  const claimConfirmation = useModal();
  const claimWinner = useClaimWinnerMutation();

  const totalPages = winners?.meta.pagination.totalPages ?? 1;
  const currentPage = winners?.meta.pagination.page ?? pagination.page;
  const total = winners?.meta.pagination.total ?? 0;
  const receivedCount = winners?.meta?.stats?.receivedCount ?? 0;
  const pendingCount = winners?.meta?.stats?.pendingCount ?? 0;
  const receivedPercent = total > 0 ? Math.round((receivedCount / total) * 100) : 0;

  const handleClaimPrize = (id: string) => {
    claimConfirmation.openModal({
      title: "Claim Prize?",
      description: "Are you sure you want to process this prize claim?",
      confirmText: "Confirm Claim",
      variant: "info",
      onConfirm: async () => {
        claimWinner.mutate({ winnerId: id });
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, totalPages)),
    }));
  };

  return (
    <Layout pageTitle="Raffle Winners">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="Total Winners"
          value={receivedPercent}
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
      <div className="w-full p-4 rounded-2xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest shadow-sm font-sans overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col gap-4 border-b border-tr-outline-variant/20 p-5 sm:flex-row sm:items-center sm:justify-between bg-tr-surface-container-lowest">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-tr-tertiary-container/20 p-2.5 text-tr-tertiary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-black uppercase tracking-tight text-tr-secondary">
                Winner Claims
              </h2>
              <p className="mt-0.5 text-xs text-tr-on-surface-variant">
                Search and process raffle prize distribution records.
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tr-on-surface-variant/70" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search winner or prize..."
              className="h-10 w-full rounded-xl border border-tr-outline-variant/40 bg-tr-surface-container-low pl-10 pr-4 text-sm font-medium outline-none transition-all text-tr-on-surface placeholder:text-tr-on-surface-variant/50 focus:border-tr-primary focus:ring-2 focus:ring-tr-primary/10"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-tr-outline-variant/20 bg-tr-surface-container-low/50">
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-tr-on-surface-variant">
                  Winner
                </th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-tr-on-surface-variant">
                  Prize
                </th>
                <th className="px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.15em] text-tr-on-surface-variant">
                  Division
                </th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.15em] text-tr-on-surface-variant">
                  Status
                </th>
                <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-[0.15em] text-tr-on-surface-variant">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-tr-outline-variant/10">
              {isWinnerLoading ? (
                <TableSkeleton rows={pagination.pageSize} />
              ) : winners && winners.data.length > 0 ? (
                winners.data.map((winner) => (
                  <WinnerRow
                    key={winner.id}
                    winner={winner}
                    onClaim={handleClaimPrize}
                    isPending={claimWinner.isPending}
                  />
                ))
              ) : (
                <EmptyWinner hasSearch={Boolean(searchInput)} />
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="flex flex-col gap-3 border-t border-tr-outline-variant/20 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-tr-surface-container-low/30">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-tr-on-surface-variant">
              Page <strong className="text-tr-on-surface">{currentPage}</strong> of{" "}
              <strong className="text-tr-on-surface">{totalPages}</strong> ·{" "}
              <strong className="text-tr-on-surface">{total}</strong> total winners
            </span>
            <span className="h-1 w-1 rounded-full bg-tr-outline-variant/50 hidden sm:inline-block" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-tr-primary">
              {winners?.data.filter((w) => w.isReceived).length ?? 0} claimed on this page
            </span>
          </div>

          {/* Pagination Navigation */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isWinnerLoading}
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
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isWinnerLoading}
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

        {/* Modal Hook Confirmation */}
        <ConfirmationModal {...claimConfirmation.modalProps} />
      </div>
    </Layout>
  );
}
