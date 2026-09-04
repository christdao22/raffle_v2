import type { Prize } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";
import { memo } from "react";

export interface PrizeCardProps {
  currentPrize?: Prize;
  className?: string;
  count?: number;
}

export const PrizeCard = memo(function PrizeCard({
  currentPrize,
  className,
  count = 1,
}: PrizeCardProps) {
  const prizeName = currentPrize?.prize ?? "Select a Prize";
  const sponsorName = currentPrize?.sponsor;
  const winnerLabel = count === 1 ? "Winner" : "Winners";

  return (
    <div className={cn("prize-rotating-border h-full w-full", className)}>
      <div className="relative flex h-full w-full overflow-hidden rounded-[calc(1rem-3px)] bg-tr-surface-container-lowest">
        <div className="relative z-10 grid h-full w-full grid-rows-[auto_minmax(20rem,1fr)_auto] px-5 py-5 sm:px-8 sm:py-7">
          <div>
            <div className="flex items-center justify-center gap-3">
              {currentPrize?.type && (
                <div className="inline-flex items-center gap-2 rounded-full border border-tr-primary-container/40 bg-tr-surface/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-tr-primary" />
                  <span className="font-display text-xs font-extrabold uppercase tracking-widest text-tr-secondary sm:text-lg">
                    {currentPrize.type}
                  </span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 rounded-full border border-tr-primary-container/40 bg-tr-surface-container/80 px-4 py-1.5 shadow-sm backdrop-blur-md">
                <span className="font-display text-lg font-black leading-none text-tr-primary sm:text-lg">
                  {count}
                </span>
                <span className="font-sans text-xs font-extrabold uppercase tracking-wider text-tr-secondary sm:text-lg">
                  {winnerLabel}
                </span>
              </div>
            </div>
            {currentPrize?.imageUrl && (
              <div className="group relative mx-auto mt-5 w-full overflow-hidden rounded-2xl border border-white/80 bg-linear-to-br from-white/80 via-white/55 to-tr-primary/15 px-5 text-center shadow-[0_18px_40px_rgba(6,38,141,0.18)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(6,38,141,0.24)] sm:px-8 sm:py-5">
                <div className="absolute -inset-x-10 bottom-0 h-1 rounded-full bg-linear-to-r from-tr-primary via-tr-tertiary to-tr-secondary opacity-90" />
                <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-tr-tertiary/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
                <h2 className="relative font-display wrap-break-word mx-auto max-w-full text-3xl font-black uppercase leading-[1.05] tracking-tight text-tr-secondary drop-shadow-[0_3px_10px_rgba(6,38,141,0.22)] sm:text-4xl lg:text-5xl xl:text-8xl">
                  {prizeName}
                </h2>
              </div>
            )}
          </div>

          <div className="grid min-h-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
            {sponsorName && (
              <div className="order-2 flex flex-col items-center justify-center text-center lg:order-1">
                <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-tr-primary/90 sm:text-sm lg:text-2xl">
                  Sponsored By
                </span>
                {currentPrize.sponsorImage && (
                  <div className="flex h-24 w-48 items-center justify-center overflow-hidden rounded-xl bg-white p-3 sm:h-28 sm:w-56 lg:h-32 lg:w-64 xl:h-100 xl:w-150">
                    <img
                      src={currentPrize.sponsorImage}
                      alt={`${sponsorName} logo`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <span
                  className={cn(
                    "pt-6 font-display wrap-break-word max-w-full text-2xl font-black text-tr-secondary sm:text-3xl lg:text-5xl",
                    currentPrize.sponsorImage !== "" ? "lg:text-7xl" : "",
                  )}
                >
                  {sponsorName}
                </span>
              </div>
            )}

            <div className="order-1 relative flex w-full items-center justify-center lg:order-2">
              <div className="absolute bottom-25 h-12 w-[60%] rounded-[50%] border border-white/10 bg-linear-to-t from-tr-surface-container-high to-tr-surface-container/20 shadow-xl backdrop-blur-md sm:h-14 lg:w-[50%]" />

              {currentPrize?.imageUrl ? (
                <>
                  <div className="absolute h-52 w-52 rounded-full bg-tr-secondary/25 blur-3xl sm:h-64 sm:w-64 lg:h-40 lg:w-40 xl:h-80 xl:w-80" />
                  <div className="absolute h-36 w-36 rounded-full bg-tr-secondary-container/30 blur-2xl sm:h-48 sm:w-48 lg:h-40 lg:w-6 xl:h-40 xl:w-60" />
                  <img
                    src={currentPrize.imageUrl}
                    alt={prizeName}
                    decoding="async"
                    className="prize-float relative z-10 max-h-56 max-w-full object-contain px-3 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:scale-105 sm:max-h-90 xl:max-h-160"
                  />
                </>
              ) : (
                <div className="relative z-10 flex min-h-60 w-full max-w-4xl items-center justify-center rounded-2xl border border-tr-primary-container/40 bg-linear-to-br from-tr-surface/80 to-tr-secondary-container/15 px-6 py-8 text-center shadow-[0_16px_35px_rgba(6,38,141,0.16)] backdrop-blur-xl">
                  <span className="font-display wrap-break-word text-3xl font-black uppercase leading-tight tracking-tight text-tr-secondary drop-shadow-[0_3px_10px_rgba(6,38,141,0.2)] sm:text-4xl lg:text-7xl">
                    {prizeName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
