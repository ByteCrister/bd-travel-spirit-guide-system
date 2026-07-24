// src/types/tour/tour-history.types.ts

export interface TourHistoryRunDTO {
    analyticsId: string;
    tourId: string;
    companyId: string;
    uniqueTourCode: string;

    engagement: {
        viewCount: number;
        likeCount: number;
        shareCount: number;
    };

    bookingStats: {
        totalBookings: number;
        totalRevenue?: number; // Optional based on role
        occupancyRate: number;
        seatsTotal: number;
        seatsBooked: number;
    };

    reviewSummary: {
        totalReviews: number;
        averageRating: number;
        ratingBreakdown: Record<number, number>;
    };

    pricing: {
        baseAmount?: number; // Optional based on role
        currency: string;
        hasActiveDiscounts: boolean;
        discountCount: number;
    };

    departure: {
        date: string | null;
        seatsTotal: number;
        seatsBooked: number;
        meetingPoint: string | null;
    };

    operatingWindow: {
        startDate: string;
        endDate: string;
    } | null;

    createdAt: string;
    lastUpdated: string;
}

export interface MonthlyRevenue {
    month: string; // e.g., "Jan 2026"
    year: number;
    monthNum: number;
    revenue: number;
}

export interface TourHistoryAggregateDTO {
    totalRuns: number;
    totalBookingsAllRuns: number;
    totalRevenueAllRuns?: number; // Optional based on role
    totalViewsAllRuns: number;
    totalLikesAllRuns: number;
    totalSharesAllRuns: number;
    averageOccupancyRate: number;
    overallAverageRating: number;
    totalReviewsAllRuns: number;
    monthlyRevenue?: MonthlyRevenue[]; // Optional based on role
}

export interface TourHistoryDTO {
    tourId: string;
    aggregate: TourHistoryAggregateDTO;
    runs: TourHistoryRunDTO[];
}
