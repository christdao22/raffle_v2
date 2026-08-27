import { cn } from "@raffle_v2/ui";
import { Award, Check } from "lucide-react";
import * as React from "react";

export interface PrizeTier {
  id: string;
  prize: string;
  image_url?: string;
  icon?: React.ReactNode;
}

export interface PrizeTierCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tier: PrizeTier;
  isSelected?: boolean;
}

export const PrizeTierCard = React.forwardRef<HTMLButtonElement, PrizeTierCardProps>(
  ({ tier, isSelected = false, className, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          "relative flex items-center gap-3 w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer select-none",
          "bg-surface-container-low/80 hover:bg-surface-container-high/60",
          isSelected
            ? "border-primary-container ring-1 ring-primary-container bg-surface-container-high shadow-[0_0_15px_rgba(255,215,0,0.15)]"
            : "border-outline-variant/20 hover:border-outline-variant/50",
          className,
        )}
        {...props}
      >
        {/* Selection Checkmark Badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shadow-sm z-10">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}

        {/* Thumbnail / Icon Display */}
        <div className="relative shrink-0 w-11 h-11 rounded-md bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center text-on-surface-variant">
          {tier.image_url ? (
            <img
              src={tier.image_url}
              alt={tier.prize}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : tier.icon ? (
            tier.icon
          ) : (
            <Award className="w-5 h-5 text-on-surface-variant/60" />
          )}
        </div>

        {/* Tier Details */}
        <div className="flex flex-col min-w-0 pr-4">
          <span className="font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider leading-tight">
            TIER {tier.id}
          </span>
          <span className="font-sans font-bold text-xs text-on-surface truncate leading-snug">
            {tier.prize}
          </span>
        </div>
      </button>
    );
  },
);

PrizeTierCard.displayName = "PrizeTierCard";
