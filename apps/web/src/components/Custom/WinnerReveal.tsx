import { cn } from "@raffle_v2/ui";
import { Trophy } from "lucide-react";

export interface WinnerRevealProps {
  winnerName?: string;
  isRevealed?: boolean;
  className?: string;
}

export function WinnerReveal({
  winnerName = "ALEXANDER HAMILTON",
  isRevealed = false,
  className,
}: WinnerRevealProps) {
  return (
    <div className={cn("relative rounded-md text-center shadow-z1 font-sans", className)}>
      {/* Pill Badge */}
      <div className="absolute -top-4.5 left-1/2 -translate-x-1/2 z-10 inline-flex items-center border gap-1.5 px-4 py-1 rounded-full bg-tr-secondary text-tr-on-secondary shadow-sm">
        <Trophy className="w-3.5 h-3.5 text-tertiary-container" />
        <span className="font-display font-bold text-[20px] tracking-wider uppercase">
          WINNER REVEAL
        </span>
      </div>

      {/* Reveal Banner Box */}
      <div className="relative overflow-hidden mt-1 rounded-md bg-tr-secondary p-5 text-tr-on-secondary shadow-inner ">
        <div className="relative z-10 flex items-center justify-center gap-3">
          <span className="font-display font-black text-[80px] tracking-wider text-tr-on-secondary drop-shadow-md">
            {isRevealed ? (
              winnerName
            ) : (
              <span className="flex items-center justify-center gap-3">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: for dot animation
                    key={index}
                    className="animate-dot-bounce"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    •
                  </span>
                ))}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
