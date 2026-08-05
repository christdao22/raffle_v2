// label.tsx
import * as React from "react";
import { cn } from "../lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: generic primitive - callers supply htmlFor
    <label
      ref={ref}
      className={cn(
        "font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  ),
);
Label.displayName = "Label";
