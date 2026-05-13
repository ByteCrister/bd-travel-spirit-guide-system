import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TOUR_STATUS } from '@/constants/tour/tour.const';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const schema = z.object({
    toursDateRangeFrom: z.string().transform((str) => new Date(str)),
    toursDateRangeTo: z.string().transform((str) => new Date(str)),
    tourStatus: z.nativeEnum(TOUR_STATUS).optional(),
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
        const { toursDateRangeFrom: from, toursDateRangeTo: to, tourStatus } = parsed.data;
        const data = getMasterMockData()
            .tours.filter((t) => isInRange(t.createdAt, from, to) && (!tourStatus || t.status === tourStatus))
            .slice(0, 100);
        return NextResponse.json({ data });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
