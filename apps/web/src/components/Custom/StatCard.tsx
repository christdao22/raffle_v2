import { cn } from "@raffle_v2/ui";
import { TrendingUp, type LucideIcon } from "lucide-react";

export type StatCardVariant = "primary" | "secondary" | "tertiary" | "success" | "error";

export interface StatCardProps {
  title?: string;
  value?: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  isLoading?: boolean;
  className?: string;
}

const variantStyles: Record<
  StatCardVariant,
  {
    iconBg: string;
    iconText: string;
    iconBorder: string;
    valueText: string;
  }
> = {
  primary: {
    iconBg: "bg-tr-primary-container/20",
    iconText: "text-tr-primary",
    iconBorder: "border-tr-primary-container/30",
    valueText: "text-tr-primary",
  },
  secondary: {
    iconBg: "bg-tr-secondary-container/20",
    iconText: "text-tr-secondary",
    iconBorder: "border-tr-secondary-container/30",
    valueText: "text-tr-secondary",
  },
  tertiary: {
    iconBg: "bg-tr-tertiary-container/20",
    iconText: "text-tr-tertiary",
    iconBorder: "border-tr-tertiary-container/30",
    valueText: "text-tr-tertiary",
  },
  success: {
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-600",
    iconBorder: "border-emerald-500/20",
    valueText: "text-emerald-600",
  },
  error: {
    iconBg: "bg-tr-error-container/20",
    iconText: "text-tr-error",
    iconBorder: "border-tr-error-container/30",
    valueText: "text-tr-error",
  },
};

export function StatCard({
  title = "",
  value = "",
  subtext,
  icon: Icon = TrendingUp,
  variant = "secondary",
  isLoading = false,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant] || variantStyles.secondary;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest p-5 shadow-xs transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Icon & Label Container */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
              styles.iconBg,
              styles.iconText,
              styles.iconBorder
            )}
          >
            <Icon className="h-5.5 w-5.5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-tr-on-surface-variant/80 truncate">
              {title}
            </p>

            {isLoading ? (
              <div className="mt-1.5 h-7 w-20 animate-pulse rounded-md bg-tr-surface-container-high" />
            ) : (
              <p
                className={cn(
                  "font-display text-2xl font-black tracking-tight transition-colors",
                  styles.valueText
                )}
              >
                {value}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subtext Footer */}
      {subtext && !isLoading && (
        <p className="mt-3 border-t border-tr-outline-variant/10 pt-2.5 text-[11px] font-medium text-tr-on-surface-variant">
          {subtext}
        </p>
      )}
    </div>
  );
}