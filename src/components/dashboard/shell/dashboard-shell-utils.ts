import { format } from 'date-fns';
import type { BookingSummary, ReviewSummary } from '@/types/dashboard/dashboard.type';

export const CHART_ACCENT = '#ea580c';
export const CHART_COLORS = ['#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];

export function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function buildBookingsChartData(bookings: BookingSummary[] | undefined) {
    if (!bookings?.length) return [];
    const grouped = bookings.reduce(
        (acc, booking) => {
            const date = format(new Date(booking.bookedAt), 'yyyy-MM-dd');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>,
    );
    return Object.entries(grouped)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function buildRatingDistribution(reviews: ReviewSummary[] | undefined) {
    if (!reviews?.length) return [];
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating))) as keyof typeof dist;
        dist[star]++;
    });
    return Object.entries(dist).map(([rating, count]) => ({
        rating: `${rating}★`,
        count,
    }));
}
