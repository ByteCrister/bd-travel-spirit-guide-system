// app/api/mock/operations/reviews/_mockDB.ts
import { faker } from "@faker-js/faker";
import type {
    ReviewDetailDTO,
    ReviewReplyDTO,
    ReviewListItemDTO,
    ReviewFilters,
    ReviewSortField,
    SortDirection,
} from "@/types/reviews.types";

export type ObjectIdStr = string;

const SEED = 12345;
faker.seed(SEED);

const makeId = (prefix = ""): ObjectIdStr => `${prefix}${faker.string.nanoid()}`;

type StoredReview = ReviewDetailDTO & { _deleted?: boolean };


const DEFAULT_TOTAL = 250;

const DB: { reviews: StoredReview[] } = { reviews: [] };

function makeReviewDetail(overrides: Partial<ReviewDetailDTO> = {}): StoredReview {
    const id = overrides._id ?? makeId("r_");
    const tourId = overrides.tourId ?? makeId("t_");
    const userId = overrides.userId ?? makeId("u_");
    const createdAt = overrides.createdAt ?? faker.date.past({ years: 2 }).toISOString();
    const updatedAt = overrides.updatedAt ?? createdAt;
    const rating = overrides.rating ?? faker.number.int({ min: 1, max: 5 });
    const images =
        overrides.images ??
        (faker.datatype.boolean()
            ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.image.urlLoremFlickr({ category: "travel" }))
            : []);
    const replies: ReviewReplyDTO[] = (overrides.replies ?? []).map((r) => ({
        _id: r._id ?? makeId("rep_"),
        employeeId: r.employeeId ?? makeId("emp_"),
        message: r.message ?? faker.lorem.sentences({ min: 1, max: 2 }),
        isApproved: typeof r.isApproved === "boolean" ? r.isApproved : true,
        createdAt: r.createdAt ?? new Date().toISOString(),
        updatedAt: r.updatedAt ?? new Date().toISOString(),
        deletedAt: r.deletedAt ?? null,
    }));

    const tripType = overrides.tripType ?? null;
    const travelDate = overrides.travelDate ?? (faker.datatype.boolean() ? faker.date.past({ years: 2 }).toISOString() : null);

    const base: StoredReview = {
        _id: id,
        tourId,
        tourTitle: overrides.tourTitle ?? faker.lorem.words({ min: 2, max: 5 }),
        userId,
        userName: overrides.userName ?? faker.person.fullName(),
        rating,
        title: overrides.title ?? faker.lorem.sentence(),
        comment: overrides.comment ?? faker.lorem.paragraphs({ min: 1, max: 2 }),
        images,
        tripType: tripType,
        travelDate,
        isVerified: typeof overrides.isVerified === "boolean" ? overrides.isVerified : faker.datatype.boolean(),
        isApproved: typeof overrides.isApproved === "boolean" ? overrides.isApproved : faker.datatype.boolean(),
        helpfulCount: typeof overrides.helpfulCount === "number" ? overrides.helpfulCount : faker.number.int({ min: 0, max: 200 }),
        createdAt,
        updatedAt,
        deletedAt: overrides.deletedAt ?? null,
        replies,
        userAvatar: overrides.userAvatar ?? (faker.datatype.boolean() ? faker.image.avatar() : null),
        userEmail: overrides.userEmail ?? faker.internet.email(),
        tourSlug: overrides.tourSlug ?? faker.helpers.slugify(`${faker.lorem.words({ min: 1, max: 3 })}-${tourId}`),
        tourHeroImage: overrides.tourHeroImage ?? (faker.datatype.boolean() ? faker.image.urlLoremFlickr({ category: "travel" }) : null),
        moderationHistory: overrides.moderationHistory ?? [],
        ipAddress: overrides.ipAddress ?? faker.internet.ip(),
        userAgent: overrides.userAgent ?? faker.internet.userAgent(),
        bookingReference: overrides.bookingReference ?? (faker.datatype.boolean() ? faker.string.nanoid() : null),
    };

    return base;
}

function seedIfNeeded(total = DEFAULT_TOTAL) {
    if (DB.reviews.length >= total) return;
    for (let i = DB.reviews.length; i < total; i++) {
        DB.reviews.push(makeReviewDetail());
    }
}

function applyFilters(list: StoredReview[], filters: Partial<ReviewFilters> | null): StoredReview[] {
    if (!filters || Object.keys(filters).length === 0) return list;
    return list.filter((r) => {
        if (filters.tourId && r.tourId !== filters.tourId) return false;
        if (typeof filters.isApproved === "boolean" && r.isApproved !== filters.isApproved) return false;
        if (filters.ratingMin !== undefined && r.rating < Number(filters.ratingMin)) return false;
        if (filters.ratingMax !== undefined && r.rating > Number(filters.ratingMax)) return false;
        if (filters.hasImages != null) {
            const has = (r.images ?? []).length > 0;
            if (filters.hasImages !== has) return false;
        }
        if (filters.tripType && r.tripType !== filters.tripType) return false;
        if (filters.query) {
            const q = String(filters.query).toLowerCase();
            const field = filters.queryField ?? "comment";
            const val = String(r[field] ?? "").toLowerCase();
            if (!val.includes(q)) return false;
        }
        if (!filters.includeDeleted && r.deletedAt) return false;
        if (filters.dateFrom) {
            const from = Date.parse(filters.dateFrom);
            if (!Number.isNaN(from) && Date.parse(r.createdAt) < from) return false;
        }
        if (filters.dateTo) {
            const to = Date.parse(filters.dateTo);
            if (!Number.isNaN(to) && Date.parse(r.createdAt) > to) return false;
        }
        return true;
    });
}

function applySort(
    list: StoredReview[],
    sortField: ReviewSortField = "createdAt",
    sortDir: SortDirection = "desc"
): StoredReview[] {
    const dir = sortDir === "asc" ? 1 : -1;

    return [...list].sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];

        if (va == null && vb == null) return 0;
        if (va == null) return -1 * dir;
        if (vb == null) return 1 * dir;

        // Handle date fields
        if (sortField === "createdAt" || sortField === "updatedAt") {
            const dateA = Date.parse(va as string);
            const dateB = Date.parse(vb as string);
            return (dateA - dateB) * dir;
        }

        // Handle number fields
        if (sortField === "rating" || sortField === "helpfulCount") {
            return (va as number - (vb as number)) * dir;
        }

        // Handle boolean fields (isApproved)
        if (sortField === "isApproved") {
            return ((va ? 1 : 0) - (vb ? 1 : 0)) * dir;
        }

        // Fallback to string comparison
        return String(va).localeCompare(String(vb)) * dir;
    });
}


function toListDTO(r: StoredReview): ReviewListItemDTO {
    return {
        _id: r._id,
        tourId: r.tourId,
        tourTitle: r.tourTitle,
        userId: r.userId,
        userName: r.userName,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        images: r.images,
        tripType: r.tripType ?? null,
        travelDate: r.travelDate ?? null,
        isVerified: r.isVerified,
        isApproved: r.isApproved,
        helpfulCount: r.helpfulCount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        deletedAt: r.deletedAt ?? null,
    };
}

function toDetailDTO(r: StoredReview): ReviewDetailDTO {
    return {
        ...toListDTO(r),
        replies: (r.replies ?? []).map((rep) => ({
            _id: rep._id,
            employeeId: rep.employeeId,
            message: rep.message,
            isApproved: rep.isApproved,
            createdAt: rep.createdAt,
            updatedAt: rep.updatedAt,
            deletedAt: rep.deletedAt ?? null,
        })),
        userAvatar: r.userAvatar ?? null,
        userEmail: r.userEmail ?? null,
        tourSlug: r.tourSlug ?? null,
        tourHeroImage: r.tourHeroImage ?? null,
        moderationHistory: r.moderationHistory ?? [],
        ipAddress: r.ipAddress ?? null,
        userAgent: r.userAgent ?? null,
        bookingReference: r.bookingReference ?? null,
    };
}

export {
    DB,
    seedIfNeeded,
    makeId,
    makeReviewDetail,
    applyFilters,
    applySort,
    toListDTO,
    toDetailDTO,
    DEFAULT_TOTAL,
};
