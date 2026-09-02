// button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans text-sm font-bold uppercase tracking-wider " +
    "transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary " +
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99]",
  {
    variants: {
      variant: {
        default:
          "bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:brightness-110",
        outline: "border border-secondary/50 bg-transparent text-secondary hover:bg-secondary/10",
        ghost:
          "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
        destructive: "bg-error-container text-on-error-container hover:brightness-110",
        link: "text-secondary underline-offset-4 hover:underline lowercase font-normal tracking-normal",
      },
      size: {
        default: "h-11 px-5 py-3 text-xs",
        sm: "h-9 rounded-md px-3 text-[11px]",
        lg: "h-14 rounded-md px-6 text-base shadow-[0_0_25px_rgba(255,215,0,0.3)]",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
