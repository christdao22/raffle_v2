import type { Prize } from "@raffle_v2/shared";
import { Card } from "@raffle_v2/ui";
import { Dice4, Minus, Plus, Radio, RotateCcw, Ticket, Timer, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useConfirmationModal } from "../../hooks/use-confirmation-modal";
import { useLiveStatus, useSetWinnerCount } from "../../hooks/use-live";
import ConfirmationModal from "./ConfirmationModal";
import DrawResultModal from "./DrawResultModal";

interface RaffleConfigCardProps {
  onTriggerDraw?: (config: { winnerCount: number; duration: number }) => void;
  onReset?: () => void;
  prize?: Prize;
  regionId?: string[];
  totalEligibleCount?: number;
}

export default function RaffleConfigCard({
  onTriggerDraw,
  onReset,
  prize,
  regionId,
  totalEligibleCount = 0,
}: RaffleConfigCardProps) {
  const modal = useConfirmationModal();
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [duration, setDuration] = useState<number>(15);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState<boolean>(false);
  const { data: liveCounter } = useLiveStatus();
  const displayWinnerCount = useSetWinnerCount();

  const prizeId = prize?.id;
  const regionKey = regionId?.join(",") ?? "";

  // 1. Reset winner count to 1 whenever prize or region selection changes
  useEffect(() => {
    if (prizeId || regionKey) {
      setWinnerCount(1);
    }
  }, [prizeId, regionKey]);

  // 3. Sync winner count to the live display
  useEffect(() => {
    if (prize && regionId?.length) {
      displayWinnerCount.mutate({ count: winnerCount });
    }
  }, [winnerCount, prize, regionId, displayWinnerCount.mutate]);

  if (!prize) {
    return (
      <Card className="max-w-full lg:max-w-sm p-8 text-center border-dashed border-slate-800/80 bg-[#0c1322]">
        <p className="text-sm font-bold text-slate-300">Choose a Prize</p>
        <p className="text-xs text-slate-500 mt-1">Select a prize tier to configure the draw.</p>
      </Card>
    );
  }

  if (!regionId?.length) {
    return (
      <Card className="max-w-full lg:max-w-sm p-8 text-center border-dashed border-slate-800/80 bg-[#0c1322]">
        <p className="text-sm font-bold text-slate-300">Choose Region/s</p>
        <p className="text-xs text-slate-500 mt-1">
          Select at least one region to load participants.
        </p>
      </Card>
    );
  }

  const maxWinnersAllowed =
    totalEligibleCount > 0
      ? Math.min(prize.numberOfWinners, totalEligibleCount)
      : prize.numberOfWinners;

  const isDrawDisabled =
    prize.numberOfWinners <= 0 ||
    totalEligibleCount <= 0 ||
    winnerCount > prize.numberOfWinners ||
    winnerCount > totalEligibleCount;

  const handleTriggerDraw = () => {
    onTriggerDraw?.({ winnerCount, duration });
    setIsDrawModalOpen(true);
  };

  const handleResetConfig = () => {
    modal.openConfirmModal({
      title: "Reset Configuration?",
      description: "Are you sure you want to reset all draw parameters back to default values?",
      confirmText: "Reset All",
      variant: "danger",
      onConfirm: async () => {
        setWinnerCount(1);
        setDuration(15);
        onReset?.();
      },
    });
  };

  return (
    <>
      <Card className="max-w-full lg:max-w-sm space-y-5">
        {/* 0. REMAINING SLOTS BADGE */}
        <div className="flex items-center justify-between bg-[#131b31] border border-slate-800/80 rounded-md p-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Available Prize Slots</span>
          </div>
          <span
            className={`font-bold px-2 py-0.5 rounded-md border text-xs ${
              prize.numberOfWinners > 0
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            }`}
          >
            {prize.numberOfWinners} {prize.numberOfWinners === 1 ? "Slot" : "Slots"} Left
          </span>
        </div>

        {/* 1. WINNER COUNT SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-slate-300" />
            <h3 className="text-base font-bold text-white">Winner Count</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Set the number of winners to be drawn for the selected prize tier.
          </p>

          <div className="flex items-center justify-between bg-[#080d1a] rounded-md p-2 border border-slate-800/60">
            <button
              type="button"
              disabled={winnerCount <= 1 || prize.numberOfWinners <= 0}
              onClick={() => setWinnerCount((prev) => Math.max(1, prev - 1))}
              className="w-10 h-10 rounded-lg bg-[#182035] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#182035] disabled:hover:text-slate-300"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-white leading-none block">
                {winnerCount}
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5 block">
                Winners
              </span>
            </div>
            <button
              type="button"
              disabled={winnerCount >= maxWinnersAllowed || prize.numberOfWinners <= 0}
              onClick={() => setWinnerCount((prev) => Math.min(maxWinnersAllowed, prev + 1))}
              className="w-10 h-10 rounded-lg bg-[#182035] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#182035] disabled:hover:text-slate-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. SPIN DURATION SECTION */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Timer className="w-5 h-5 text-slate-300" />
            <h3 className="text-base font-bold text-white">Spin Duration</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Set the dramatic pause length for the live draw visual.
          </p>

          <div className="flex items-center justify-between bg-[#080d1a] rounded-md p-2 border border-slate-800/60">
            <button
              type="button"
              onClick={() => setDuration((prev) => Math.max(5, prev - 5))}
              className="w-10 h-10 rounded-lg bg-[#182035] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-white leading-none block">{duration}</span>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5 block">
                Seconds
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDuration((prev) => prev + 5)}
              className="w-10 h-10 rounded-lg bg-[#182035] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. LIVE ENVIRONMENT BADGES */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">
            Live Environment
          </span>

          <div className="flex items-center justify-between bg-[#131b31] border border-slate-800/80 rounded-md p-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-semibold">Stage Displays Connected</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {liveCounter?.connectedSockets ?? 0}
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#131b31] border border-slate-800/80 rounded-md p-3 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Ticket className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">Total Eligible Entries</span>
            </div>
            <span className="text-white font-extrabold bg-slate-800 px-2 py-0.5 rounded-md">
              {totalEligibleCount}
            </span>
          </div>
        </div>

        {/* 4. ACTIONS */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isDrawDisabled}
            onClick={handleTriggerDraw}
            className={`w-full py-4 px-4 rounded-md flex flex-col items-center justify-center gap-1 font-black transition-all ${
              isDrawDisabled
                ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 shadow-none"
                : "bg-[#10b981] hover:bg-[#059669] text-[#062419] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <div className="flex items-center gap-2 text-sm tracking-wider uppercase">
              <Dice4 className={`w-5 h-5 ${!isDrawDisabled ? "animate-spin" : ""}`} />
              {prize.numberOfWinners <= 0 ? "No Available Slots" : "Trigger Live Draw"}
            </div>
            <span className="text-[9px] tracking-widest font-extrabold opacity-80 uppercase">
              {prize.numberOfWinners <= 0 ? "Select another prize" : "Stage Ready"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleResetConfig}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-red-400 hover:text-white transition-colors py-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET CONFIGURATION
          </button>
        </div>

        <ConfirmationModal {...modal.modalProps} />
      </Card>

      {/* 5. DRAW RESULT MODAL */}
      <DrawResultModal
        isOpen={isDrawModalOpen}
        onClose={() => setIsDrawModalOpen(false)}
        prize={prize}
        regionId={regionId}
        winnerCount={winnerCount}
        drawDuration={duration}
      />
    </>
  );
}
