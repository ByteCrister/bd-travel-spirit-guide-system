import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const schema = z.object({
    refundsDateRangeFrom: z.string().transform((str) => new Date(str)),
    refundsDateRangeTo: z.string().transform((str) => new Date(str)),
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
        const { refundsDateRangeFrom: from, refundsDateRangeTo: to } = parsed.data;
        const data = getMasterMockData()
            .refunds.filter((r) => isInRange(r.requestedAt, from, to))
            .slice(0, 100);
        return NextResponse.json({ data });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
