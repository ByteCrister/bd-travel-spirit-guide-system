// tour.types.ts
import {
    Division,
    District,
    TravelType,
    DifficultyLevel,
    AudienceType,
    TourCategories,
    TourStatus,
    ModerationStatus,
    AgeSuitability,
    PaymentMethod,
    Currency,
    TransportMode,
    Season,
    AccommodationType,
    TourDiscount,
    TourDiscountType,
    MealsProvided,
} from "@/constants/tour.const";

/* =============== SUB TYPES (Mirroring Model Structure) =============== */

export interface TourCompanyInfo {
    id: string;
    name: string;
    createdAt: string;
}

export interface TourAuthorInfo {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
}

// =============== PRICE & DISCOUNT TYPES ===============
export interface PriceDTO {
    amount: number;
    currency: Currency;
}

export interface DiscountDTO {
    type: TourDiscountType;
    discount: TourDiscount;
    value: number;
    code?: string;
    validFrom?: string;
    validUntil?: string;
}

// =============== DESTINATION & ATTRACTION TYPES ===============
export interface GeoPointDTO {
    lat: number;
    lng: number;
}

export interface AttractionDTO {
    id?: string;
    title: string;
    description?: string;
    bestFor?: string;
    insiderTip?: string;
    address?: string;
    openingHours?: string;
    imageIds?: { id: string; url: string }[];
    coordinates?: GeoPointDTO;
}

export interface ActivityDTO {
    title: string;
    url?: string;
    provider?: string;
    duration?: string;
    price?: PriceDTO;
    rating?: number;
}

export interface DestinationBlockDTO {
    id?: string;
    description?: string;
    highlights?: string[];
    attractions?: AttractionDTO[];
    activities?: ActivityDTO[];
    imageIds?: { id: string; url: string }[];
    coordinates?: GeoPointDTO;
}

// =============== ITINERARY TYPES ===============
export interface ItineraryEntryDTO {
    day: number;
    title?: string;
    description?: string;
    mealsProvided?: MealsProvided[];//
    accommodation?: string;
    activities?: string[];
    travelDistance?: string;
    travelMode?: TransportMode;//
    estimatedTime?: string;
    importantNotes?: string[];
}

// =============== INCLUSION/EXCLUSION TYPES ===============
export interface InclusionDTO {
    label: string;
    description?: string;
}

export interface ExclusionDTO {
    label: string;
    description?: string;
}

// =============== LOGISTICS TYPES ===============
export interface PackingListItemDTO {
    item: string;
    required: boolean;
    notes?: string;
}

export interface AddressDTO {
    line1?: string;
    line2?: string;
    city?: string;
    district?: string;
    region?: string;
    postalCode?: string;
}

// =============== SCHEDULE TYPES ===============
export interface OperatingWindowDTO {
    startDate: string;
    endDate: string;
    seatsTotal?: number;
    seatsBooked?: number;
}

export interface DepartureDTO {
    date: string;
    seatsTotal: number;
    seatsBooked: number;
    meetingPoint?: string;
    meetingCoordinates?: GeoPointDTO;
}

// =============== POLICY TYPES ===============
export interface CancellationRuleDTO {
    daysBefore: number;
    refundPercent: number;
}

export interface CancellationPolicyDTO {
    refundable: boolean;
    rules: CancellationRuleDTO[];
}

export interface RefundPolicyDTO {
    method: PaymentMethod[];
    processingDays: number;
}

// =============== TRANSLATION TYPES ===============
export interface TranslationBlockDTO {
    bn?: {
        title?: string;
        summary?: string;
        description?: string;
    };
    en?: {
        title?: string;
        summary?: string;
        description?: string;
    };
}

// =============== ACCESSIBILITY TYPES ===============
export interface AccessibilityDTO {
    wheelchair?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
    notes?: string;
}

// =============== EMERGENCY CONTACTS ===============
export interface EmergencyContactsDTO {
    policeNumber?: string;
    ambulanceNumber?: string;
    fireServiceNumber?: string;
    localEmergency?: string;
}

/* =============== MAIN TOUR DTO =============== */

/**
 * Complete tour detail DTO aligned with the MongoDB model
 * All fields directly map to the ITour interface
 */
export interface TourDetailDTO {
    // =============== IDENTITY & BASIC INFO ===============
    id: string;
    title: string;
    slug: string;
    tourCode: string;
    status: TourStatus;
    summary: string;
    heroImage?: string; // Actual cloudinary asset urls using Asset model ID
    gallery?: string[]; // Actual cloudinary asset urls using Asset model ID
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };

    // =============== BANGLADESH-SPECIFIC FIELDS ===============
    tourType: TravelType;
    division: Division;
    district: District;
    accommodationType?: AccommodationType[];
    guideIncluded: boolean;
    transportIncluded: boolean;
    emergencyContacts?: EmergencyContactsDTO;

    // =============== CONTENT & ITINERARY ===============
    destinations?: DestinationBlockDTO[];
    itinerary?: ItineraryEntryDTO[];
    inclusions?: InclusionDTO[];
    exclusions?: ExclusionDTO[];
    difficulty: DifficultyLevel;
    bestSeason: Season[];
    audience?: AudienceType[];
    categories?: TourCategories[];
    translations?: TranslationBlockDTO;

    // =============== LOGISTICS ===============
    mainLocation?: {
        address?: AddressDTO;
        coordinates?: GeoPointDTO;
    };
    transportModes?: TransportMode[];
    pickupOptions?: {
        city?: string;
        price?: number;
        currency?: Currency;
    }[];
    meetingPoint?: string;
    packingList?: PackingListItemDTO[];

    // =============== PRICING & COMMERCE ===============
    basePrice: PriceDTO;
    discounts?: DiscountDTO[];
    duration?: {
        days: number;
        nights?: number;
    };
    operatingWindows?: OperatingWindowDTO[];
    departures?: DepartureDTO[];
    paymentMethods: PaymentMethod[];

    // =============== COMPLIANCE & ACCESSIBILITY ===============
    licenseRequired?: boolean;
    ageSuitability: AgeSuitability;
    accessibility?: AccessibilityDTO;

    // =============== POLICIES ===============
    cancellationPolicy?: CancellationPolicyDTO;
    refundPolicy?: RefundPolicyDTO;
    terms?: string;

    // =============== ENGAGEMENT & RATINGS ===============
    ratings?: {
        average: number;
        count: number;
    };
    wishlistCount: number;
    featured: boolean;

    // =============== MODERATION ===============
    moderationStatus: ModerationStatus;
    rejectionReason?: string;
    completedAt?: string;
    reApprovalRequestedAt?: string;

    // =============== SYSTEM FIELDS ===============
    companyInfo: TourCompanyInfo;
    authorInfo: TourAuthorInfo;
    tags?: string[];
    publishedAt?: string;
    viewCount: number;
    likeCount: number;
    shareCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;

    // =============== COMPUTED/UI-ONLY FIELDS (Not in model) ===============
    // These are calculated or derived for UI convenience
    priceSummary?: {
        minAmount: number;
        maxAmount: number;
        currency: string;
        discountedAmount?: number;
    };
    bookingSummary?: {
        totalSeats: number;
        bookedSeats: number;
        availableSeats: number;
        isFull: boolean;
        occupancyPercentage: number;
    };
    nextDeparture?: string;
    isUpcoming?: boolean;
    isExpired?: boolean;
    hasActiveDiscount?: boolean;
}

/* =============== LIGHTWEIGHT LIST DTO =============== */

/**
 * Lightweight tour list item for tables and listings
 */
export interface TourListItemDTO {
    id: string;
    title: string;
    slug: string;
    tourCode?: string;
    status: TourStatus;
    summary: string;
    heroImage?: string;

    // Basic info
    tourType: TravelType;
    division: Division;
    district: District;
    difficulty: DifficultyLevel;

    // Pricing
    basePrice: PriceDTO;
    hasActiveDiscount?: boolean;
    activeDiscountValue?: number;

    // Schedule
    duration?: {
        days: number;
        nights?: number;
    };
    nextDeparture?: string;

    // Stats
    ratings?: {
        average: number;
        count: number;
    };
    wishlistCount: number;
    viewCount: number;
    likeCount: number;
    shareCount: number;

    // Moderation
    moderationStatus: ModerationStatus;
    featured: boolean;

    // System
    companyId: string;
    authorId: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;

    // Computed fields
    isUpcoming?: boolean;
    isExpired?: boolean;
    occupancyPercentage?: number;
}

/* =============== UTILITY TYPES =============== */

/**
 * Tour filter options for search and listings
 */
export interface TourFilterOptions {
    search?: string;
    division?: Division[];
    district?: District[];
    tourType?: TravelType[];
    difficulty?: DifficultyLevel[];
    audience?: AudienceType[];
    categories?: TourCategories[];
    minPrice?: number;
    maxPrice?: number;
    currency?: Currency;
    startDate?: string;
    endDate?: string;
    durationMin?: number;
    durationMax?: number;
    guideIncluded?: boolean;
    transportIncluded?: boolean;
    featured?: boolean;
    status?: TourStatus[];
    moderationStatus?: ModerationStatus[];
    tags?: string[];
}

/**
 * KPI cards for the overview dashboard.
 * Simple, additive metrics—avoid expensive recomputation on each render.
 */
export interface CompanyKpisDTO {
    totalTours: number;
    openReports: number;
    publishedTours: number;
    totalBookings: number; // sum of bookingInfo.users.length across tours
    avgTourRating: number; // average of tour.averageRating (simple mean)
}

/**
 * Tour sort options
 */
export type TourSortOption =
    | "title"
    | "createdAt"
    | "updatedAt"
    | "publishedAt"
    | "basePrice.amount"
    | "ratings.average"
    | "wishlistCount"
    | "viewCount"
    | "nextDeparture";

/**
 * Tour table columns for admin panel
 */
export type TourTableColumn =
    | "select"
    | "title"
    | "status"
    | "moderationStatus"
    | "tourType"
    | "division"
    | "district"
    | "difficulty"
    | "basePrice"
    | "ratings"
    | "wishlistCount"
    | "viewCount"
    | "featured"
    | "publishedAt"
    | "createdAt"
    | "actions";


// =============== CREATE TOUR PAYLOAD ===============

/**
 * Payload for creating a new tour
 * Excludes system-managed fields like engagement, moderation, and system fields
 */
export interface CreateTourDTO {
    // =============== IDENTITY & BASIC INFO ===============
    title: string;
    summary: string;
    heroImage?: string; // Asset ID
    gallery?: string[]; // Asset IDs
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };
    tags?: string[];

    status?: TourStatus;

    // =============== BANGLADESH-SPECIFIC FIELDS ===============
    tourType: TravelType;
    division: Division;
    district: District;
    accommodationType?: AccommodationType[];//
    guideIncluded?: boolean; // Default: true//
    transportIncluded?: boolean; // Default: true//
    emergencyContacts?: {
        policeNumber?: string;
        ambulanceNumber?: string;
        fireServiceNumber?: string;
        localEmergency?: string;
    };//

    // =============== CONTENT & ITINERARY ===============
    destinations?: DestinationBlockDTO[];
    itinerary?: ItineraryEntryDTO[];
    inclusions?: InclusionDTO[];
    exclusions?: ExclusionDTO[];
    difficulty: DifficultyLevel;
    bestSeason: Season[];
    audience?: AudienceType[];
    categories?: TourCategories[];
    translations?: TranslationBlockDTO;

    // =============== LOGISTICS ===============
    mainLocation?: {
        address?: AddressDTO;
        coordinates?: GeoPointDTO;
    };//
    transportModes?: TransportMode[];
    pickupOptions?: {
        city?: string;
        price?: number;
        currency?: Currency;
    }[];
    meetingPoint?: string;
    packingList?: PackingListItemDTO[];

    // =============== PRICING & COMMERCE ===============
    basePrice: PriceDTO;
    discounts?: DiscountDTO[];
    duration?: {
        days: number;
        nights?: number;
    };
    operatingWindows?: OperatingWindowDTO[];
    departures?: Omit<DepartureDTO, 'seatsBooked'>[]; // seatsBooked starts at 0 //
    paymentMethods: PaymentMethod[];

    // =============== COMPLIANCE & ACCESSIBILITY ===============
    licenseRequired?: boolean;
    ageSuitability: AgeSuitability;
    accessibility?: {
        wheelchair?: boolean;
        familyFriendly?: boolean;
        petFriendly?: boolean;
        notes?: string;
    };//

    // =============== POLICIES ===============
    cancellationPolicy?: CancellationPolicyDTO;
    refundPolicy?: RefundPolicyDTO;
    terms?: string;
}

// =============== MODULAR UPDATE PAYLOAD TYPES ===============

/**
 * Update only the hero image
 */
export interface UpdateTourHeroImageDTO {
    heroImage?: string; // Asset ID, set to null/undefined to remove
}

/**
 * Update only the gallery images
 */
export interface UpdateTourGalleryDTO {
    gallery?: string[]; // Asset IDs, replaces entire gallery
}

/**
 * Update destination images
 */
export interface UpdateDestinationImgDTO {
    destinationId: string;
    deleteImageIds: string[];
    newImages: string[];
}

/**
 * Update destination-> attractions -> images 
 */
export interface UpdateDestinationAttrImgDTO {
    destinationId: string;
    attractionId: string;
    deleteImageIds: string[];
    newImages: string[];
}

/**
 * Update basic info: title, summary, SEO, and tags
 */
export interface UpdateTourBasicInfoDTO {
    title?: string;
    summary?: string;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
    };
    tags?: string[];
}

/**
 * Update Bangladesh-specific fields
 */
export interface UpdateTourBangladeshFieldsDTO {
    tourType?: TravelType;
    division?: Division;
    district?: District;
    accommodationType?: AccommodationType[];
    guideIncluded?: boolean;
    transportIncluded?: boolean;
    emergencyContacts?: {
        policeNumber?: string;
        ambulanceNumber?: string;
        fireServiceNumber?: string;
        localEmergency?: string;
    };
}

/**
 * Update content and itinerary fields
 */
export interface UpdateTourContentItineraryDTO {
    destinations?: DestinationBlockDTO[];
    itinerary?: ItineraryEntryDTO[];
    inclusions?: InclusionDTO[];
    exclusions?: ExclusionDTO[];
    difficulty: DifficultyLevel;
    bestSeason?: Season[];
    audience?: AudienceType[];
    categories?: TourCategories[];
    translations?: TranslationBlockDTO;
}

/**
 * Update logistics fields
 */
export interface UpdateTourLogisticsDTO {
    mainLocation?: {
        address?: AddressDTO;
        coordinates?: GeoPointDTO;
    };
    transportModes?: TransportMode[];
    pickupOptions?: {
        city?: string;
        price?: number;
        currency?: Currency;
    }[];
    meetingPoint?: string;
    packingList?: PackingListItemDTO[];
}

/**
 * Update pricing and commerce fields
 */
export interface UpdateTourPricingDTO {
    basePrice?: PriceDTO;
    discounts?: DiscountDTO[];
    duration?: {
        days: number;
        nights?: number;
    };
    operatingWindows?: OperatingWindowDTO[];
    departures?: Omit<DepartureDTO, 'seatsBooked'>[];
    paymentMethods?: PaymentMethod[];
}

/**
 * Update compliance and accessibility fields
 */
export interface UpdateTourComplianceDTO {
    licenseRequired?: boolean;
    ageSuitability?: AgeSuitability;
    accessibility?: {
        wheelchair?: boolean;
        familyFriendly?: boolean;
        petFriendly?: boolean;
        notes?: string;
    };
}

/**
 * Update policies fields
 */
export interface UpdateTourPoliciesDTO {
    cancellationPolicy?: CancellationPolicyDTO;
    refundPolicy?: RefundPolicyDTO;
    terms?: string;
}

// =============== DEPARTURE MANAGEMENT PAYLOADS ===============

/**
 * Payload for adding a new departure to a tour
 */
export interface AddDepartureDTO {
    date: string;
    seatsTotal: number;
    meetingPoint?: string;
    meetingCoordinates?: GeoPointDTO;
}

/**
 * Payload for updating departure seats
 */
export interface UpdateDepartureSeatsDTO {
    seatsBooked: number;
}

/**
 * Payload for updating departure information
 */
export interface UpdateDepartureDTO {
    date?: string;
    seatsTotal?: number;
    meetingPoint?: string;
    meetingCoordinates?: GeoPointDTO;
}

// =============== UTILITY UPDATE TYPES ===============

/**
 * Complete update payload (legacy - use modular ones above)
 * @deprecated Use modular update payloads instead
 */
export type UpdateTourDTO = UpdateTourBasicInfoDTO &
    UpdateTourBangladeshFieldsDTO &
    UpdateTourContentItineraryDTO &
    UpdateTourLogisticsDTO &
    UpdateTourPricingDTO &
    UpdateTourComplianceDTO &
    UpdateTourPoliciesDTO;