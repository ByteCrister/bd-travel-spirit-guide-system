// utils/helpers/reviews.cacheSlice.ts

export type IndexRange = { start: number; end: number }; // end is exclusive

export function rangeForPage(page: number, limit: number): IndexRange {
    const start = (page - 1) * limit;
    return { start, end: start + limit };
}

export function intersects(a: IndexRange, b: IndexRange): boolean {
    return a.start < b.end && b.start < a.end;
}

export function subtractRanges(base: IndexRange, existingRanges: IndexRange[]): IndexRange[] {
    // returns sorted non-overlapping missing ranges within base not covered by existingRanges
    const parts: IndexRange[] = [];
    let cursor = base.start;
    const sorted = existingRanges
        .map((r) => ({ start: Math.max(r.start, base.start), end: Math.min(r.end, base.end) }))
        .filter((r) => r.start < r.end)
        .sort((x, y) => x.start - y.start);

    for (const r of sorted) {
        if (cursor < r.start) parts.push({ start: cursor, end: r.start });
        cursor = Math.max(cursor, r.end);
    }
    if (cursor < base.end) parts.push({ start: cursor, end: base.end });
    return parts;
}
