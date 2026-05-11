// lib/reviews/uiHelpers.ts
import { ApiError } from "@/types/tour/reviews.types";
import { formatDistanceToNowStrict, parseISO } from "date-fns";

export function formatRelativeDate(iso: string): string {
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function formatFullDate(iso: string): string {
  try {
    const d = parseISO(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function truncate(text: string, n = 160): string {
  if (text.length <= n) return text;
  return text.slice(0, n - 1) + "…";
}

export function ratingToStars(rating: number): string {
  const full = "★".repeat(Math.max(0, Math.min(5, Math.floor(rating))));
  const empty = "☆".repeat(5 - full.length);
  return `${full}${empty}`;
}

export function statusBadgeProps(isApproved: boolean): { label: string; color: string } {
  return isApproved ? { label: "Approved", color: "green" } : { label: "Pending", color: "yellow" };
}

export function clampPages(pages: number): number {
  return Math.max(1, pages);
}


/** Type guard for ApiError */
export function isApiError(err: unknown): err is ApiError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof err === "object" && err !== null && "message" in err && typeof (err as any).message === "string";
}