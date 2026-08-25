import { cn } from "@raffle_v2/ui";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SubmitButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  variant?: SubmitButtonVariant;
  children?: ReactNode;
}

const variantStyles: Record<SubmitButtonVariant, { btnBg: string }> = {
  danger: {
    btnBg: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
  },
  primary: {
    btnBg: "bg-[#FFD000] hover:bg-yellow-400 text-[#0d1326] shadow-yellow-500/10",
  },
  secondary: {
    btnBg: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20",
  },
  ghost: {
    btnBg:
      "px-4 py-2.5 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 disabled:opacity-50 transition-colors",
  },
};

export function SubmitButton({
  isLoading = false,
  loadingText = "Processing...",
  variant = "secondary",
  type = "submit",
  onClick,
  disabled,
  className,
  children = "Save changes",
  ...props
}: SubmitButtonProps) {
  const currentVariant = variantStyles[variant] || variantStyles.secondary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "px-5 py-2.5 rounded-md text-xs font-extrabold tracking-wider uppercase shadow-md flex items-center gap-2 disabled:opacity-50 transition-all",
        currentVariant.btnBg,
        className,
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
}
