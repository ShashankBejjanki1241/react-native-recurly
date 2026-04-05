import dayjs from "dayjs";

export { formatCurrency } from "./formatCurrency";

/** Upcoming strip: human-readable urgency from `daysLeft` (static / API). */
export function formatUpcomingDaysLeft(daysLeft: number): string {
  if (!Number.isFinite(daysLeft)) return "—";
  if (daysLeft < 0) return "Overdue";
  if (daysLeft === 0) return "Due today";
  if (daysLeft === 1) return "Last day";
  return `${daysLeft} days left`;
}

/** ISO timestamps for subscription / renewal labels on the Home screen. */
export function formatSubscriptionDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = dayjs(iso);
    return d.isValid() ? d.format("MMM D, YYYY") : "—";
  } catch {
    return "—";
  }
}
