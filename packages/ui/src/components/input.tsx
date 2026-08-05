// input.tsx
import * as React from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-md border border-outline-variant/20 bg-surface-container-lowest px-3.5 py-2.5 text-sm font-sans text-on-surface",
          "placeholder:text-on-surface-variant/40",
          "focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-1 focus-visible:ring-secondary",
          "disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
