const MANILA_OFFSET = "+08:00";

/**
 * Parses a date/string/number into a Date, treating any string that has
 * no explicit timezone (no trailing 'Z' or ±HH:MM) as Asia/Manila time.
 */
export function toManilaDate(input: Date | string | number): Date {
  if (input instanceof Date) return input;
  if (typeof input === "number") return new Date(input);

  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(input.trim());
  const normalized = input.includes("T") ? input : input.replace(" ", "T");

  return new Date(hasTimezone ? normalized : `${normalized}${MANILA_OFFSET}`);
}

/**
 * Converts a date into a relative "time ago" string, e.g. "5m ago",
 * "3h ago", "Yesterday", "2d ago". Falls back to a Manila-formatted
 * date once it's more than a week old.
 */
export function timeAgo(input: Date | string | number): string {
  const date = toManilaDate(input);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  if (diffSec < 5) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  // Older than a week: show an absolute date in Manila time.
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
