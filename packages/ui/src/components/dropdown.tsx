/** biome-ignore-all lint/a11y/noStaticElementInteractions: dropdown */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: dropdown */
import { cn } from "@raffle_v2/ui";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export interface DropdownItem {
  id?: string;
  label: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger?: ReactNode;
  label?: string;
  items?: DropdownItem[];
  align?: "left" | "right";
  children?: ReactNode;
  className?: string;
}

export function Dropdown({
  trigger,
  label = "Options",
  items,
  align = "left",
  children,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger */}
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className="inline-flex items-center justify-between gap-2 rounded-xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest px-4 py-2 text-xs font-bold uppercase tracking-wider text-tr-on-surface shadow-xs transition-all hover:bg-tr-surface-container-low active:scale-95"
          >
            <span>{label}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-tr-on-surface-variant transition-transform duration-200",
                isOpen && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest p-1.5 shadow-xl font-sans text-tr-on-surface animate-in fade-in zoom-in-95 duration-150",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            className,
          )}
        >
          {items ? (
            <div className="py-0.5" role="menu">
              {items.map((item, idx) => {
                if (item.divider) {
                  return (
                    <div
                      key={item.id || idx}
                      className="my-1 border-b border-tr-outline-variant/15"
                    />
                  );
                }

                const Icon = item.icon;

                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      if (!item.disabled) {
                        item.onClick?.();
                        setIsOpen(false);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
                      item.danger
                        ? "text-tr-error hover:bg-tr-error-container/15"
                        : "text-tr-on-surface hover:bg-tr-surface-container-low",
                      item.disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                    )}
                    role="menuitem"
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          item.danger ? "text-tr-error" : "text-tr-on-surface-variant",
                        )}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div onClick={() => setIsOpen(false)}>{children}</div>
          )}
        </div>
      )}
    </div>
  );
}
