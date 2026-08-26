import type { Prize } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";

export interface PrizeCardProps {
  currentPrize?: Prize;
  className?: string;
  count?: number;
}

export function PrizeCard({ currentPrize, className, count = 1 }: PrizeCardProps) {
  return (
    <div className={cn("prize-rotating-border h-full w-full", className)}>
      <div className="relative flex h-full w-full justify-between overflow-hidden rounded-[calc(1rem-3px)] bg-tr-surface-container-lowest">
        {/* Top Floating Stage Badges */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between gap-4">
          {/* Prize Type */}
          {currentPrize?.type ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-tr-primary-container/40 bg-tr-surface/80 px-4 py-1.5 backdrop-blur-md shadow-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-tr-primary animate-pulse" />
              <span className="font-display text-xs font-extrabold uppercase tracking-widest text-tr-secondary sm:text-sm">
                {currentPrize.type}
              </span>
            </div>
          ) : (
            <div />
          )}
        </div>

        {/* Main Stage Grid */}
        <div className="relative z-10 grid w-full grid-cols-1 items-center gap-8 p-6 pt-20 lg:grid-cols-[1.15fr_1fr] lg:p-8 lg:pt-24">
          {/* Left Column: Stage Text */}
          <div className="flex flex-col justify-center space-y-5">
            <div className="space-y-2">
              {/* Winner Count Callout */}
              <div className="inline-flex items-center gap-2 rounded-full border border-tr-primary-container/40 bg-tr-surface-container/80 px-5 py-1.5 backdrop-blur-md shadow-sm">
                <span className="font-display text-xl font-black text-tr-primary leading-none sm:text-2xl">
                  {count}
                </span>
                <span className="font-sans text-xs font-extrabold uppercase tracking-wider text-tr-secondary">
                  {count === 1 ? "Winner" : "Winners"}
                </span>
              </div>
              {/* Balanced Title Scale */}
              <h2 className="font-display text-3xl lg:text-4xl xl:text-8xl font-black uppercase leading-[0.92] tracking-tight text-tr-secondary wrap-break-word">
                {currentPrize?.prize ?? "Select a Prize"}
              </h2>
            </div>

            <div className="h-1.5 w-28 rounded-full bg-linear-to-r from-tr-primary via-tr-primary-container to-transparent" />

            {/* Sponsor Callout */}
            {currentPrize?.sponsor && (
              <div className="inline-flex max-w-max flex-col rounded-xl border border-tr-primary-container/30 bg-tr-surface-container/50 p-4 backdrop-blur-md">
                <span className="font-sans font-bold uppercase tracking-[0.2em] text-tr-primary/90 text-xs xl:text-xl">
                  Sponsored By
                </span>
                <span className="font-display font-black text-tr-secondary mt-0.5 text-md xl:text-3xl">
                  {currentPrize.sponsor}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Display Stage Showcase */}
          <div className="relative flex min-h-65 items-center justify-center lg:min-h-[360px]">
            {/* Stage Ambient Glow */}
            <div className="absolute h-56 w-56 rounded-full bg-tr-primary/25 blur-3xl lg:h-72 lg:w-72" />
            <div className="absolute h-40 w-40 rounded-full bg-tr-primary-container/30 blur-2xl lg:h-52 lg:w-52" />

            {/* Pedestal Platform */}
            <div className="absolute bottom-2 h-14 w-[80%] rounded-[50%] bg-gradient-to-t from-tr-surface-container-high to-tr-surface-container/20 shadow-xl backdrop-blur-md border border-white/10" />

            {/* Stage Product Image */}
            {currentPrize?.imageUrl ? (
              <img
                src={currentPrize.imageUrl}
                alt={currentPrize.prize}
                className="prize-float relative z-10 max-h-56 max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105 sm:max-h-72 lg:max-h-100"
              />
            ) : (
              <div className="relative z-10 flex h-48 w-48 items-center justify-center rounded-2xl border border-dashed border-tr-primary-container/40 bg-tr-surface/30">
                <span className="font-sans text-xs font-bold uppercase tracking-wider text-tr-secondary/50">
                  No Image Available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
