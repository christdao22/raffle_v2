import { cn } from "@raffle_v2/ui";

export interface StandByProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function StandBy({
  className,
  title = "STAND BY",
  subtitle = "Preparing for the next prize draw...",
}: StandByProps) {
  return (
    <div
      className={cn("prize-rotating-border w-full h-full min-h-[75vh] flex flex-col", className)}
    >
      <div className="relative overflow-hidden rounded-[calc(1rem-3px)] bg-tr-surface-container-lowest flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[30rem] w-[30rem] rounded-full bg-tr-primary-container/15 blur-3xl animate-pulse" />
        </div>

        {/* Live Status Badge */}
        <div className="relative z-10 mb-8 inline-flex items-center gap-3 rounded-full border border-tr-primary-container/50 bg-tr-surface px-6 py-2.5 shadow-lg">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          <span className="font-display text-sm sm:text-base font-bold uppercase tracking-widest text-tr-secondary">
            Live Raffle
          </span>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-6 max-w-7xl">
          <h1 className="font-display text-8xl sm:text-9xl md:text-[11rem] lg:text-[14rem] font-black uppercase leading-none tracking-tighter text-tr-secondary select-none">
            {title}
          </h1>

          <p className="font-display text-xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-[0.2em] text-tr-primary">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
