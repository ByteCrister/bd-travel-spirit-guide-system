// overview.types.ts
import {
    GUIDE_STATUS,
    GuideDocumentCategory,
    GuideDocumentType,
    GuideSocialPlatform,
    GuideStatus,
    SubscriptionStatus,
} from "@/constants/guide/guide.const";

/* Editable wrapper */
export type Editable<T> = {
    value: T;
    dirty?: boolean;
    saving?: boolean;
    error?: string | null;
    meta?: Record<string, unknown>;
};

type DraftKeys = keyof EditableGuideOverview;

/* IDs for client-side mutable lists */
export type ClientId = string;

/* GuideDocument type (unchanged except clarified id) */
export type GuideDocument = {
    id?: string; // file id or storage id (optional for server-created items)
    category: GuideDocumentCategory;
    fileType: GuideDocumentType;
    fileName?: string;
    fileUrl: string;
    uploadedAt?: string; // ISO date
};

/* Social entry with optional stable id so UI/store can address items */
export type GuideSocialEntry = {
    id?: ClientId; // optional client-side id to support add/update/remove/reorder
    platform: GuideSocialPlatform;
    url: string;
};

/* Subscription related types (unchanged) */
export type SubscriptionCursor = string;
export type SubscriptionPage = {
    items: SubscriptionHistoryEntry[];
    nextCursor?: SubscriptionCursor | null;
    hasMore: boolean;
};

export type LoadMoreSubscriptionsResult =
    | { status: "success"; added: number; hasMore: boolean }
    | { status: "noMore" }
    | { status: "error"; error: string };

export type SubscriptionHistoryEntry = {
    id?: string;
    startDate: string;
    endDate: string;
    amount: number;
    currency: string;
    status: SubscriptionStatus;
    paymentProvider?: string;
    paymentId?: string;
    method?: string;
    autoRenew: boolean;
    failureCount?: number;
    cancelledAt?: string | null;
    refunded?: boolean;
    notes?: string;
    createdAt?: string;
};

export type CurrentSubscription = {
    status: SubscriptionStatus;
    currentPeriodStart?: string | null;
    currentPeriodEnd?: string | null;
    autoRenew?: boolean;
    lastPaymentId?: string | null;
    amount?: number | null;
    currency?: string | null;
};

/* Owner */
export type GuideOwner = {
    name: string;
    email: string;
    phone?: string | null;
    oauthProvider?: string | null;
};

/* Aggregates */
export type GuideAggregates = {
    totalAvgRating: number;
    totalEmployees: number;
    totalReports: number;
    totalReviews: number;
    totalFaqs: number;
};

/* Primary UI model */
export type GuideOverview = {
    companyId?: string;
    companyName: string;
    bio?: string | null;
    social: GuideSocialEntry[];
    owner: GuideOwner;
    documents: GuideDocument[];
    subscriptionHistory: SubscriptionHistoryEntry[];
    currentSubscription?: CurrentSubscription | null;
    status: GuideStatus;
    isSuspended?: boolean;
    isActive?: boolean;
    hasActiveSubscription?: boolean;
    aggregates?: GuideAggregates;
};

/* Editable variant */
export type EditableGuideOverview = {
    companyId?: string;
    companyName: Editable<string>;
    bio: Editable<string | null>;
    social: Editable<GuideSocialEntry[]>;
    owner: {
        name: Editable<string>;
        email: string; // read-only
        phone: Editable<string | null>;
        oauthProvider?: string | null;
    };
    documents: Editable<GuideDocument[]>;
    subscriptionHistory: SubscriptionHistoryEntry[];
    currentSubscription: Editable<CurrentSubscription | null>;
    status: Editable<GuideStatus>;
    isSuspended?: boolean;
    isActive?: boolean;
    hasActiveSubscription?: boolean;
    aggregates?: GuideAggregates;
};

/* API DTOs */
export type GetGuideOverviewResponse = {
    ok: boolean;
    data: GuideOverview;
    errors?: null | string[];
};

export type UpdateGuideOverviewRequest = {
    companyName?: string;
    bio?: string | null;
    social?: {
        id?: ClientId;
        platform: GuideSocialPlatform;
        url: string;
    }[];
    owner?: {
        name?: string;
        phone?: string | null;
    };
    // documents allow partial metadata updates or reorder; uploads/deletes via separate endpoints
    documents?: Partial<GuideDocument>[];
    currentSubscription?: Partial<CurrentSubscription> | null;
    status?: GuideStatus;
};

export type UpdateGuideOverviewResponse = {
    ok: boolean;
    data?: GuideOverview;
    errors?: string[] | null;
};

export type GetSubscriptionsResponsePaged = {
    ok: boolean;
    data: { subscriptionHistory: SubscriptionHistoryEntry[]; page?: SubscriptionPage };
    errors?: string[] | null;
};

/* Zustand store shape */
export type GuideOverviewStore = {
    original?: GuideOverview | null;
    draft: EditableGuideOverview | null;
    loading: boolean;
    saving: boolean;
    error?: string | null;
    subscriptionsCursor: string | null;
    subscriptionsLoadingMore: boolean;
    subscriptionsHasMore: boolean;

    // lifecycle
    load: () => Promise<void>;
    setField: <K extends DraftKeys>(key: K, value: EditableGuideOverview[K]) => void;
    patchField: <K extends DraftKeys>(key: K, patch: Partial<EditableGuideOverview[K]>) => void;
    markDirty: (path: string) => void;
    revertDraft: () => void;
    saveDraft: () => Promise<UpdateGuideOverviewResponse>;

    // social CRUD
    addSocial: (entry: GuideSocialEntry) => void;
    updateSocial: (id: ClientId | undefined, patch: Partial<GuideSocialEntry>) => void;
    removeSocial: (id: ClientId) => void;
    reorderSocial: (newOrder: ClientId[]) => void;

    // document CRUD
    addDocument: (doc: GuideDocument) => void;
    updateDocument: (id: string | undefined, patch: Partial<GuideDocument>) => void;
    removeDocument: (id: string) => void;

    loadMoreSubscriptions: (pageSize?: number) => Promise<LoadMoreSubscriptionsResult>;
    refreshSubscriptionHistory: () => Promise<{ ok: boolean; error?: string | null }>;
    validateDraft: () => { valid: boolean; errors: Record<string, string> | null };
};

/* Utility: empty draft factory */
export const createEmptyEditableGuide = (): EditableGuideOverview => ({
    companyId: undefined,
    companyName: { value: "", dirty: false },
    bio: { value: null, dirty: false },
    social: { value: [], dirty: false },
    owner: {
        name: { value: "", dirty: false },
        email: "",
        phone: { value: null, dirty: false },
        oauthProvider: null,
    },
    documents: { value: [], dirty: false },
    subscriptionHistory: [],
    currentSubscription: { value: null, dirty: false },
    status: { value: GUIDE_STATUS.PENDING, dirty: false },
    isSuspended: false,
    isActive: false,
    hasActiveSubscription: false,
    aggregates: {
        totalAvgRating: 0,
        totalEmployees: 0,
        totalReports: 0,
        totalReviews: 0,
        totalFaqs: 0,
    },
});
