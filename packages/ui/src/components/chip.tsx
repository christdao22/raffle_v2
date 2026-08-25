import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/utils";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border-outline-variant/30 bg-surface-container-high text-on-surface",
        primary: "border-primary bg-primary-container text-tr-on-surface",
        secondary: "border-tr-secondary/30 bg-tr-secondary-container/20 text-tr-secondary",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        error: "border-error/30 bg-error-container/20 text-error",
        outline: "border-tr-outline-variant/40 bg-tr-transparent text-tr-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

export function Chip({ className, variant, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ variant }), className)} {...props} />;
}
