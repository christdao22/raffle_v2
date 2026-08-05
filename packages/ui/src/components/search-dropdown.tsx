import * as React from "react";
import { cn } from "../lib/utils";
import { Input } from "./input";

export interface SearchableDropdownProps<T extends Record<string, unknown>> {
  /** Array of items to display */
  options?: T[];
  /** Currently selected value */
  value?: string;
  /** Callback when selection changes */
  onChange?: (value: string) => void;
  /** Field to use as the unique identifier (default: "id") */
  valueField?: keyof T;
  /** Field to use for display text (default: "name") */
  labelField?: keyof T;
  /** Optional secondary text field */
  secondaryField?: keyof T;
  /** Field to search against (default: same as labelField) */
  searchField?: keyof T;
  /** Custom filter function */
  filterFn?: (item: T, search: string) => boolean;
  /** Custom render function for each option */
  renderOption?: (item: T, isSelected: boolean, isHighlighted: boolean) => React.ReactNode;
  /** Placeholder when nothing is selected */
  placeholder?: string;
  /** Placeholder for search input */
  searchPlaceholder?: string;
  /** Message when no results found */
  emptyMessage?: string;
  /** Disable the dropdown */
  disabled?: boolean;
  /** Show loading state */
  loading?: boolean;
  /** Error message */
  error?: string;
  /** Additional classes */
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  optionClassName?: string;
  /** External search value */
  search?: string;
  /** Callback when search input changes */
  setSearch?: (value: string) => void;
  /** Set to true if search filtering is handled server-side */
  serverSide?: boolean;
}

export function SearchableDropdown<T extends Record<string, unknown>>({
  options = [],
  value,
  onChange,
  valueField = "id" as keyof T,
  labelField = "name" as keyof T,
  secondaryField,
  searchField,
  filterFn,
  renderOption,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  loading = false,
  error,
  className,
  triggerClassName,
  contentClassName,
  optionClassName,
  search: _externalSearch,
  setSearch,
  serverSide = false,
}: SearchableDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [selectedOption, setSelectedOption] = React.useState<T | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  // Preserve selected option object even when current paginated options array changes
  React.useEffect(() => {
    if (value !== undefined && value !== "") {
      const found = options.find((opt) => String(opt[valueField]) === String(value));
      if (found) {
        setSelectedOption(found);
      }
    } else {
      setSelectedOption(null);
    }
  }, [value, options, valueField]);

  const searchBy = (searchField || labelField) as keyof T;

  // Filter options locally ONLY IF serverSide is false
  const filteredOptions = React.useMemo(() => {
    if (serverSide) return options;
    if (!internalSearch.trim()) return options;

    if (filterFn) {
      return options.filter((item) => filterFn(item, internalSearch));
    }

    return options.filter((item) => {
      const fieldValue = item[searchBy];
      if (typeof fieldValue === "string") {
        return fieldValue.toLowerCase().includes(internalSearch.toLowerCase());
      }
      if (typeof fieldValue === "number") {
        return String(fieldValue).includes(internalSearch);
      }
      return false;
    });
  }, [options, internalSearch, filterFn, searchBy, serverSide]);

  // Handle typing inside search input
  const handleSearchInput = (val: string) => {
    setInternalSearch(val);
    setSearch?.(val);
    setHighlightedIndex(-1);
  };

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset state when dropdown closes
  React.useEffect(() => {
    if (!open) {
      setInternalSearch("");
      setSearch?.("");
      setHighlightedIndex(-1);
    }
  }, [open, setSearch]);

  // Focus search input on open
  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const element = listRef.current.children[highlightedIndex] as HTMLElement;
      element?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
    }
  };

  const handleSelect = (item: T) => {
    setSelectedOption(item);
    onChange?.(String(item[valueField]));
    setOpen(false);
  };

  const defaultRenderOption = (item: T) => (
    <div className="flex flex-col">
      <span className="font-medium">{String(item[labelField])}</span>
      {secondaryField && item[secondaryField] != null && (
        <span className="text-xs text-muted-foreground">{String(item[secondaryField])}</span>
      )}
    </div>
  );

  const renderOptionFn = renderOption || defaultRenderOption;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive",
          triggerClassName,
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
          {selectedOption ? String(selectedOption[labelField]) : placeholder}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180",
          )}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown Content */}
      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-background text-foreground shadow-md outline-none",
            contentClassName,
          )}
        >
          {/* Search Input */}
          <div className="p-2 border-b border-border bg-background">
            <Input
              ref={inputRef}
              type="text"
              value={internalSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="h-8 text-sm bg-background"
            />
          </div>

          {/* Options List */}
          {loading ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">Loading items...</p>
          ) : filteredOptions.length > 0 ? (
            <div ref={listRef} role="listbox" className="max-h-60 overflow-auto p-1 bg-background">
              {filteredOptions.map((item, index) => {
                const itemValue = String(item[valueField]);
                const isSelected = itemValue === value;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={itemValue}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelect(item);
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      (isSelected || isHighlighted) && "bg-accent text-accent-foreground",
                      optionClassName,
                    )}
                  >
                    {renderOptionFn(item, isSelected, isHighlighted)}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
