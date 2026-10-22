const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const sameYearFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const fullDateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatCreatedDate(value: Date | string) {
  return `Created ${formatDate(value)}`;
}

export function formatFullCreatedDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return `Created ${fullDateTimeFormatter.format(date)} UTC`;
}

export function formatDate(value: Date | string) {
  return dateFormatter.format(typeof value === "string" ? new Date(value) : value);
}

export function formatRelativeDate(value: Date | string, now = Date.now()): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const time = date.getTime();
  if (Number.isNaN(time)) return "";

  const diff = now - time;

  // If clock is slightly ahead or within 1 minute
  if (diff < MINUTE) {
    return "Just now";
  }

  // Under 1 hour
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins}m ago`;
  }

  // Under 24 hours
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }

  // Under 48 hours
  if (diff < 2 * DAY) {
    return "Yesterday";
  }

  // Under 7 days
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  // 7 days or older
  const currentYear = new Date(now).getUTCFullYear();
  const isCurrentYear = date.getUTCFullYear() === currentYear;

  if (isCurrentYear) {
    return sameYearFormatter.format(date);
  }

  return dateFormatter.format(date);
}
