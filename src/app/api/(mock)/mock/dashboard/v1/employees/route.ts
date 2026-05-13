import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EMPLOYEE_STATUS } from '@/constants/employee/employee.const';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const employeeStatusValues = Object.values(EMPLOYEE_STATUS) as [string, ...string[]];

const schema = z.object({
    employeesDateRangeFrom: z.string().transform((str) => new Date(str)),
    employeesDateRangeTo: z.string().transform((str) => new Date(str)),
    employeeStatus: z.enum(employeeStatusValues).optional(),
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
        const { employeesDateRangeFrom: from, employeesDateRangeTo: to, employeeStatus } = parsed.data;
        const data = getMasterMockData()
            .employees.filter(
                (e) => isInRange(e.dateOfJoining, from, to) && (!employeeStatus || e.status === employeeStatus),
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
