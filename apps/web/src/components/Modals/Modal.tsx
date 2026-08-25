import { Button, cn } from "@raffle_v2/ui";
import { X } from "lucide-react";
import { type ReactNode, useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  closeOnOverlayClick?: boolean;
  className?: string;
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
  closeOnOverlayClick = true,
  className,
}: ModalProps) {
  // ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200  transition-opacity">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-2xl font-sans text-on-surface animate-in zoom-in-95 slide-in-from-bottom-2 duration-200",
          maxWidthMap[maxWidth],
          className,
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full p-0 bg-surface-container-high/60 text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-colors flex items-center justify-center border-0 shadow-none"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        {(title || description) && (
          <div className="mb-6 pr-8 space-y-1">
            {title && (
              <h3 className="font-display text-md font-black tracking-tight text-white">{title}</h3>
            )}
            {description && (
              <p className="text-xs font-medium text-on-surface-variant">{description}</p>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="relative text-sm">{children}</div>

        {/* Footer Actions */}
        {footer && (
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-outline-variant/20 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
