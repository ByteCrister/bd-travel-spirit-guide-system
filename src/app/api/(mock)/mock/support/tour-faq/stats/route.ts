import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import type { FAQStats, FAQStatsApiResponse } from '@/types/tour/faqs.types';

// Helper to generate realistic stats
function generateMockStats(): FAQStats {
    const totalApproved = faker.number.int({ min: 10, max: 200 });
    const totalPending = faker.number.int({ min: 0, max: 15 });
    const totalRejected = faker.number.int({ min: 0, max: 10 });
    const totalFAQs = totalApproved + totalPending + totalRejected;

    const totalLikes = faker.number.int({ min: 0, max: totalApproved * 5 });
    const totalDislikes = faker.number.int({ min: 0, max: totalApproved * 2 });

    return {
        totalFAQs,
        totalApproved,
        totalPending,
        totalRejected,
        totalLikes,
        totalDislikes,
    };
}

export async function GET() {
    // Simulate network delay (optional, adjust as needed)
    await new Promise((resolve) => setTimeout(resolve, 300));

    const stats = generateMockStats();

    const response: FAQStatsApiResponse = {
        data: stats,
    };

    return NextResponse.json(response);
}