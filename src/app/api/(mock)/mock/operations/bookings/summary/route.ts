// app/api/mock/operations/tours/bookings/summary/route.ts
import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { BookingsSummaryApiResponse, BookingStatusCount } from '@/types/tour/booking.types';

// Seed for reproducible mock data (optional, remove for true randomness)
faker.seed(42);

/**
 * Generates realistic random counts for booking statuses.
 * The sum of all counts equals `total`.
 */
function generateMockSummary(): BookingStatusCount {
    const total = faker.number.int({ min: 150, max: 800 });

    // Percentages (approximate ranges)
    const pendingPct = faker.number.float({ min: 0.05, max: 0.2 });      // 5-20%
    const confirmedPct = faker.number.float({ min: 0.35, max: 0.55 });    // 35-55%
    const completedPct = faker.number.float({ min: 0.15, max: 0.3 });     // 15-30%
    const cancelledPct = faker.number.float({ min: 0.05, max: 0.12 });    // 5-12%
    // refunded takes the remainder (ensures total sums correctly)

    const pending = Math.floor(total * pendingPct);
    let confirmed = Math.floor(total * confirmedPct);
    const completed = Math.floor(total * completedPct);
    const cancelled = Math.floor(total * cancelledPct);
    let refunded = total - (pending + confirmed + completed + cancelled);

    // Edge case safety: if any negative due to rounding, adjust
    if (refunded < 0) {
        refunded = 0;
        // redistribute the leftover by adding to the largest category (confirmed)
        const leftover = total - (pending + confirmed + completed + cancelled);
        if (leftover > 0) confirmed += leftover;
    }

    return {
        pending,
        confirmed,
        cancelled,
        refunded,
        completed,
        total,
    };
}

export async function GET() {
    // Simulate network delay (optional, realistic for mock API)
    await new Promise((resolve) => setTimeout(resolve, 150));

    const summaryData = generateMockSummary();

    const response: BookingsSummaryApiResponse = {
        data: summaryData,
    };

    return NextResponse.json(response);
}