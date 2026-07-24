// app/api/operations/tours/v1/[tourId]/history/route.ts
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import ConnectDB from "@/config/db";
import { ApiError, withErrorHandler } from "@/lib/helpers/withErrorHandler";
import { resolveMongoId } from "@/lib/helpers/resolveMongoId";
import TourAnalyticsModel from "@/models/tours/tour-analytics.model";
import UserModel from "@/models/user.model";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { USER_ROLE } from "@/constants/current-user/user.const";
import {
    TourHistoryRunDTO,
    TourHistoryAggregateDTO,
    TourHistoryDTO,
    MonthlyRevenue,
} from "@/types/tour/tour-history.types";

/**
 * GET  /api/operations/tours/v1/[tourId]/history
 *
 * Returns ALL analytics runs for a single tour.
 * Also returns an aggregate summary across all runs.
 * Revenue is only returned if the user is a GUIDE.
 */
export const GET = withErrorHandler(async (
    _request: NextRequest,
    { params }: { params: Promise<{ tourId: string }> }
) => {
    const rawTourId = (await params).tourId;
    const tourId = resolveMongoId(rawTourId);

    if (!tourId || !mongoose.Types.ObjectId.isValid(tourId)) {
        throw new ApiError("Invalid tour ID", 400);
    }

    await ConnectDB();

    // Check user role
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    const user = await UserModel.findById(userId).select("role").lean();
    if (!user) {
        throw new ApiError("User not found", 404);
    }

    const isGuide = user.role === USER_ROLE.GUIDE;

    // Fetch ALL analytics records for this tour, sorted newest first
    const analyticsRecords = await TourAnalyticsModel.find({
        tourId: new mongoose.Types.ObjectId(tourId),
    })
        .sort({ createdAt: -1 })
        .lean();

    if (!analyticsRecords || analyticsRecords.length === 0) {
        throw new ApiError("No analytics records found for this tour", 404);
    }

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const monthMap = new Map<string, MonthlyRevenue>();

    // Map each record to a run DTO
    const runs: TourHistoryRunDTO[] = analyticsRecords.map((a) => {
        // Calculate revenue for grouping
        const revenue = a.totalRevenue || 0;
        
        if (isGuide) {
            // Group monthly revenue based on departure date (fallback to createdAt)
            const dateStr = a.departure?.date ? new Date(a.departure.date) : new Date(a.createdAt as Date);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthStr = monthNames[dateStr.getMonth()] + " " + dateStr.getFullYear();
            const monthKey = `${dateStr.getFullYear()}-${dateStr.getMonth()}`;

            if (!monthMap.has(monthKey)) {
                monthMap.set(monthKey, {
                    month: monthStr,
                    year: dateStr.getFullYear(),
                    monthNum: dateStr.getMonth(),
                    revenue: 0,
                });
            }
            monthMap.get(monthKey)!.revenue += revenue;
        }

        return {
            analyticsId:    (a._id as mongoose.Types.ObjectId).toString(),
            tourId:         a.tourId.toString(),
            companyId:      a.companyId.toString(),
            uniqueTourCode: a.uniqueTourCode,

            engagement: {
                viewCount:  a.viewCount || 0,
                likeCount:  a.likeCount || 0,
                shareCount: a.shareCount || 0,
            },

            bookingStats: {
                totalBookings: a.totalBookings || 0,
                totalRevenue:  isGuide ? revenue : undefined,
                occupancyRate: a.occupancyRate || 0,
                seatsTotal:    a.seatsTotal || 0,
                seatsBooked:   a.seatsBooked || 0,
            },

            reviewSummary: {
                totalReviews:    a.reviewCount || 0,
                averageRating:   a.averageRating || 0,
                ratingBreakdown: { ...ratingBreakdown },
            },

            pricing: {
                baseAmount:         isGuide ? (a.basePrice?.amount ?? 0) : undefined,
                currency:           a.basePrice?.currency ?? "BDT",
                hasActiveDiscounts: (a.discounts?.length ?? 0) > 0,
                discountCount:      a.discounts?.length ?? 0,
            },

            departure: {
                date:         a.departure?.date
                                  ? new Date(a.departure.date).toISOString()
                                  : null,
                seatsTotal:   a.departure?.seatsTotal ?? 0,
                seatsBooked:  a.departure?.seatsBooked ?? 0,
                meetingPoint: a.departure?.meetingPoint ?? null,
            },

            operatingWindow: a.operatingWindow
                ? {
                      startDate: new Date(a.operatingWindow.startDate).toISOString(),
                      endDate:   new Date(a.operatingWindow.endDate).toISOString(),
                  }
                : null,

            createdAt:   new Date(a.createdAt as Date).toISOString(),
            lastUpdated: new Date(a.updatedAt as Date).toISOString(),
        };
    });

    // Compute aggregate across all runs
    const totalRuns = runs.length;
    const totalBookingsAllRuns  = runs.reduce((s, r) => s + r.bookingStats.totalBookings, 0);
    const totalViewsAllRuns     = runs.reduce((s, r) => s + r.engagement.viewCount, 0);
    const totalLikesAllRuns     = runs.reduce((s, r) => s + r.engagement.likeCount, 0);
    const totalSharesAllRuns    = runs.reduce((s, r) => s + r.engagement.shareCount, 0);
    const totalReviewsAllRuns   = runs.reduce((s, r) => s + r.reviewSummary.totalReviews, 0);

    const averageOccupancyRate = totalRuns > 0
        ? Number((runs.reduce((s, r) => s + r.bookingStats.occupancyRate, 0) / totalRuns).toFixed(2))
        : 0;

    // Weighted average rating across runs (weight = totalReviews per run)
    const weightedRatingSum = runs.reduce((s, r) => s + r.reviewSummary.averageRating * r.reviewSummary.totalReviews, 0);
    const overallAverageRating = totalReviewsAllRuns > 0
        ? Number((weightedRatingSum / totalReviewsAllRuns).toFixed(2))
        : 0;

    const aggregate: TourHistoryAggregateDTO = {
        totalRuns,
        totalBookingsAllRuns,
        totalViewsAllRuns,
        totalLikesAllRuns,
        totalSharesAllRuns,
        averageOccupancyRate,
        overallAverageRating,
        totalReviewsAllRuns,
    };

    if (isGuide) {
        aggregate.totalRevenueAllRuns = runs.reduce((s, r) => s + (r.bookingStats.totalRevenue || 0), 0);
        aggregate.monthlyRevenue = Array.from(monthMap.values()).sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.monthNum - a.monthNum; // newest first
        });
    }

    const dto: TourHistoryDTO = {
        tourId: tourId.toString(),
        aggregate,
        runs,
    };

    return { data: dto, status: 200 };
});
