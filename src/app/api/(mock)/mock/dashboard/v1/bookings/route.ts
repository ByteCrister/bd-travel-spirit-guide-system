import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BOOKING_STATUS } from '@/constants/tour/tour-booking.const';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const schema = z.object({
    bookingsDateRangeFrom: z.string().transform((str) => new Date(str)),
    bookingsDateRangeTo: z.string().transform((str) => new Date(str)),
    bookingStatus: z.nativeEnum(BOOKING_STATUS).optional(),
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
        const { bookingsDateRangeFrom: from, bookingsDateRangeTo: to, bookingStatus } = parsed.data;
        const data = getMasterMockData()
            .bookings.filter((b) => isInRange(b.bookedAt, from, to) && (!bookingStatus || b.status === bookingStatus))
            .slice(0, 100);
        return NextResponse.json({ data });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
