import { Card } from "@raffle_v2/ui";
import { Minus, Play, Plus, Radio, RotateCcw, Ticket, Timer, Users } from "lucide-react";
import { useState } from "react";
import { useModal } from "../hooks/use-modal";
import ConfirmationModal from "./confirmation-modal";

interface RaffleConfigCardProps {
  onTriggerDraw?: (config: { winnerCount: number; duration: number }) => void;
  onReset?: () => void;
}

export default function RaffleConfigCard({ onTriggerDraw, onReset }: RaffleConfigCardProps) {
  const modal = useModal();
  const [winnerCount, setWinnerCount] = useState<number>(1);
  const [duration, setDuration] = useState<number>(15);

  const handleResetConfig = () => {
    modal.openModal({
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
    <Card className="max-w-full lg:max-w-sm">
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
            onClick={() => setWinnerCount((prev) => Math.max(1, prev - 1))}
            className="w-10 h-10 rounded-lg bg-[#182035] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="text-center">
            <span className="text-2xl font-black text-white leading-none block">{winnerCount}</span>
            <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase mt-0.5 block">
              Winners
            </span>
          </div>
          <button
            type="button"
            onClick={() => setWinnerCount((prev) => prev + 1)}
            className="w-10 h-10 rounded-lg bg-[#182035] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
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

        {/* Stage Displays Status */}
        <div className="flex items-center justify-between bg-[#131b31] border border-slate-800/80 rounded-md p-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-semibold">Stage Displays Connected</span>
          </div>
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            4 Active
          </span>
        </div>

        {/* Total Entries Status */}
        <div className="flex items-center justify-between bg-[#131b31] border border-slate-800/80 rounded-md p-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Ticket className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">Total Eligible Entries</span>
          </div>
          <span className="text-white font-extrabold bg-slate-800 px-2 py-0.5 rounded-md">
            12,450
          </span>
        </div>
      </div>

      {/* 4. ACTIONS */}
      <div className="space-y-3 pt-2">
        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => onTriggerDraw?.({ winnerCount, duration })}
          className="w-full bg-[#10b981] hover:bg-[#059669] text-[#062419] font-black py-4 px-4 rounded-md flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-2 text-sm tracking-wider uppercase">
            <Play className="w-4 h-4 fill-current" />
            Trigger Live Draw
          </div>
          <span className="text-[9px] tracking-widest font-extrabold opacity-80 uppercase">
            Stage Ready
          </span>
        </button>

        {/* Reset Button */}
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
  );
}
