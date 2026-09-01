import { Button, cn } from "@raffle_v2/ui";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

export interface ReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (reason: string) => Promise<void> | void;
  loading?: boolean;
}

export function ReasonModal({
  open,
  onOpenChange,
  title,
  description,
  label = "Reason",
  placeholder = "Enter the reason...",
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onSubmit,
  loading = false,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setError("");
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open && !loading) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, loading, onOpenChange]);

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Reason is required.");
      return;
    }

    setError("");
    await onSubmit(trimmedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="fixed inset-0" aria-hidden="true" onClick={() => !loading && onOpenChange(false)} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f172a] p-6 text-white shadow-2xl">
        <button
          type="button"
          aria-label="Close reason modal"
          disabled={loading}
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-2 pr-8">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </label>

          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (error) setError("");
            }}
            placeholder={placeholder}
            rows={5}
            disabled={loading}
            className={cn(
              "w-full resize-none rounded-xl border bg-slate-950/70 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500",
              error ? "border-red-500/80" : "border-slate-700 focus:border-amber-400",
              loading && "cursor-not-allowed opacity-70",
            )}
          />

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="border border-slate-700 bg-slate-900/50 text-slate-200 hover:bg-slate-800"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
