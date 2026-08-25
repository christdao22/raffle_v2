import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect } from "react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  data?: unknown;
}

export default function ConfirmationModal({
  isOpen,
  isLoading = false,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. Please confirm if you wish to proceed.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
}: ConfirmationModalProps) {
  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  // Variant Styling Config
  const variantStyles = {
    danger: {
      iconBg: "bg-red-500/10 text-red-500 border-red-500/20",
      btnBg: "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20",
    },
    warning: {
      iconBg: "bg-[#FFD000]/10 text-[#FFD000] border-[#FFD000]/20",
      btnBg: "bg-[#FFD000] hover:bg-yellow-400 text-[#0d1326] shadow-yellow-500/10",
    },
    info: {
      iconBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      btnBg: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-[#0f1629] border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 text-white space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Content */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-md flex items-center justify-center border shrink-0 ${variantStyles.iconBg}`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1 pr-6">
            <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-md text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 disabled:opacity-50 transition-colors"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-md text-xs font-extrabold tracking-wider uppercase shadow-md flex items-center gap-2 disabled:opacity-50 transition-all ${variantStyles.btnBg}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isLoading ? "Processing..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
