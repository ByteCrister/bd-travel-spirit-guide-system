import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const schema = z.object({
    reportsDateRangeFrom: z.string().transform((str) => new Date(str)),
    reportsDateRangeTo: z.string().transform((str) => new Date(str)),
    reportStatus: z.nativeEnum(REPORT_STATUS).optional(),
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
        const { reportsDateRangeFrom: from, reportsDateRangeTo: to, reportStatus } = parsed.data;
        const data = getMasterMockData()
            .reports.filter((r) => isInRange(r.createdAt, from, to) && (!reportStatus || r.status === reportStatus))
            .slice(0, 100);
        return NextResponse.json({ data });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
