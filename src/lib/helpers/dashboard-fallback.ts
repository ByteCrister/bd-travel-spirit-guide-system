// lib/helpers/dashboard-fallback.ts

/**
 * Result from a query-with-fallback operation.
 *
 * @template T - The data type returned by the query.
 */
export type FallbackResult<T> = {
    data: T;
    /**
     * True when the date-ranged query returned no results and we fell back
     * to the most recent available data for this company (any date range).
     */
    isInitialData: boolean;
};

/**
 * Runs `rangedQuery` first. If `isEmpty(result)` is true, runs `fallbackQuery`
 * instead and marks the result as initial/fallback data.
 *
 * This keeps authorization consistent -- both queries must already scope
 * results to the same companyId. Only the date filter is relaxed.
 *
 * @param rangedQuery   - Query scoped to a specific date range.
 * @param fallbackQuery - Same query without any date filter.
 * @param isEmpty       - Predicate that returns true when `rangedQuery` result is empty.
 */
export async function queryWithFallback<T>(
    rangedQuery: () => Promise<T>,
    fallbackQuery: () => Promise<T>,
    isEmpty: (result: T) => boolean,
): Promise<FallbackResult<T>> {
    const rangedResult = await rangedQuery();

    if (!isEmpty(rangedResult)) {
        return { data: rangedResult, isInitialData: false };
    }

    // No data in the requested range -- try any date
    const fallbackResult = await fallbackQuery();
    return { data: fallbackResult, isInitialData: true };
}
