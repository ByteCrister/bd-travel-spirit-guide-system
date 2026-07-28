import { ApiResponse } from "../common/api.types";

/* ------------------------------------------------------------------ */
/*  Core Domain Entities                                              */
/* ------------------------------------------------------------------ */

export interface TourInfo {
    _id: string;
    title: string;
    slug: string;
}

export interface TravelerInfo {
    _id: string;
    name: string;
    avatar?: string;
    email: string;
}

export interface FAQVoteEntry {
    _id: string;
    user: string | TravelerInfo;
    createdAt: string;
}

export interface FAQ {
    _id: string;
    tour: string | TourInfo;
    question: string;
    answer?: string;
    status: 'pending' | 'approved' | 'rejected';
    isActive: boolean;
    order: number;
    askedBy: TravelerInfo;
    answeredBy?: TravelerInfo;
    likes: FAQVoteEntry[];
    dislikes: FAQVoteEntry[];
    reports: unknown[];
    likeCount: number;
    dislikeCount: number;
    isAnswered: boolean;
    userVote?: 'like' | 'dislike' | null;
    createdAt: string;
    updatedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Pagination & Filtering                                            */
/* ------------------------------------------------------------------ */

export interface PaginationMeta {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
}

export interface FAQFilterParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export type FAQListApiResponse = ApiResponse<{
    faqs: FAQ[];
    pagination: PaginationMeta;
}>;

/* ------------------------------------------------------------------ */
/*  FAQ Votes (separate endpoint)                                     */
/* ------------------------------------------------------------------ */

export interface FAQVoteRecord {
    _id: string;
    faqId: string;
    userId: string | TravelerInfo;   // populated user
    type: 'like' | 'dislike';
    createdAt: string;
}

export interface FAQVoteFilterParams {
    page?: number;
    limit?: number;
    type?: 'like' | 'dislike';       // filter by vote type
}

export type FAQVotesApiResponse = ApiResponse<{
    votes: FAQVoteRecord[];
    pagination: PaginationMeta;
}>;

/* ------------------------------------------------------------------ */
/*  FAQ Stats                                                         */
/* ------------------------------------------------------------------ */

export interface FAQStats {
    totalFAQs: number;
    totalApproved: number;
    totalPending: number;
    totalRejected: number;
    totalLikes: number;
    totalDislikes: number;
    // add any other aggregate you need
}

export type FAQStatsApiResponse = ApiResponse<FAQStats>;

/* ------------------------------------------------------------------ */
/*  API response aliases (keeping generic ApiResponse for some)       */
/* ------------------------------------------------------------------ */

export type AllFAQsApiResponse = ApiResponse<FAQ[]>;           // maybe keep for legacy
export type FAQActivationApiResponse = ApiResponse<FAQ>;
export type FAQReorderApiResponse = ApiResponse<{
    tourId: string;
    faqs: FAQ[];
}>;

/* ------------------------------------------------------------------ */
/*  Zustand Store State                                               */
/* ------------------------------------------------------------------ */

export interface FAQCacheEntry {
    data: FAQ[];
    pagination: PaginationMeta | null;
    lastFetched: number;
    isLoading: boolean;
    error: string | null;
}

export interface FAQVoteCacheEntry {
    votes: FAQVoteRecord[];
    pagination: PaginationMeta;
    isLoading: boolean;
    error: string | null;
}

export interface FAQStoreState {
    /** Cached FAQs with pagination */
    allFAQs: FAQCacheEntry;

    /** Votes per FAQ, keyed by faqId */
    faqVotes: Record<string, FAQVoteCacheEntry>;

    /** Global FAQ stats */
    stats: FAQStats | null;
    statsLoading: boolean;
    statsError: string | null;

    /** Fetch FAQs with optional filters & pagination */
    fetchFAQs: (params?: FAQFilterParams) => Promise<void>;

    /** Toggle isActive for a single FAQ (optimistic) */
    toggleFAQActive: (faqId: string) => Promise<void>;

    /** Change the display order of a FAQ (optimistic) */
    updateFAQOrder: (faqId: string, newOrder: number) => Promise<void>;

    /** Fetch paginated votes for a specific FAQ */
    fetchFAQVotes: (faqId: string, params?: FAQVoteFilterParams) => Promise<void>;

    /** Fetch aggregate FAQ stats */
    fetchFAQStats: () => Promise<void>;
}