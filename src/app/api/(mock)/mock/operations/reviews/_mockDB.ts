// app/api/mock/operations/reviews/_mockDB.ts
import { faker } from "@faker-js/faker";
import type {
    ReviewDetailDTO,
    ReviewReplyDTO,
    ReviewListItemDTO,
    ReviewFilters,
    ReviewSortField,
    SortDirection,
} from "@/types/tour/reviews.types";
import { TRAVEL_TYPE } from "@/constants/tour/tour.const";

export type ObjectIdStr = string;

const SEED = 12345;
faker.seed(SEED);

const makeId = (prefix = ""): ObjectIdStr => `${prefix}${faker.string.nanoid(24)}`;

type StoredReview = ReviewDetailDTO & {
    _deleted?: boolean;
    helpfulVotes?: Array<{
        user: ObjectIdStr;
        helpful: boolean;
        createdAt: string;
        updatedAt: string;
    }>;
};

const DEFAULT_TOTAL = 250;
const DB: { reviews: StoredReview[] } = { reviews: [] };

// Helper to generate travel type
const generateTravelType = () => {
    const types = Object.values(TRAVEL_TYPE);
    return faker.helpers.arrayElement([...types, null]);
};

// Helper to generate reply status
const generateReplyStatus = () => {
    const status = faker.helpers.arrayElement(['approved', 'rejected', 'deleted', 'active']);

    switch (status) {
        case 'approved':
            return {
                isApproved: true,
                approvedAt: faker.date.past().toISOString(),
                rejectedAt: null,
                rejectionReason: null,
                deletedAt: null,
                deletedReason: null
            };
        case 'rejected':
            return {
                isApproved: false,
                approvedAt: null,
                rejectedAt: faker.date.past().toISOString(),
                rejectionReason: faker.lorem.sentence(),
                deletedAt: null,
                deletedReason: null
            };
        case 'deleted':
            return {
                isApproved: faker.datatype.boolean(),
                approvedAt: faker.datatype.boolean() ? faker.date.past().toISOString() : null,
                rejectedAt: faker.datatype.boolean() ? faker.date.past().toISOString() : null,
                rejectionReason: faker.datatype.boolean() ? faker.lorem.sentence() : null,
                deletedAt: faker.date.past().toISOString(),
                deletedReason: faker.lorem.sentence()
            };
        default:
            return {
                isApproved: true,
                approvedAt: null,
                rejectedAt: null,
                rejectionReason: null,
                deletedAt: null,
                deletedReason: null
            };
    }
};

// Helper to generate review status
const generateReviewStatus = () => {
    const status = faker.helpers.arrayElement(['approved', 'rejected', 'deleted', 'pending']);

    switch (status) {
        case 'approved':
            return {
                isApproved: true,
                approvedAt: faker.date.past().toISOString(),
                rejectedAt: null,
                rejectionReason: null,
                deletedAt: null,
                deletedReason: null
            };
        case 'rejected':
            return {
                isApproved: false,
                approvedAt: null,
                rejectedAt: faker.date.past().toISOString(),
                rejectionReason: faker.lorem.sentence(),
                deletedAt: null,
                deletedReason: null
            };
        case 'deleted':
            return {
                isApproved: faker.datatype.boolean(),
                approvedAt: faker.datatype.boolean() ? faker.date.past().toISOString() : null,
                rejectedAt: faker.datatype.boolean() ? faker.date.past().toISOString() : null,
                rejectionReason: faker.datatype.boolean() ? faker.lorem.sentence() : null,
                deletedAt: faker.date.past().toISOString(),
                deletedReason: faker.lorem.sentence()
            };
        default:
            return {
                isApproved: false,
                approvedAt: null,
                rejectedAt: null,
                rejectionReason: null,
                deletedAt: null,
                deletedReason: null
            };
    }
};

function makeReviewDetail(overrides: Partial<StoredReview> = {}): StoredReview {
    const id = overrides._id ?? makeId("r_");
    const tourId = overrides.tourId ?? makeId("t_");
    const userId = overrides.userId ?? makeId("u_");
    const createdAt = overrides.createdAt ?? faker.date.past({ years: 2 }).toISOString();
    const updatedAt = overrides.updatedAt ?? faker.date.between({ from: createdAt, to: new Date() }).toISOString();
    const rating = overrides.rating ?? faker.number.int({ min: 1, max: 5 });

    // Generate image URLs
    const imageCount = overrides.imageCount ?? (faker.datatype.boolean(0.3) ? faker.number.int({ min: 1, max: 5 }) : 0);
    const imageUrls = overrides.imageUrls ?? (
        imageCount > 0
            ? Array.from({ length: imageCount }, () =>
                faker.image.urlLoremFlickr({ category: "travel", width: 800, height: 600 })
            )
            : []
    );

    // Generate replies
    const replies: ReviewReplyDTO[] = (overrides.replies ?? []).length > 0
        ? overrides.replies!
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        : Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, (_, index) => {
            const replyStatus = generateReplyStatus();
            const replyCreatedAt = faker.date.between({ from: createdAt, to: new Date() }).toISOString();

            return {
                _id: makeId("rep_"),
                employeeId: makeId("emp_"),
                employeeName: faker.person.fullName(),
                employeeAvatar: faker.datatype.boolean(0.7) ? faker.image.avatar() : null,
                message: faker.lorem.paragraphs({ min: 1, max: 2 }),
                isApproved: replyStatus.isApproved,
                createdAt: replyCreatedAt,
                updatedAt: faker.date.between({ from: replyCreatedAt, to: new Date() }).toISOString(),
                deletedAt: replyStatus.deletedAt,
                approvedAt: replyStatus.approvedAt,
                rejectedAt: replyStatus.rejectedAt,
                rejectionReason: replyStatus.rejectionReason,
                deletedReason: replyStatus.deletedReason
            };
        });

    const tripType = overrides.tripType ?? generateTravelType();
    const travelDate = overrides.travelDate ?? (
        faker.datatype.boolean(0.8)
            ? faker.date.past({ years: 1 }).toISOString()
            : null
    );

    // Generate review status
    const reviewStatus = generateReviewStatus();

    // Generate helpful votes if not provided
    const helpfulCount = overrides.helpfulCount ?? faker.number.int({ min: 0, max: 200 });
    const helpfulVotes = overrides.helpfulVotes ?? Array.from(
        { length: helpfulCount },
        () => ({
            user: makeId("v_"),
            helpful: true,
            createdAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
            updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString()
        })
    );

    const base: StoredReview = {
        _id: id,
        tourId,
        tourTitle: overrides.tourTitle ?? faker.lorem.words({ min: 2, max: 6 }),
        userId,
        userName: overrides.userName ?? faker.person.fullName(),
        rating,
        title: overrides.title ?? (faker.datatype.boolean(0.7) ? faker.lorem.sentence() : null),
        comment: overrides.comment ?? faker.lorem.paragraphs({ min: 1, max: 3 }),
        imageCount,
        imageUrls,
        tripType,
        travelDate,
        isApproved: reviewStatus.isApproved,
        helpfulCount,
        createdAt,
        updatedAt,
        deletedAt: reviewStatus.deletedAt,
        replies,
        userAvatar: overrides.userAvatar ?? (faker.datatype.boolean(0.6) ? faker.image.avatar() : null),
        userEmail: overrides.userEmail ?? faker.internet.email(),
        tourSlug: overrides.tourSlug ?? faker.helpers.slugify(faker.lorem.words({ min: 2, max: 4 })) + `-${tourId.slice(-8)}`,
        tourHeroImage: overrides.tourHeroImage ?? (faker.datatype.boolean(0.8)
            ? faker.image.urlLoremFlickr({ category: "nature", width: 1200, height: 800 })
            : null),
        helpfulVotes
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
        // Filter by tourId
        if (filters.tourId && r.tourId !== filters.tourId) return false;

        // Filter by approval status
        if (typeof filters.isApproved === 'boolean' && r.isApproved !== filters.isApproved) return false;

        // Filter by rating range
        if (filters.ratingMin !== undefined && r.rating < Number(filters.ratingMin)) return false;
        if (filters.ratingMax !== undefined && r.rating > Number(filters.ratingMax)) return false;

        // Filter by images
        if (filters.hasImages != null) {
            const has = (r.imageUrls?.length ?? 0) > 0;
            if (filters.hasImages !== has) return false;
        }

        // Filter by trip type
        if (filters.tripType && r.tripType !== filters.tripType) return false;

        // Filter by search query
        if (filters.query) {
            const q = String(filters.query).toLowerCase();
            const field = filters.queryField ?? "comment";
            let val = "";

            switch (field) {
                case "comment":
                    val = r.comment?.toLowerCase() || "";
                    break;
                case "title":
                    val = (r.title || "").toLowerCase();
                    break;
                case "userName":
                    val = (r.userName || "").toLowerCase();
                    break;
                case "tourTitle":
                    val = (r.tourTitle || "").toLowerCase();
                    break;
                case "userEmail":
                    val = (r.userEmail || "").toLowerCase();
                    break;
            }

            if (!val.includes(q)) return false;
        }

        // Filter by deleted status
        if (!filters.includeDeleted && r.deletedAt) return false;

        // Filter by date range
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
        if (sortField === "createdAt" || sortField === "updatedAt" ) {
            const dateA = Date.parse(va as string);
            const dateB = Date.parse(vb as string);
            return (dateA - dateB) * dir;
        }

        // Handle number fields
        if (sortField === "rating" || sortField === "helpfulCount" ) {
            return (va as number - (vb as number)) * dir;
        }

        // Handle boolean fields
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
        imageCount: r.imageCount,
        tripType: r.tripType ?? null,
        travelDate: r.travelDate ?? null,
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
        imageUrls: r.imageUrls,
    };
}

// Helper functions for specific operations
function findReviewById(reviewId: ObjectIdStr): StoredReview | undefined {
    return DB.reviews.find(r => r._id === reviewId && !r.deletedAt);
}

function findReviewWithDeleted(reviewId: ObjectIdStr): StoredReview | undefined {
    return DB.reviews.find(r => r._id === reviewId);
}

function updateReview(reviewId: ObjectIdStr, updates: Partial<StoredReview>): StoredReview | undefined {
    const index = DB.reviews.findIndex(r => r._id === reviewId);
    if (index === -1) return undefined;

    DB.reviews[index] = {
        ...DB.reviews[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    return DB.reviews[index];
}

function findReply(reviewId: ObjectIdStr, replyId: ObjectIdStr) {
    const review = findReviewById(reviewId);
    if (!review) return null;

    const reply = review.replies.find(r => r._id === replyId);
    return { review, reply };
}

// Export everything
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
    findReviewById,
    findReviewWithDeleted,
    updateReview,
    findReply,
};