import type { Prize } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";

export interface PrizeCardProps {
  currentPrize?: Prize;
  className?: string;
}

export function PrizeCard({ currentPrize, className }: PrizeCardProps) {
  return (
    <div className={cn("prize-rotating-border h-full ", className)}>
      <div className="relative overflow-hidden rounded-[calc(1rem-3px)] bg-tr-surface-container-lowest h-full flex justify-between">
        {/* Badge */}
        <div className="absolute top-5 left-5 z-20">
          <div className="inline-flex items-center rounded-full border border-tr-primary-container bg-tr-surface px-4 py-1.5 shadow-sm">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-tr-secondary">
              {currentPrize?.prize}
            </span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1fr_1.15fr] w-full items-center gap-6 p-8 pt-18">
          {/* Prize details */}
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="font-display text-2xl font-extrabold uppercase tracking-[0.18em] text-tr-primary">
                {currentPrize?.prize}
              </p>

              <h2 className="font-display text-8xl font-black uppercase leading-[0.95] tracking-tighter text-tr-secondary">
                {currentPrize?.prize}
              </h2>
            </div>

            <div className="h-1 w-28 rounded-full bg-tr-primary-container" />

            {/* Sponsor */}
            <div className="pt-3">
              <p className="font-sans text-sm font-bold uppercase tracking-[0.16em] text-tr-primary">
                Sponsored by
              </p>

              <p className="font-display text-2xl font-black text-tr-secondary">
                {currentPrize?.sponsor}
              </p>
            </div>
          </div>

          {/* Product showcase */}
          <div className="relative flex min-h-70 items-center justify-center">
            {/* Glow */}
            <div className="absolute h-56 w-56 rounded-full bg-primary-container/20 blur-3xl" />

            {/* Pedestal */}
            <div className="absolute bottom-8 h-20 w-[80%] rounded-[50%] bg-tr-surface-container shadow-inner" />

            <img
              src={currentPrize?.imageUrl ?? ""}
              alt={currentPrize?.prize}
              className=" relative z-10 max-h-80 max-w-full object-contain drop-shadow-2xl prize-float transition-transform duration-300 hover:scale-105 "
            />
          </div>
        </div>
      </div>
    </div>
  );
}
