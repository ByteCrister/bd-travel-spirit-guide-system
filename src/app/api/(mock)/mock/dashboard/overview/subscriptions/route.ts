import { NextRequest, NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import type { SubscriptionHistoryEntry } from "@/types/overview.types";
import { SUBSCRIPTION_STATUS } from "@/constants/guide/guide.const";

/**
 * In-memory full history seed (simulate hundreds of entries).
 * This dataset acts as the canonical source for pagination.
 */
let _fullHistory: SubscriptionHistoryEntry[] | null = null;

function seedFullHistory(count = 200): SubscriptionHistoryEntry[] {
    const now = Date.now();
    const items: SubscriptionHistoryEntry[] = [];
    for (let i = 0; i < count; i++) {
        const created = new Date(now - (count - i) * 1000 * 60 * 60 * 24).toISOString(); // each day older
        items.push({
            id: faker.string.uuid(),
            startDate: new Date(Date.now() - (count - i + 30) * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - (count - i - 1) * 24 * 60 * 60 * 1000).toISOString(),
            amount: 50000,
            currency: "BDT",
            status: SUBSCRIPTION_STATUS.ACTIVE,
            paymentProvider: "stripe",
            paymentId: faker.string.uuid(),
            method: "card",
            autoRenew: true,
            failureCount: 0,
            cancelledAt: null,
            refunded: false,
            notes: "seeded",
            createdAt: created,
        });
    }
    return items;
}

if (!_fullHistory) _fullHistory = seedFullHistory(200);

/**
 * GET handler: supports ?after=cursor&limit=20
 * Cursor is interpreted as ISO createdAt string; we return items whose createdAt > after.
 * Ordering: ascending by createdAt (older first). The store merges by appending.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const after = url.searchParams.get("after"); // cursor: ISO string of last seen createdAt
    const limit = Number(url.searchParams.get("limit") ?? 20);

    // Sort just to be explicit (oldest -> newest)
    const sorted = _fullHistory!.slice().sort((a, b) => {
        const ta = new Date(a.createdAt!).getTime();
        const tb = new Date(b.createdAt!).getTime();
        return ta - tb;
    });

    let startIndex = 0;
    if (after) {
        // find first index with createdAt > after
        startIndex = sorted.findIndex((it) => {
            const t = new Date(it.createdAt!).getTime();
            return t > new Date(after).getTime();
        });
        if (startIndex === -1) startIndex = sorted.length; // no items after cursor
    }

    const pageItems = sorted.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < sorted.length;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1].createdAt ?? null : null;

    return NextResponse.json({
        ok: true,
        data: {
            subscriptionHistory: pageItems,
            page: {
                items: pageItems,
                nextCursor,
                hasMore,
            },
        },
    });
}
