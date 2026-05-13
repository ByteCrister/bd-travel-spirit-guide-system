import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { ApiPaginatedResponse, Transaction } from '@/types/dashboard/dashboard.type';
import { getMasterMockData, isInRange } from '@/app/api/(mock)/mock/dashboard/v1/_mockData';

const schema = z.object({
    transactionsDateRangeFrom: z.string().transform((str) => new Date(str)),
    transactionsDateRangeTo: z.string().transform((str) => new Date(str)),
    transactionsCursor: z.string().optional(),
    transactionsLimit: z.coerce.number().min(1).max(100).default(20),
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
        const from = p.transactionsDateRangeFrom;
        const to = p.transactionsDateRangeTo;
        const limit = p.transactionsLimit;

        const filtered = getMasterMockData()
            .transactions.filter((tx) => isInRange(tx.createdAt, from, to))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        let startIndex = 0;
        if (p.transactionsCursor) {
            const idx = filtered.findIndex((tx) => tx._id === p.transactionsCursor);
            if (idx !== -1) startIndex = idx + 1;
        }
        const page = filtered.slice(startIndex, startIndex + limit);
        const hasNextPage = startIndex + limit < filtered.length;
        const nextCursor = hasNextPage ? page[page.length - 1]?._id : undefined;

        const body: ApiPaginatedResponse<Transaction> = {
            data: page,
            total: filtered.length,
            page: 1,
            limit,
            hasNextPage,
            nextCursor,
        };
        return NextResponse.json({ data: body });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Internal server error' },
            { status: 500 },
        );
    }
}
