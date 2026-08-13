import type { Prize } from "@raffle_v2/shared";
import { Dice5, RefreshCw, Save, Trash2, Trophy, User, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useSetCloseModal,
  useSetDisplayCountdown,
  useSetDisplayWinners,
} from "../../hooks/use-live";
import { useDrawCandidates, useSaveWinnersMutation } from "../../hooks/use-winners";

export interface Region {
  id: string;
  region: string;
  regionName: string;
}

export interface Person {
  id: string;
  fullname: string;
  employeeId: string;
  image: string;
  region: Region;
  isEligible: boolean;
}

interface DrawResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  prize: Prize;
  regionId: string[];
  winnerCount: number;
  drawDuration: number;
}

export default function DrawResultModal({
  isOpen,
  onClose,
  prize,
  regionId,
  winnerCount,
  drawDuration,
}: DrawResultModalProps) {
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [prevKey, setPrevKey] = useState<string>("");
  const [revealed, setRevealed] = useState(false);
  const [countdown, setCountdown] = useState<number>(drawDuration);

  const countdownSentRef = useRef(false);

  // Reset everything whenever the draw params or open state change.
  const currentKey = `${prize.id}-${winnerCount}-${isOpen}`;
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setExcludedIds([]);
    setRevealed(false);
    setCountdown(drawDuration);
    countdownSentRef.current = false;
  }

  const { data, refetch, isFetching, isError, error } = useDrawCandidates({
    prizeId: prize.id,
    numberOfWinners: winnerCount,
    regionId,
    enabled: isOpen,
  });

  const saveWinnersMutation = useSaveWinnersMutation();
  const displayWinners = useSetDisplayWinners();
  const displayCountdown = useSetDisplayCountdown();
  const closeLiveWinner = useSetCloseModal();

  const candidates = useMemo(() => {
    const rawCandidates = data ?? [];
    return rawCandidates.filter((person) => !excludedIds.includes(person.id));
  }, [data, excludedIds]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (!isOpen || isFetching || candidates.length === 0 || revealed) return;
    if (countdownSentRef.current) return;

    countdownSentRef.current = true;
    displayCountdown.mutate({ duration: drawDuration, startedAt: Date.now() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isFetching, candidates.length, revealed, drawDuration]);

  // Local admin-side countdown, ticking once per second.
  const tickRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (!isOpen || isFetching || candidates.length === 0 || revealed) return;

    if (countdown <= 0) {
      setRevealed(true);
      return;
    }

    tickRef.current = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(tickRef.current);
  }, [isOpen, isFetching, candidates.length, revealed, countdown]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignore
  useEffect(() => {
    if (isOpen && revealed) {
      displayWinners.mutate({ persons: candidates, drawDuration });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, revealed, candidates, drawDuration]);

  const handleRemoveCandidate = (personId: string) => {
    setExcludedIds((prev) => [...prev, personId]);
  };

  const handleRedraw = async () => {
    setExcludedIds([]);
    setRevealed(false);
    setCountdown(drawDuration);
    countdownSentRef.current = false; // allow a fresh countdown broadcast
    await refetch();
  };

  const handleClose = () => {
    displayWinners.mutate({ persons: [], drawDuration }); // clear live display
    closeLiveWinner.mutate();
    onClose();
  };

  const handleSaveWinners = () => {
    if (candidates.length === 0) return;

    saveWinnersMutation.mutate(
      {
        prizeId: prize.id,
        personIds: candidates.map((c) => c.id),
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl bg-[#0c1322] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#131b31]">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">Draw Results</h2>
              <p className="text-xs text-slate-400">{prize.prize}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: fetching -> counting down -> revealed list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 min-h-[180px]">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs font-semibold">Drawing candidates...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8 text-red-400 text-xs">
              {error instanceof Error ? error.message : "Failed to load candidates"}
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No candidates available for this draw.
            </div>
          ) : !revealed ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-slate-300">
              <Dice5 className="w-10 h-10 text-emerald-400 animate-spin" />
              {/* <span className="text-5xl font-black text-white tabular-nums">{countdown}</span> */}
              <p className="text-xs font-semibold tracking-widest uppercase text-slate-400 animate-pulse">
                Revealing winner{candidates.length > 1 ? "s" : ""}...
              </p>
            </div>
          ) : (
            <div
              className={
                candidates.length === 1
                  ? "flex justify-center"
                  : "grid grid-cols-1 sm:grid-cols-2 gap-3"
              }
            >
              {candidates.map((person) => (
                <div
                  key={person.id}
                  className="relative flex items-center justify-between p-3.5 bg-[#131b31] border border-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{person.fullname}</h4>
                      {person.region && (
                        <>
                          <p className="text-[11px] text-slate-400 truncate">
                            {person.region.regionName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {person.region.region}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {candidates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidate(person.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 transition-colors ml-2"
                      title="Remove person"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-[#080d1a] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isFetching}
              onClick={handleRedraw}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#182035] hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Re-draw
            </button>

            <button
              type="button"
              disabled={!revealed || candidates.length === 0 || saveWinnersMutation.isPending}
              onClick={handleSaveWinners}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#062419] text-xs font-black rounded-md shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {saveWinnersMutation.isPending ? "Saving..." : "Save Winners"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
