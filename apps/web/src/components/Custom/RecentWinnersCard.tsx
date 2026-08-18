import type { Region } from "@raffle_v2/shared";
import { cn, timeAgo } from "@raffle_v2/ui";
import { Trophy } from "lucide-react";
import { useUnclaimedWinners } from "../../hooks/use-winners";

export interface WinnerFeedItem {
  id: string;
  name: string;
  prizeName: string;
  region: Region;
  timeAgo: string;
  avatarUrl?: string;
}

export interface RecentWinnersCardProps {
  winners?: WinnerFeedItem[];
  className?: string;
}

export function RecentWinnersCard({ className }: RecentWinnersCardProps) {
  const { data: unclaimedWinners } = useUnclaimedWinners();

  return (
    <div
      className={cn(
        "z-10 w-full rounded-md border bg-tr-surface-container-lowest p-4 shadow-z1 space-y-4 font-sans text-on-surface overflow-hidden h-[80dvh]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-tr-secondary" />
          <h3 className="font-display font-bold text-headline-md text-tr-secondary tracking-wide uppercase">
            Recent Raffle Winners
          </h3>
        </div>

        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tr-primary-container opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-tr-primary-container" />
        </span>
      </div>

      {/* Marquee Window Container */}
      <div className="relative overflow-hidden">
        {/* Top & Bottom Fade Overlay Masks */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-linear-to-b from-tr-surface-container-lowest to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-tr-surface-container-lowest to-transparent z-10 pointer-events-none" />

        {/* Continuous Scrolling Track using class defined in index.css */}
        <div className="flex flex-col space-y-2.5 animate-marquee-up  overflow-hidden">
          {unclaimedWinners ? (
            unclaimedWinners.data.map((winner) => {
              const initial = winner.person.fullname.charAt(0);

              return (
                <div
                  key={`${winner.id}`}
                  className="relative flex items-center justify-between p-3 rounded-md border-l-3 border-amber-300 bg-tr-surface-container-low hover:bg-tr-surface-container transition-all shadow-sm shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-tr-secondary text-tr-on-primary font-display font-bold text-sm flex items-center justify-center shadow-sm">
                        {initial}
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-sans font-bold text-body-md text-tr-secondary truncate">
                          {winner.person.fullname}
                        </span>
                        <span
                          className={
                            "inline-flex items-center px-1.5 py-0.5  text-[10px] text-tr-secondary font-semibold "
                          }
                        >
                          ({winner.person.region.region})
                        </span>
                      </div>

                      <span className="font-display font-semibold text-xs text-tr-primary-container truncate mt-0.5 tracking-wide">
                        {winner.prize.prize}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right pt-0.5">
                    <span className="font-sans text-[10px] font-semibold text-tr-secondary tracking-wider">
                      {timeAgo(winner.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-tr-secondary text-center pt-10">
              <p>No Winners Yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
