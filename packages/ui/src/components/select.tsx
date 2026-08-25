/** biome-ignore-all lint/a11y/noLabelWithoutControl: label */
import { cn } from "@raffle_v2/ui";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  label,
  error,
  disabled = false,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setIsOpen(false);
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full font-sans", className)}>
      {/* Label */}
      {label && (
        <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Select Container */}
      <div ref={containerRef} className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-md border border-tr-outline-variant/40 bg-tr-surface-container-low px-4 text-xs font-semibold text-tr-on-surface transition-all outline-none",
            "hover:border-tr-primary/60 focus:border-tr-primary focus:ring-2 focus:ring-tr-primary/10",
            isOpen && "border-tr-primary ring-2 ring-tr-primary/10",
            error && "border-tr-error focus:border-tr-error focus:ring-tr-error/10",
            disabled && "cursor-not-allowed opacity-50 bg-tr-surface-container-high/40",
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {SelectedIcon && <SelectedIcon className="h-4 w-4 shrink-0 text-tr-primary" />}
            <span
              className={cn(
                "truncate",
                !selectedOption && "text-tr-on-surface-variant/50 font-normal",
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-tr-on-surface-variant transition-transform duration-200",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Options Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 max-h-60 w-full overflow-y-auto rounded-md border border-tr-outline-variant/30 bg-tr-surface-container-lowest p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-tr-on-surface-variant/60">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                const Icon = option.icon;

                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-xs font-semibold transition-colors",
                      isSelected
                        ? "bg-tr-primary-container/20 text-tr-primary"
                        : "text-tr-on-surface hover:bg-tr-surface-container-low",
                      option.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "text-tr-primary" : "text-tr-on-surface-variant",
                          )}
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>

                    {isSelected && <Check className="h-4 w-4 shrink-0 text-tr-primary" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-[11px] font-medium text-tr-error">{error}</p>}
    </div>
  );
}
