import { cn } from "@raffle_v2/ui";
import { Gift, TrendingUp, Users } from "lucide-react";

export interface RaffleStatsProps {
  totalEntries?: string | number;
  yourOdds?: string;
  prizesLeft?: string;
  className?: string;
}

export function RaffleStats({
  totalEntries = "42,891",
  yourOdds = "1:450",
  prizesLeft = "03/12",
  className,
}: RaffleStatsProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans z-10", className)}>
      {/* Total Entries */}
      <div className="flex items-center justify-between p-3.5 rounded-md border border-tr-outline-variant/30 bg-tr-surface-container-lowest shadow-sm">
        <div>
          <p className="font-display font-bold text-[10px] text-tr-secondary tracking-wider uppercase">
            TOTAL ENTRIES
          </p>
          <p className="font-display font-black text-headline-md text-tr-secondary leading-tight mt-0.5">
            {totalEntries}
          </p>
        </div>
        <div className="w-10 h-10 rounded-md bg-tr-secondary-fixed flex items-center justify-center text-tr-secondary">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Prizes Left */}
      <div className="flex items-center justify-between p-3.5 rounded-md border border-tr-outline-variant/30 bg-tr-surface-container-lowest shadow-sm">
        <div>
          <p className="font-display font-bold text-[10px] text-tr-secondary tracking-wider uppercase">
            PRIZES LEFT
          </p>
          <p className="font-display font-black text-headline-md text-tr-secondary leading-tight mt-0.5">
            {prizesLeft}
          </p>
        </div>
        <div className="w-10 h-10 rounded-md bg-tr-primary-fixed flex items-center justify-center text-tr-primary">
          <Gift className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
