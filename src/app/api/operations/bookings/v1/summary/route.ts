// app/api/operations/bookings/summary/route.ts
import mongoose from "mongoose";
import { getUserIdFromSession } from "@/lib/auth/session.auth";
import { UserModel } from "@/models/user.model";
import { USER_ROLE } from "@/constants/current-user/user.const";
import { BookingStatusCount } from "@/types/tour/booking.types";
import EmployeeModel from "@/models/employees/employees.model";
import GuideModel from "@/models/guide/guide.model";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import { withErrorHandler, HandlerResult, ApiError } from "@/lib/helpers/withErrorHandler";
import ConnectDB from "@/config/db";

/**
 * Main handler – returns a HandlerResult<BookingStatusCount>.
 * Errors are thrown as ApiError (or regular Error) and caught by withErrorHandler.
 */
async function getBookingSummary(): Promise<HandlerResult<BookingStatusCount>> {
    // 1. Get current user
    const userId = await getUserIdFromSession();
    if (!userId) {
        throw new ApiError("Unauthorized", 401);
    }

    await ConnectDB();

    // 2. Fetch user role
    const user = await UserModel.findById(userId).select("role").lean();
    if (!user) {
        throw new ApiError("User not found", 404);
    }

    let companyId: mongoose.Types.ObjectId | null = null;

    // 3. Resolve companyId based on role
    if (user.role === USER_ROLE.ASSISTANT) {
        const employee = await EmployeeModel.findOne({ user: userId })
            .select("companyId")
            .lean();
        if (!employee?.companyId) {
            throw new ApiError("Assistant not linked to any company", 403);
        }
        companyId = new mongoose.Types.ObjectId(employee.companyId.toString());
    } else if (user.role === USER_ROLE.GUIDE) {
        const guide = await GuideModel.findOne({ "owner.user": userId })
            .select("_id")
            .lean();
        if (!guide) {
            throw new ApiError("Guide profile not found", 404);
        }
        companyId = new mongoose.Types.ObjectId(guide._id.toString());
    } else {
        throw new ApiError("Invalid user role for booking summary", 403);
    }

    // 4. Find all tours belonging to this company (not soft‑deleted)
    const tours = await TourModel.find({ companyId, deletedAt: null })
        .select("_id")
        .lean();
    const tourIds = tours.map((t) => t._id);

    if (tourIds.length === 0) {
        return {
            data: {
                pending: 0,
                confirmed: 0,
                cancelled: 0,
                refunded: 0,
                completed: 0,
                total: 0,
            },
        };
    }

    // 5. Aggregate booking counts by status (exclude soft‑deleted bookings)
    const aggregation = await BookingModel.aggregate([
        { $match: { tour: { $in: tourIds }, deletedAt: null } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts: Partial<BookingStatusCount> = {};
    let total = 0;
    for (const item of aggregation) {
        const status = item._id as keyof BookingStatusCount;
        counts[status] = item.count;
        total += item.count;
    }

    const summary: BookingStatusCount = {
        pending: counts.pending || 0,
        confirmed: counts.confirmed || 0,
        cancelled: counts.cancelled || 0,
        refunded: counts.refunded || 0,
        completed: counts.completed || 0,
        total,
    };

    return { data: summary };
}

// Exported GET handler wrapped with the official error handler
export const GET = withErrorHandler(getBookingSummary);