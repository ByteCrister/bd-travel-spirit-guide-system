import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TOUR_STATUS } from '@/constants/tour/tour.const';
import { EMPLOYEE_STATUS } from '@/constants/employee/employee.const';
import { REPORT_STATUS } from '@/constants/tour/report.const';
import { BOOKING_STATUS } from '@/constants/tour/tour-booking.const';
import { computeDashboardStats, getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const employeeStatusValues = Object.values(EMPLOYEE_STATUS) as [string, ...string[]];

const schema = z.object({
    statsDateRangeFrom: z.string().transform((str) => new Date(str)),
    statsDateRangeTo: z.string().transform((str) => new Date(str)),
    tourStatus: z.nativeEnum(TOUR_STATUS).optional(),
    employeeStatus: z.enum(employeeStatusValues).optional(),
    reportStatus: z.nativeEnum(REPORT_STATUS).optional(),
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
        const p = parsed.data;
        const from = p.statsDateRangeFrom;
        const to = p.statsDateRangeTo;
        const master = getMasterMockData();

        const filteredTours = master.tours.filter(
            (t) => isInRange(t.createdAt, from, to) && (!p.tourStatus || t.status === p.tourStatus),
        );
        const filteredBookings = master.bookings.filter(
            (b) => isInRange(b.bookedAt, from, to) && (!p.bookingStatus || b.status === p.bookingStatus),
        );
        const filteredReviews = master.reviews.filter((r) => isInRange(r.createdAt, from, to));
        const filteredReports = master.reports.filter(
            (r) => isInRange(r.createdAt, from, to) && (!p.reportStatus || r.status === p.reportStatus),
        );
        const filteredEmployees = master.employees.filter(
            (e) => isInRange(e.dateOfJoining, from, to) && (!p.employeeStatus || e.status === p.employeeStatus),
        );

        const stats = computeDashboardStats(
            filteredTours,
            filteredBookings,
            filteredReviews,
            filteredReports,
            filteredEmployees,
        );

        return NextResponse.json({
            data: {
                stats,
                bookingsForCharts: filteredBookings.slice(0, 120),
                reviewsForCharts: filteredReviews.slice(0, 120),
            },
        });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
