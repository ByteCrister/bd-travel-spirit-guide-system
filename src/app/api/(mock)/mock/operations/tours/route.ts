import { faker } from "@faker-js/faker";

import {
    TRAVEL_TYPE,
    DIVISION,
    DISTRICT,
    DIFFICULTY_LEVEL,
    TOUR_STATUS,
    MODERATION_STATUS,
    CURRENCY,
} from "@/constants/tour/tour.const";

import {
    TourListItemDTO,
    TourFilterOptions,
    CompanyKpisDTO,
    TourSortOption,
} from "@/types/tour/tour.types";

faker.seed(2025);

/* ===================== TYPES ===================== */

interface MockTourResponse {
    data: {
        docs: TourListItemDTO[];
        total: number;
        page: number;
        pages: number;
        company?: CompanyKpisDTO;
    };
}

/* ===================== SORT TYPES ===================== */

type SortValue = string | number | undefined;

const TOUR_SORT_OPTIONS = [
    "title",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "basePrice.amount",
    "ratings.average",
    "wishlistCount",
    "viewCount",
    "nextDeparture",
] as const;

const isTourSortOption = (value: unknown): value is TourSortOption =>
    typeof value === "string" &&
    (TOUR_SORT_OPTIONS as readonly string[]).includes(value);

/* ===================== SORT EXTRACTORS ===================== */

const sortExtractors: Record<
    TourSortOption,
    (tour: TourListItemDTO) => SortValue
> = {
    title: tour => tour.title,
    "basePrice.amount": tour => tour.basePrice.amount,
    "ratings.average": tour => tour.ratings?.average,
    wishlistCount: tour => tour.wishlistCount,
    viewCount: tour => tour.viewCount,
    createdAt: tour => new Date(tour.createdAt).getTime(),
    updatedAt: tour => new Date(tour.updatedAt).getTime(),
    publishedAt: tour =>
        tour.publishedAt ? new Date(tour.publishedAt).getTime() : undefined,
    nextDeparture: tour =>
        tour.nextDeparture ? new Date(tour.nextDeparture).getTime() : undefined,
};

/* ===================== HELPERS ===================== */

const toNumber = (v: string | string[] | undefined): number | undefined => {
    if (!v || Array.isArray(v)) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
};

const toBoolean = (v: string | string[] | undefined): boolean | undefined =>
    typeof v === "string" ? v === "true" : undefined;

/* ===================== MOCK DATA ===================== */

const generateCompanyKpis = (): CompanyKpisDTO => ({
    totalTours: faker.number.int({ min: 10, max: 150 }),
    openReports: faker.number.int({ min: 0, max: 20 }),
    publishedTours: faker.number.int({ min: 5, max: 100 }),
    totalBookings: faker.number.int({ min: 50, max: 5000 }),
    avgTourRating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
});

// Update the generateTourListItem function
const generateTourListItem = (id: string): TourListItemDTO => {
    // Generate status first
    const status = faker.helpers.arrayElement(Object.values(TOUR_STATUS));

    return {
        id,
        title: faker.lorem.words(5),
        slug: faker.helpers.slugify(faker.lorem.words(3)),
        status,
        summary: faker.lorem.sentences(2),
        heroImage: faker.image.urlLoremFlickr({ category: "nature" }),

        tourType: faker.helpers.arrayElement(Object.values(TRAVEL_TYPE)),
        division: faker.helpers.arrayElement(Object.values(DIVISION)),
        district: faker.helpers.arrayElement(Object.values(DISTRICT)),
        difficulty: faker.helpers.arrayElement(Object.values(DIFFICULTY_LEVEL)),

        basePrice: {
            amount: faker.number.int({ min: 1000, max: 50000 }),
            currency: CURRENCY.BDT,
        },

        duration: {
            days: faker.number.int({ min: 1, max: 14 }),
        },

        nextDeparture: faker.date.future().toISOString(),

        ratings: {
            average: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
            count: faker.number.int({ min: 0, max: 500 }),
        },

        wishlistCount: faker.number.int({ min: 0, max: 200 }),
        viewCount: faker.number.int({ min: 100, max: 10000 }),
        likeCount: faker.number.int({ min: 0, max: 1000 }),
        shareCount: faker.number.int({ min: 0, max: 500 }),

        moderationStatus: faker.helpers.arrayElement(
            Object.values(MODERATION_STATUS)
        ),
        featured: faker.datatype.boolean(),

        publishedAt:
            status === "submitted"
                ? faker.date.past().toISOString()
                : undefined,

        companyId: "company_123",
        authorId: "author_123",
        createdAt: faker.date.past().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
    };
};

const arrayOrUndefined = <T>(arr: string[]): T[] | undefined =>
    arr.length ? (arr as T[]) : undefined;

const TOUR_POOL: TourListItemDTO[] = Array.from({ length: 200 }, (_, i) =>
    generateTourListItem(`tour_${i + 1}`)
);

/* ===================== FILTERING ===================== */

const applyFilters = (
    tours: TourListItemDTO[],
    filters?: TourFilterOptions
): TourListItemDTO[] => {
    if (!filters) return tours;

    return tours.filter(tour => {
        if (filters.search &&
            !tour.title.toLowerCase().includes(filters.search.toLowerCase()))
            return false;

        if (filters.division && !filters.division.includes(tour.division))
            return false;

        if (filters.district && !filters.district.includes(tour.district))
            return false;

        if (filters.tourType && !filters.tourType.includes(tour.tourType))
            return false;

        if (filters.difficulty && !filters.difficulty.includes(tour.difficulty))
            return false;

        if (filters.featured !== undefined && tour.featured !== filters.featured)
            return false;

        if (filters.minPrice !== undefined &&
            tour.basePrice.amount < filters.minPrice)
            return false;

        if (filters.maxPrice !== undefined &&
            tour.basePrice.amount > filters.maxPrice)
            return false;

        return true;
    });
};

/* ===================== SORTING ===================== */

const applySorting = (
    tours: TourListItemDTO[],
    sort?: TourSortOption,
    order: "asc" | "desc" = "desc"
): TourListItemDTO[] => {
    if (!sort) return tours;

    const extractor = sortExtractors[sort];

    return [...tours].sort((a, b) => {
        const aValue = extractor(a);
        const bValue = extractor(b);

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return order === "asc" ? -1 : 1;
        if (bValue == null) return order === "asc" ? 1 : -1;

        if (typeof aValue === "number" && typeof bValue === "number") {
            return order === "asc" ? aValue - bValue : bValue - aValue;
        }

        return order === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
    });
};

/* ===================== API HANDLER ===================== */

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const page = toNumber(searchParams.get("page") ?? undefined) ?? 1;
    const limit = toNumber(searchParams.get("limit") ?? undefined) ?? 10;
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const sort = isTourSortOption(searchParams.get("sort"))
        ? (searchParams.get("sort") as TourSortOption)
        : "createdAt";
    const includeCompany = searchParams.get("includeCompany") === "true";

    const filters: TourFilterOptions = {
        search: searchParams.get("search") ?? undefined,

        division: arrayOrUndefined(searchParams.getAll("division")),
        district: arrayOrUndefined(searchParams.getAll("district")),
        tourType: arrayOrUndefined(searchParams.getAll("tourType")),
        difficulty: arrayOrUndefined(searchParams.getAll("difficulty")),

        featured: toBoolean(searchParams.get("featured") ?? undefined),
        minPrice: toNumber(searchParams.get("minPrice") ?? undefined),
        maxPrice: toNumber(searchParams.get("maxPrice") ?? undefined),
    };

    let result = applyFilters(TOUR_POOL, filters);
    const total = result.length;

    result = applySorting(result, sort, order);

    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    const body: MockTourResponse = {
        data: {
            docs: paginated,
            total,
            page,
            pages: Math.ceil(total / limit),
            ...(includeCompany && { company: generateCompanyKpis() }),
        }
    }

    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
}