import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const schema = z.object({
    runningToursDateRangeFrom: z.string().transform((str) => new Date(str)),
    runningToursDateRangeTo: z.string().transform((str) => new Date(str)),
});

export async function GET(request: NextRequest) {
    try {
        const queryParams: Record<string, string> = {};
        request.nextUrl.searchParams.forEach((v, k) => {
            queryParams[k] = v;
        });
        const parsed = schema.safeParse(queryParams);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error }, { status: 400 });
        }
        const { runningToursDateRangeFrom: from, runningToursDateRangeTo: to } = parsed.data;
        const data = getMasterMockData()
            .runningTours.filter(
                (t) => isInRange(t.windowStart, from, to) || isInRange(t.windowEnd, from, to),
            )
            .slice(0, 100);
        return NextResponse.json({ data });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
