import type { Region } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";
import { Trophy } from "lucide-react";

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

const DEFAULT_WINNERS: WinnerFeedItem[] = [
  {
    id: "w-1",
    name: "Michael C.",
    prizeName: "GIFT CARD - $50",
    region: "Region X",
    timeAgo: "JUST NOW",
  },
  {
    id: "w-2",
    name: "Emily R.",
    prizeName: "100 BONUS XP",
    region: "Region XI",
    timeAgo: "2M AGO",
  },
  {
    id: "w-3",
    name: "Sarah J. Christian Daohog",
    prizeName: "MYSTERY BOX",
    region: "Region XII",
    timeAgo: "5M AGO",
  },
  {
    id: "w-4",
    name: "Maria S.",
    prizeName: 'MACBOOK PRO 16"',
    region: "BARMM",
    timeAgo: "12M AGO",
  },
  { id: "w-5", name: "Juan P.", prizeName: "IPAD AIR", region: "Region IX", timeAgo: "15M AGO" },
];

export function RecentWinnersCard({
  winners = DEFAULT_WINNERS,
  className,
}: RecentWinnersCardProps) {
  // Duplicate list to create a seamless infinite loop
  const duplicatedWinners = [...winners, ...winners];

  return (
    <div
      className={cn(
        "w-full max-w-sm rounded-md border bg-tr-surface-container-lowest p-4 shadow-z1 space-y-4 font-sans text-on-surface overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-tr-secondary" />
          <h3 className="font-display font-bold text-headline-md text-tr-secondary tracking-wide uppercase">
            WINNERS
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
          {duplicatedWinners.map((winner) => {
            const initial = winner.name.charAt(0);

            return (
              <div
                key={`${winner.id}`}
                className="relative flex items-center justify-between p-3 rounded-md border-l-3 border-amber-300 bg-tr-surface-container-low hover:bg-tr-surface-container transition-all shadow-sm shrink-0"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-tr-secondary text-tr-on-primary font-display font-bold text-sm flex items-center justify-center shadow-sm">
                      {winner.avatarUrl ? (
                        <img
                          src={winner.avatarUrl}
                          alt={winner.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-sans font-bold text-body-md text-tr-secondary truncate">
                        {winner.name}
                      </span>
                      <span
                        className={
                          "inline-flex items-center px-1.5 py-0.5  text-[10px] text-tr-secondary font-semibold "
                        }
                      >
                        ({winner.region})
                      </span>
                      {/* <span className="text-xs text-on-surface-variant font-normal">claimed</span> */}
                    </div>

                    <span className="font-display font-semibold text-xs text-tr-primary-container truncate mt-0.5 tracking-wide">
                      {winner.prizeName}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right pt-0.5">
                  <span className="font-sans text-[10px] font-semibold text-tr-secondary tracking-wider">
                    {winner.timeAgo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
